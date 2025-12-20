"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEquipment(formData: FormData) {
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

  const name = formData.get("name") as string;
  const equipmentCode = formData.get("equipment_code") as string | null;
  const category = formData.get("category") as string;
  const brand = formData.get("brand") as string | null;
  const model = formData.get("model") as string | null;
  const size = formData.get("size") as string | null;
  const color = formData.get("color") as string | null;
  const warehouseId = formData.get("warehouse_id") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 0;
  const minStockLevel = parseInt(formData.get("min_stock_level") as string) || 0;
  const unitPrice = formData.get("unit_price") ? parseFloat(formData.get("unit_price") as string) : null;
  const purchaseDate = formData.get("purchase_date") as string | null;
  const notes = formData.get("notes") as string | null;
  const lastMaintenanceDate = formData.get("last_maintenance_date") as string | null;
  const nextMaintenanceDate = formData.get("next_maintenance_date") as string | null;
  const maintenanceIntervalMonths = formData.get("maintenance_interval_months")
    ? parseInt(formData.get("maintenance_interval_months") as string)
    : null;

  if (!warehouseId || warehouseId.trim() === "") {
    return { error: "Depo seçilmedi" };
  }

  const { data, error } = await supabase
    .from("equipment")
    .insert({
      name,
      equipment_code: equipmentCode || null,
      category,
      brand: brand || null,
      model: model || null,
      size: size || null,
      color: color || null,
      warehouse_id: warehouseId,
      quantity,
      min_stock_level: minStockLevel,
      unit_price: unitPrice || null,
      purchase_date: purchaseDate || null,
      notes: notes || null,
      last_maintenance_date: lastMaintenanceDate || null,
      next_maintenance_date: nextMaintenanceDate || null,
      maintenance_interval_months: maintenanceIntervalMonths,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/equipment");
  return { data };
}

export async function updateEquipment(id: string, formData: FormData) {
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

  const name = formData.get("name") as string;
  const equipmentCode = formData.get("equipment_code") as string | null;
  const category = formData.get("category") as string;
  const brand = formData.get("brand") as string | null;
  const model = formData.get("model") as string | null;
  const size = formData.get("size") as string | null;
  const color = formData.get("color") as string | null;
  const warehouseId = formData.get("warehouse_id") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 0;
  const minStockLevel = parseInt(formData.get("min_stock_level") as string) || 0;
  const unitPrice = formData.get("unit_price") ? parseFloat(formData.get("unit_price") as string) : null;
  const purchaseDate = formData.get("purchase_date") as string | null;
  const notes = formData.get("notes") as string | null;
  const lastMaintenanceDate = formData.get("last_maintenance_date") as string | null;
  const nextMaintenanceDate = formData.get("next_maintenance_date") as string | null;
  const maintenanceIntervalMonths = formData.get("maintenance_interval_months")
    ? parseInt(formData.get("maintenance_interval_months") as string)
    : null;

  if (!warehouseId || warehouseId.trim() === "") {
    return { error: "Depo seçilmedi" };
  }

  const { data, error } = await supabase
    .from("equipment")
    .update({
      name,
      equipment_code: equipmentCode || null,
      category,
      brand: brand || null,
      model: model || null,
      size: size || null,
      color: color || null,
      warehouse_id: warehouseId,
      quantity,
      min_stock_level: minStockLevel,
      unit_price: unitPrice || null,
      purchase_date: purchaseDate || null,
      notes: notes || null,
      last_maintenance_date: lastMaintenanceDate || null,
      next_maintenance_date: nextMaintenanceDate || null,
      maintenance_interval_months: maintenanceIntervalMonths,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/equipment");
  revalidatePath(`/depo/equipment/${id}`);
  return { data };
}

export async function deleteEquipment(id: string) {
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
    .from("equipment")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/equipment");
  return { success: true };
}

