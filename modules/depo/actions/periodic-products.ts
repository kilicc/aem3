"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPeriodicDistribution(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  const equipmentId = formData.get("equipment_id") as string;
  const employeeId = formData.get("employee_id") as string;
  const distributionDate = formData.get("distribution_date") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const periodMonths = parseInt(formData.get("period_months") as string) || 12;
  const notes = formData.get("notes") as string | null;

  if (!equipmentId || !employeeId || !distributionDate) {
    return { error: "Ekipman, çalışan ve dağıtım tarihi gereklidir" };
  }

  // next_renewal_date otomatik hesaplanacak (trigger ile)

  const { data, error } = await supabase
    .from("periodic_product_distributions")
    .insert({
      equipment_id: equipmentId,
      employee_id: employeeId,
      distribution_date: distributionDate,
      quantity,
      period_months: periodMonths,
      notes: notes || null,
      distributed_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Tracking kaydı oluştur
  if (data.next_renewal_date) {
    const daysUntilRenewal = Math.floor(
      (new Date(data.next_renewal_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const status = daysUntilRenewal < 0 ? "overdue" : daysUntilRenewal <= 30 ? "due_soon" : "active";

    await supabase.from("periodic_product_tracking").insert({
      distribution_id: data.id,
      equipment_id: equipmentId,
      employee_id: employeeId,
      next_renewal_date: data.next_renewal_date,
      days_until_renewal: daysUntilRenewal,
      status,
    });
  }

  // Ekipman stokundan düş
  const { data: equipment } = await supabase
    .from("equipment")
    .select("quantity")
    .eq("id", equipmentId)
    .single();

  if (equipment && equipment.quantity >= quantity) {
    await supabase
      .from("equipment")
      .update({ quantity: equipment.quantity - quantity })
      .eq("id", equipmentId);
  }

  revalidatePath("/depo/periodic-products");
  return { data };
}

export async function updatePeriodicDistribution(id: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  const equipmentId = formData.get("equipment_id") as string;
  const employeeId = formData.get("employee_id") as string;
  const distributionDate = formData.get("distribution_date") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const periodMonths = parseInt(formData.get("period_months") as string) || 12;
  const notes = formData.get("notes") as string | null;

  if (!equipmentId || !employeeId || !distributionDate) {
    return { error: "Ekipman, çalışan ve dağıtım tarihi gereklidir" };
  }

  const { data, error } = await supabase
    .from("periodic_product_distributions")
    .update({
      equipment_id: equipmentId,
      employee_id: employeeId,
      distribution_date: distributionDate,
      quantity,
      period_months: periodMonths,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Tracking kaydını güncelle
  if (data.next_renewal_date) {
    const daysUntilRenewal = Math.floor(
      (new Date(data.next_renewal_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const status = daysUntilRenewal < 0 ? "overdue" : daysUntilRenewal <= 30 ? "due_soon" : "active";

    await supabase
      .from("periodic_product_tracking")
      .upsert({
        distribution_id: id,
        equipment_id: equipmentId,
        employee_id: employeeId,
        next_renewal_date: data.next_renewal_date,
        days_until_renewal: daysUntilRenewal,
        status,
        updated_at: new Date().toISOString(),
      });
  }

  revalidatePath("/depo/periodic-products");
  revalidatePath(`/depo/periodic-products/${id}`);
  return { data };
}

export async function deletePeriodicDistribution(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  // Dağıtımı getir (stok geri vermek için)
  const { data: distribution } = await supabase
    .from("periodic_product_distributions")
    .select("equipment_id, quantity")
    .eq("id", id)
    .single();

  if (distribution) {
    // Ekipman stokuna geri ekle
    const { data: equipment } = await supabase
      .from("equipment")
      .select("quantity")
      .eq("id", distribution.equipment_id)
      .single();

    if (equipment) {
      await supabase
        .from("equipment")
        .update({ quantity: equipment.quantity + distribution.quantity })
        .eq("id", distribution.equipment_id);
    }
  }

  const { error } = await supabase
    .from("periodic_product_distributions")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/periodic-products");
  return { success: true };
}

export async function renewPeriodicDistribution(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  // Mevcut dağıtımı getir
  const { data: distribution } = await supabase
    .from("periodic_product_distributions")
    .select("*")
    .eq("id", id)
    .single();

  if (!distribution) {
    return { error: "Dağıtım bulunamadı" };
  }

  // Yeni dağıtım tarihi olarak bugünü kullan
  const newDistributionDate = new Date().toISOString().split("T")[0];
  
  // next_renewal_date'i güncelle
  const nextRenewalDate = new Date(newDistributionDate);
  nextRenewalDate.setMonth(nextRenewalDate.getMonth() + distribution.period_months);

  const { data, error } = await supabase
    .from("periodic_product_distributions")
    .update({
      distribution_date: newDistributionDate,
      next_renewal_date: nextRenewalDate.toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Tracking kaydını güncelle
  const daysUntilRenewal = Math.floor(
    (nextRenewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const status = daysUntilRenewal < 0 ? "overdue" : daysUntilRenewal <= 30 ? "due_soon" : "active";

  await supabase
    .from("periodic_product_tracking")
    .upsert({
      distribution_id: id,
      equipment_id: distribution.equipment_id,
      employee_id: distribution.employee_id,
      next_renewal_date: nextRenewalDate.toISOString().split("T")[0],
      days_until_renewal: daysUntilRenewal,
      status,
      updated_at: new Date().toISOString(),
    });

  revalidatePath("/depo/periodic-products");
  return { data };
}

