"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDevice(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const customerId = formData.get("customer_id") as string;
  const deviceType = formData.get("device_type") as string;
  const deviceName = formData.get("device_name") as string;
  let serialNumber = formData.get("serial_number") as string | null;
  let model = formData.get("model") as string | null;
  let installationDate = formData.get("installation_date") as string | null;
  let lastServiceDate = formData.get("last_service_date") as string | null;
  const notes = formData.get("notes") as string | null;

  // UUID ve string validasyonu
  if (!customerId || customerId.trim() === "") {
    return { error: "Müşteri seçilmedi" };
  }

  // Boş string'leri null'a çevir
  if (serialNumber === "") serialNumber = null;
  if (model === "") model = null;
  if (installationDate === "") installationDate = null;
  if (lastServiceDate === "") lastServiceDate = null;

  const { data, error } = await supabase
    .from("customer_devices")
    .insert({
      customer_id: customerId,
      device_type: deviceType,
      device_name: deviceName,
      serial_number: serialNumber,
      model,
      installation_date: installationDate || null,
      last_service_date: lastServiceDate || null,
      notes,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/musteri/${customerId}`);
  return { data };
}

export async function updateDevice(id: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const deviceType = formData.get("device_type") as string;
  const deviceName = formData.get("device_name") as string;
  const serialNumber = formData.get("serial_number") as string | null;
  const model = formData.get("model") as string | null;
  const installationDate = formData.get("installation_date") as string | null;
  const lastServiceDate = formData.get("last_service_date") as string | null;
  const notes = formData.get("notes") as string | null;

  const { data: device } = await supabase
    .from("customer_devices")
    .select("customer_id")
    .eq("id", id)
    .single();

  if (!device) {
    return { error: "Device not found" };
  }

  const { data: updatedDevice, error } = await supabase
    .from("customer_devices")
    .update({
      device_type: deviceType,
      device_name: deviceName,
      serial_number: serialNumber,
      model,
      installation_date: installationDate || null,
      last_service_date: lastServiceDate || null,
      notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/musteri/${device.customer_id}`);
  return { data: updatedDevice };
}

export async function deleteDevice(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: device } = await supabase
    .from("customer_devices")
    .select("customer_id")
    .eq("id", id)
    .single();

  if (!device) {
    return { error: "Device not found" };
  }

  const { error } = await supabase.from("customer_devices").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/musteri/${device.customer_id}`);
  return { success: true };
}
