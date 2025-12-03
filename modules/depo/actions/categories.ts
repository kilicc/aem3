"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
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
  const description = formData.get("description") as string | null;

  const { data, error } = await supabase
    .from("product_categories")
    .insert({
      name,
      description,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  return { data };
}

export async function updateCategory(id: string, formData: FormData) {
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
  const description = formData.get("description") as string | null;

  const { data, error } = await supabase
    .from("product_categories")
    .update({
      name,
      description,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  return { data };
}

export async function deleteCategory(id: string) {
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

  // Cascade kontrolü - Ürünlerde kullanılıyor mu?
  const { data: products } = await supabase
    .from("products")
    .select("id")
    .eq("category_id", id)
    .limit(1);

  if (products && products.length > 0) {
    return { error: "Bu kategoriye ait ürünler bulunduğu için silinemez. Önce ürünlerin kategorisini değiştirin" };
  }

  const { error } = await supabase
    .from("product_categories")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}
