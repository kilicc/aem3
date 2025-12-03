"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createWarehouse(formData: FormData) {
  const supabase = await createClient();

  // Kullanıcı kontrolü
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
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  let managerId = formData.get("manager_id") as string | null;

  // Boş string'leri null'a çevir
  if (managerId === "" || managerId === null) {
    managerId = null;
  }

  const { data, error } = await supabase
    .from("warehouses")
    .insert({
      name,
      address,
      phone,
      manager_id: managerId,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/warehouses");
  return { data };
}

export async function updateWarehouse(id: string, formData: FormData) {
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
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  let managerId = formData.get("manager_id") as string | null;
  const isActive = formData.get("is_active") === "true";

  // Boş string'leri null'a çevir
  if (managerId === "" || managerId === null) {
    managerId = null;
  }

  const { data, error } = await supabase
    .from("warehouses")
    .update({
      name,
      address,
      phone,
      manager_id: managerId,
      is_active: isActive,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/warehouses");
  revalidatePath(`/depo/warehouses/${id}`);
  return { data };
}

export async function deleteWarehouse(id: string) {
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

  // Cascade kontrolü - Stok kayıtları var mı?
  const { data: stockRecords } = await supabase
    .from("warehouse_stock")
    .select("id")
    .eq("warehouse_id", id)
    .limit(1);

  if (stockRecords && stockRecords.length > 0) {
    return { error: "Bu depoda stok kayıtları bulunduğu için silinemez. Önce stok kayıtlarını silin" };
  }

  // Zimmet kayıtları var mı?
  const { data: assignments } = await supabase
    .from("tool_assignments")
    .select("id")
    .eq("warehouse_id", id)
    .limit(1);

  if (assignments && assignments.length > 0) {
    return { error: "Bu depoda zimmet kayıtları bulunduğu için silinemez. Önce zimmet kayıtlarını iade edin" };
  }

  const { error } = await supabase.from("warehouses").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/warehouses");
  return { success: true };
}
