"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
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

  // Admin veya yönetici kontrolü
  const adminRoles = ["admin", "yonetici"];
  if (!profile?.role || !adminRoles.includes(profile.role)) {
    return { error: "Forbidden" };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string | null;
  const phone = formData.get("phone") as string | null;
  const role = formData.get("role") as string;

  // Admin client ile kullanıcı oluştur
  const adminClient = createAdminClient();
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Kullanıcı oluşturulamadı" };
  }

  // Profile oluştur
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      phone,
      role: role || "user",
    })
    .select()
    .single();

  if (error) {
    // Auth kullanıcısını sil
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { data };
}

export async function updateUser(id: string, formData: FormData) {
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

  // Admin veya yönetici kontrolü
  const adminRoles = ["admin", "yonetici"];
  if (!profile?.role || !adminRoles.includes(profile.role)) {
    return { error: "Forbidden" };
  }

  const fullName = formData.get("full_name") as string | null;
  const phone = formData.get("phone") as string | null;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string | null;

  // Şifre güncelleme
  if (password && password.trim()) {
    const adminClient = createAdminClient();
    const { error: passwordError } = await adminClient.auth.admin.updateUserById(
      id,
      { password }
    );

    if (passwordError) {
      return { error: passwordError.message };
    }
  }

  // Profile güncelleme
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      role: role || "user",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { data };
}

export async function deleteUser(id: string) {
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

  // Admin veya yönetici kontrolü
  const adminRoles = ["admin", "yonetici"];
  if (!profile?.role || !adminRoles.includes(profile.role)) {
    return { error: "Forbidden" };
  }

  if (user.id === id) {
    return { error: "Kendi hesabınızı silemezsiniz" };
  }

  // Admin client ile kullanıcıyı sil
  const adminClient = createAdminClient();
  const { error: authError } = await adminClient.auth.admin.deleteUser(id);

  if (authError) {
    return { error: authError.message };
  }

  // Profile otomatik silinir (CASCADE)

  revalidatePath("/admin/users");
  return { success: true };
}
