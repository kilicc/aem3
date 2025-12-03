"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
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
  const price = formData.get("price")
    ? parseFloat(formData.get("price") as string)
    : null;
  const serviceFormTemplate = formData.get("service_form_template") as string | null;
  const isActive = formData.get("is_active") === "true";

  let parsedTemplate = null;
  if (serviceFormTemplate) {
    try {
      parsedTemplate = JSON.parse(serviceFormTemplate);
    } catch (e) {
      return { error: "Geçersiz JSON formatı" };
    }
  }

  const { data, error } = await supabase
    .from("services")
    .insert({
      name,
      description,
      price,
      service_form_template: parsedTemplate,
      is_active: isActive,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/services");
  return { data };
}

export async function updateService(id: string, formData: FormData) {
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
  const price = formData.get("price")
    ? parseFloat(formData.get("price") as string)
    : null;
  const serviceFormTemplate = formData.get("service_form_template") as string | null;
  const isActive = formData.get("is_active") === "true";

  let parsedTemplate = null;
  if (serviceFormTemplate) {
    try {
      parsedTemplate = JSON.parse(serviceFormTemplate);
    } catch (e) {
      return { error: "Geçersiz JSON formatı" };
    }
  }

  const { data, error } = await supabase
    .from("services")
    .update({
      name,
      description,
      price,
      service_form_template: parsedTemplate,
      is_active: isActive,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}`);
  return { data };
}

export async function deleteService(id: string) {
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

  // Cascade kontrolü - İş emirlerinde kullanılıyor mu?
  const { data: workOrders } = await supabase
    .from("work_orders")
    .select("id")
    .eq("service_id", id)
    .limit(1);

  if (workOrders && workOrders.length > 0) {
    return { error: "Bu hizmet iş emirlerinde kullanıldığı için silinemez" };
  }

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/services");
  return { success: true };
}
