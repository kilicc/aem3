"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
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
  let categoryId = formData.get("category_id") as string | null;
  const unitId = formData.get("unit_id") as string;
  const unitPrice = parseFloat(formData.get("unit_price") as string) || 0;
  const description = formData.get("description") as string | null;
  const barcode = formData.get("barcode") as string | null;

  // Boş string'leri null'a çevir
  if (categoryId === "" || categoryId === null) {
    categoryId = null;
  }
  if (!unitId || unitId.trim() === "") {
    return { error: "Birim seçilmedi" };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      category_id: categoryId,
      unit_id: unitId,
      unit_price: unitPrice,
      description,
      barcode,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/products");
  return { data };
}

export async function updateProduct(id: string, formData: FormData) {
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
  let categoryId = formData.get("category_id") as string | null;
  const unitId = formData.get("unit_id") as string;
  const unitPrice = parseFloat(formData.get("unit_price") as string) || 0;
  const description = formData.get("description") as string | null;
  const barcode = formData.get("barcode") as string | null;

  // Boş string'leri null'a çevir
  if (categoryId === "" || categoryId === null) {
    categoryId = null;
  }
  if (!unitId || unitId.trim() === "") {
    return { error: "Birim seçilmedi" };
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      name,
      category_id: categoryId,
      unit_id: unitId,
      unit_price: unitPrice,
      description,
      barcode,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/products");
  revalidatePath(`/depo/products/${id}`);
  return { data };
}

export async function deleteProduct(id: string) {
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

  // Cascade kontrolü - İş emri malzemelerinde kullanılıyor mu?
  const { data: workOrderMaterials } = await supabase
    .from("work_order_materials")
    .select("id")
    .eq("product_id", id)
    .limit(1);

  if (workOrderMaterials && workOrderMaterials.length > 0) {
    return { error: "Bu ürün iş emirlerinde kullanıldığı için silinemez" };
  }

  // Stok kayıtlarında kullanılıyor mu?
  const { data: stockRecords } = await supabase
    .from("warehouse_stock")
    .select("id")
    .eq("product_id", id)
    .limit(1);

  if (stockRecords && stockRecords.length > 0) {
    return { error: "Bu ürünün stok kayıtları bulunduğu için silinemez. Önce stok kayıtlarını silin" };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/products");
  return { success: true };
}
