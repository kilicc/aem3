"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: FormData) {
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
  const taxId = formData.get("tax_id") as string | null;
  const taxOffice = formData.get("tax_office") as string | null;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string | null;
  const district = formData.get("district") as string | null;
  const postalCode = formData.get("postal_code") as string | null;
  const notes = formData.get("notes") as string | null;

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name,
      tax_id: taxId,
      tax_office: taxOffice,
      email,
      phone,
      address,
      city,
      district,
      postal_code: postalCode,
      notes,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/musteri");
  
  // Müşteri oluşturulduğunda bildirim gönder
  const { notifyCustomerCreated } = await import("@/modules/bildirim/actions/notification-service");
  await notifyCustomerCreated(data.id, user.id);
  
  return { data };
}

export async function updateCustomer(id: string, formData: FormData) {
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
  const taxId = formData.get("tax_id") as string | null;
  const taxOffice = formData.get("tax_office") as string | null;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string | null;
  const district = formData.get("district") as string | null;
  const postalCode = formData.get("postal_code") as string | null;
  const notes = formData.get("notes") as string | null;

  const { data, error } = await supabase
    .from("customers")
    .update({
      name,
      tax_id: taxId,
      tax_office: taxOffice,
      email,
      phone,
      address,
      city,
      district,
      postal_code: postalCode,
      notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/musteri");
  revalidatePath(`/musteri/${id}`);
  return { data };
}

export async function deleteCustomer(id: string) {
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
    .eq("customer_id", id)
    .limit(1);

  if (workOrders && workOrders.length > 0) {
    return { error: "Bu müşterinin iş emirleri bulunduğu için silinemez" };
  }

  // Cihazları var mı?
  const { data: devices } = await supabase
    .from("customer_devices")
    .select("id")
    .eq("customer_id", id)
    .limit(1);

  if (devices && devices.length > 0) {
    return { error: "Bu müşterinin cihazları bulunduğu için silinemez. Önce cihazları silin" };
  }

  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/musteri");
  return { success: true };
}
