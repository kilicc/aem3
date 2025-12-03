"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createVehicle(formData: FormData) {
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

  const plateNumber = formData.get("plate_number") as string;
  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const year = formData.get("year") ? parseInt(formData.get("year") as string) : null;
  const color = formData.get("color") as string | null;
  const chassisNumber = formData.get("chassis_number") as string | null;
  const engineNumber = formData.get("engine_number") as string | null;
  const fuelType = formData.get("fuel_type") as string | null;
  const licensePlateDate = formData.get("license_plate_date") as string | null;
  const licenseExpiryDate = formData.get("license_expiry_date") as string | null;
  const insuranceCompany = formData.get("insurance_company") as string | null;
  const insurancePolicyNumber = formData.get("insurance_policy_number") as string | null;
  const insuranceExpiryDate = formData.get("insurance_expiry_date") as string | null;
  const kaskoCompany = formData.get("kasko_company") as string | null;
  const kaskoPolicyNumber = formData.get("kasko_policy_number") as string | null;
  const kaskoStartDate = formData.get("kasko_start_date") as string | null;
  const kaskoExpiryDate = formData.get("kasko_expiry_date") as string | null;
  const kaskoPremium = formData.get("kasko_premium") ? parseFloat(formData.get("kasko_premium") as string) : null;
  const lastMaintenanceDate = formData.get("last_maintenance_date") as string | null;
  const nextMaintenanceDate = formData.get("next_maintenance_date") as string | null;
  const maintenanceIntervalDays = formData.get("maintenance_interval_days") 
    ? parseInt(formData.get("maintenance_interval_days") as string) 
    : 90;
  const mileage = formData.get("mileage") ? parseInt(formData.get("mileage") as string) : 0;
  const lastMaintenanceMileage = formData.get("last_maintenance_mileage") 
    ? parseInt(formData.get("last_maintenance_mileage") as string) 
    : 0;
  const maintenanceIntervalKm = formData.get("maintenance_interval_km") 
    ? parseInt(formData.get("maintenance_interval_km") as string) 
    : 10000;
  const status = formData.get("status") as string || "active";
  const notes = formData.get("notes") as string | null;

  if (!plateNumber || plateNumber.trim() === "") {
    return { error: "Plaka numarası gereklidir" };
  }
  if (!brand || brand.trim() === "") {
    return { error: "Marka gereklidir" };
  }
  if (!model || model.trim() === "") {
    return { error: "Model gereklidir" };
  }

  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      plate_number: plateNumber.trim().toUpperCase(),
      brand: brand.trim(),
      model: model.trim(),
      year,
      color: color?.trim() || null,
      chassis_number: chassisNumber?.trim() || null,
      engine_number: engineNumber?.trim() || null,
      fuel_type: fuelType || null,
      license_plate_date: licensePlateDate || null,
      license_expiry_date: licenseExpiryDate || null,
      insurance_company: insuranceCompany?.trim() || null,
      insurance_policy_number: insurancePolicyNumber?.trim() || null,
      insurance_expiry_date: insuranceExpiryDate || null,
      kasko_company: kaskoCompany?.trim() || null,
      kasko_policy_number: kaskoPolicyNumber?.trim() || null,
      kasko_start_date: kaskoStartDate || null,
      kasko_expiry_date: kaskoExpiryDate || null,
      kasko_premium: kaskoPremium,
      last_maintenance_date: lastMaintenanceDate || null,
      next_maintenance_date: nextMaintenanceDate || null,
      maintenance_interval_days: maintenanceIntervalDays,
      mileage,
      last_maintenance_mileage: lastMaintenanceMileage,
      maintenance_interval_km: maintenanceIntervalKm,
      status,
      notes: notes?.trim() || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu plaka numarası zaten kayıtlı" };
    }
    return { error: error.message };
  }

  revalidatePath("/arac-bakim");
  return { data };
}

export async function updateVehicle(id: string, formData: FormData) {
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

  const plateNumber = formData.get("plate_number") as string;
  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const year = formData.get("year") ? parseInt(formData.get("year") as string) : null;
  const color = formData.get("color") as string | null;
  const chassisNumber = formData.get("chassis_number") as string | null;
  const engineNumber = formData.get("engine_number") as string | null;
  const fuelType = formData.get("fuel_type") as string | null;
  const licensePlateDate = formData.get("license_plate_date") as string | null;
  const licenseExpiryDate = formData.get("license_expiry_date") as string | null;
  const insuranceCompany = formData.get("insurance_company") as string | null;
  const insurancePolicyNumber = formData.get("insurance_policy_number") as string | null;
  const insuranceExpiryDate = formData.get("insurance_expiry_date") as string | null;
  const kaskoCompany = formData.get("kasko_company") as string | null;
  const kaskoPolicyNumber = formData.get("kasko_policy_number") as string | null;
  const kaskoStartDate = formData.get("kasko_start_date") as string | null;
  const kaskoExpiryDate = formData.get("kasko_expiry_date") as string | null;
  const kaskoPremium = formData.get("kasko_premium") ? parseFloat(formData.get("kasko_premium") as string) : null;
  const lastMaintenanceDate = formData.get("last_maintenance_date") as string | null;
  const nextMaintenanceDate = formData.get("next_maintenance_date") as string | null;
  const maintenanceIntervalDays = formData.get("maintenance_interval_days") 
    ? parseInt(formData.get("maintenance_interval_days") as string) 
    : 90;
  const mileage = formData.get("mileage") ? parseInt(formData.get("mileage") as string) : 0;
  const lastMaintenanceMileage = formData.get("last_maintenance_mileage") 
    ? parseInt(formData.get("last_maintenance_mileage") as string) 
    : 0;
  const maintenanceIntervalKm = formData.get("maintenance_interval_km") 
    ? parseInt(formData.get("maintenance_interval_km") as string) 
    : 10000;
  const status = formData.get("status") as string || "active";
  const notes = formData.get("notes") as string | null;

  if (!plateNumber || plateNumber.trim() === "") {
    return { error: "Plaka numarası gereklidir" };
  }
  if (!brand || brand.trim() === "") {
    return { error: "Marka gereklidir" };
  }
  if (!model || model.trim() === "") {
    return { error: "Model gereklidir" };
  }

  const { data, error } = await supabase
    .from("vehicles")
    .update({
      plate_number: plateNumber.trim().toUpperCase(),
      brand: brand.trim(),
      model: model.trim(),
      year,
      color: color?.trim() || null,
      chassis_number: chassisNumber?.trim() || null,
      engine_number: engineNumber?.trim() || null,
      fuel_type: fuelType || null,
      license_plate_date: licensePlateDate || null,
      license_expiry_date: licenseExpiryDate || null,
      insurance_company: insuranceCompany?.trim() || null,
      insurance_policy_number: insurancePolicyNumber?.trim() || null,
      insurance_expiry_date: insuranceExpiryDate || null,
      kasko_company: kaskoCompany?.trim() || null,
      kasko_policy_number: kaskoPolicyNumber?.trim() || null,
      kasko_start_date: kaskoStartDate || null,
      kasko_expiry_date: kaskoExpiryDate || null,
      kasko_premium: kaskoPremium,
      last_maintenance_date: lastMaintenanceDate || null,
      next_maintenance_date: nextMaintenanceDate || null,
      maintenance_interval_days: maintenanceIntervalDays,
      mileage,
      last_maintenance_mileage: lastMaintenanceMileage,
      maintenance_interval_km: maintenanceIntervalKm,
      status,
      notes: notes?.trim() || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu plaka numarası zaten kayıtlı" };
    }
    return { error: error.message };
  }

  revalidatePath("/arac-bakim");
  revalidatePath(`/arac-bakim/${id}`);
  return { data };
}

export async function deleteVehicle(id: string) {
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

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/arac-bakim");
  return { success: true };
}

export async function addMaintenanceRecord(vehicleId: string, formData: FormData) {
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

  const maintenanceDate = formData.get("maintenance_date") as string;
  const maintenanceType = formData.get("maintenance_type") as string;
  const mileage = formData.get("mileage") ? parseInt(formData.get("mileage") as string) : null;
  const cost = formData.get("cost") ? parseFloat(formData.get("cost") as string) : null;
  const description = formData.get("description") as string | null;
  const serviceProvider = formData.get("service_provider") as string | null;
  const invoiceNumber = formData.get("invoice_number") as string | null;

  if (!maintenanceDate || !maintenanceType) {
    return { error: "Bakım tarihi ve tipi gereklidir" };
  }

  // Bakım kaydını ekle
  const { data: maintenanceRecord, error: maintenanceError } = await supabase
    .from("vehicle_maintenance_history")
    .insert({
      vehicle_id: vehicleId,
      maintenance_date: maintenanceDate,
      maintenance_type: maintenanceType,
      mileage,
      cost,
      description: description?.trim() || null,
      service_provider: serviceProvider?.trim() || null,
      invoice_number: invoiceNumber?.trim() || null,
      performed_by: user.id,
    })
    .select()
    .single();

  if (maintenanceError) {
    return { error: maintenanceError.message };
  }

  // Araç bilgilerini güncelle (son bakım tarihi, kilometre, sonraki bakım tarihi)
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("maintenance_interval_days, maintenance_interval_km")
    .eq("id", vehicleId)
    .single();

  if (vehicle) {
    const nextMaintenanceDate = new Date(maintenanceDate);
    nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + (vehicle.maintenance_interval_days || 90));

    const updates: any = {
      last_maintenance_date: maintenanceDate,
      next_maintenance_date: nextMaintenanceDate.toISOString().split("T")[0],
    };

    if (mileage) {
      updates.mileage = mileage;
      updates.last_maintenance_mileage = mileage;
    }

    await supabase
      .from("vehicles")
      .update(updates)
      .eq("id", vehicleId);
  }

  revalidatePath(`/arac-bakim/${vehicleId}`);
  return { data: maintenanceRecord };
}

export async function deleteMaintenanceRecord(id: string) {
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

  // Bakım kaydını getir (vehicle_id için)
  const { data: maintenanceRecord } = await supabase
    .from("vehicle_maintenance_history")
    .select("vehicle_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("vehicle_maintenance_history")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  if (maintenanceRecord) {
    revalidatePath(`/arac-bakim/${maintenanceRecord.vehicle_id}`);
  }
  return { success: true };
}

// Otomatik bakım bildirim kontrolü
export async function checkMaintenanceDue() {
  const supabase = await createClient();

  // Sonraki bakım tarihi bugün veya geçmiş olan araçları getir
  const today = new Date().toISOString().split("T")[0];
  const { data: vehiclesDue, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("status", "active")
    .lte("next_maintenance_date", today);

  // Kasko bitiş tarihi bugün veya geçmiş olan araçları getir
  const { data: vehiclesKaskoDue } = await supabase
    .from("vehicles")
    .select("*")
    .eq("status", "active")
    .not("kasko_expiry_date", "is", null)
    .lte("kasko_expiry_date", today);

  if (error) {
    console.error("Bakım kontrolü hatası:", error);
    return { error: error.message };
  }

  if (!vehiclesDue || vehiclesDue.length === 0) {
    return { data: [], message: "Bakım zamanı gelen araç yok" };
  }

  // Admin kullanıcılarını getir
  const { data: adminUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .eq("role", "admin");

  // Bildirim gönder
  const { sendVehicleMaintenanceNotification } = await import("@/modules/bildirim/actions/notifications");
  const { sendVehicleKaskoNotification } = await import("@/modules/bildirim/actions/notifications-kasko");
  
  // Bakım bildirimleri
  for (const vehicle of vehiclesDue || []) {
    for (const admin of adminUsers || []) {
      await sendVehicleMaintenanceNotification(vehicle.id, admin.id);
    }
  }

  // Kasko bildirimleri
  for (const vehicle of vehiclesKaskoDue || []) {
    for (const admin of adminUsers || []) {
      await sendVehicleKaskoNotification(vehicle.id, admin.id);
    }
  }

  const totalNotifications = (vehiclesDue?.length || 0) + (vehiclesKaskoDue?.length || 0);

  return { 
    data: { maintenance: vehiclesDue || [], kasko: vehiclesKaskoDue || [] }, 
    message: `${totalNotifications} araç için bildirim gönderildi (${vehiclesDue?.length || 0} bakım, ${vehiclesKaskoDue?.length || 0} kasko)` 
  };
}

