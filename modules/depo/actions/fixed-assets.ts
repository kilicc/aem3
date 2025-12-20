"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createFixedAsset(formData: FormData) {
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
  const assetCode = formData.get("asset_code") as string | null;
  const category = formData.get("category") as string | null;
  const brand = formData.get("brand") as string | null;
  const model = formData.get("model") as string | null;
  const serialNumber = formData.get("serial_number") as string | null;
  const purchaseDate = formData.get("purchase_date") as string | null;
  const purchasePrice = formData.get("purchase_price") ? parseFloat(formData.get("purchase_price") as string) : null;
  const location = formData.get("location") as string | null;
  const warehouseId = formData.get("warehouse_id") as string | null;
  const status = (formData.get("status") as string) || "active";
  const notes = formData.get("notes") as string | null;
  const assignedTo = formData.get("assigned_to") as string | null;
  const assignedAt = formData.get("assigned_at") as string | null;

  const { data, error } = await supabase
    .from("fixed_assets")
    .insert({
      name,
      asset_code: assetCode || null,
      category: category || null,
      brand: brand || null,
      model: model || null,
      serial_number: serialNumber || null,
      purchase_date: purchaseDate || null,
      purchase_price: purchasePrice || null,
      location: location || null,
      warehouse_id: warehouseId || null,
      status,
      notes: notes || null,
      assigned_to: assignedTo || null,
      assigned_at: assignedAt || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/fixed-assets");
  return { data };
}

export async function updateFixedAsset(id: string, formData: FormData) {
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
  const assetCode = formData.get("asset_code") as string | null;
  const category = formData.get("category") as string | null;
  const brand = formData.get("brand") as string | null;
  const model = formData.get("model") as string | null;
  const serialNumber = formData.get("serial_number") as string | null;
  const purchaseDate = formData.get("purchase_date") as string | null;
  const purchasePrice = formData.get("purchase_price") ? parseFloat(formData.get("purchase_price") as string) : null;
  const location = formData.get("location") as string | null;
  const warehouseId = formData.get("warehouse_id") as string | null;
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string | null;
  const assignedTo = formData.get("assigned_to") as string | null;
  const assignedAt = formData.get("assigned_at") as string | null;

  const { data, error } = await supabase
    .from("fixed_assets")
    .update({
      name,
      asset_code: assetCode || null,
      category: category || null,
      brand: brand || null,
      model: model || null,
      serial_number: serialNumber || null,
      purchase_date: purchaseDate || null,
      purchase_price: purchasePrice || null,
      location: location || null,
      warehouse_id: warehouseId || null,
      status,
      notes: notes || null,
      assigned_to: assignedTo || null,
      assigned_at: assignedAt || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/fixed-assets");
  revalidatePath(`/depo/fixed-assets/${id}`);
  return { data };
}

export async function deleteFixedAsset(id: string) {
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
    .from("fixed_assets")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/fixed-assets");
  return { success: true };
}

