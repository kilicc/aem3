"use server";

import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppNotification, sendEmailNotification } from "./messaging";

export async function sendVehicleKaskoNotification(
  vehicleId: string,
  adminId: string
) {
  const supabase = await createClient();

  // Araç bilgilerini getir
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .single();

  if (!vehicle) {
    return { error: "Vehicle not found" };
  }

  // Admin kullanıcısını getir
  const { data: admin } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .eq("id", adminId)
    .single();

  if (!admin) {
    return { error: "Admin not found" };
  }

  if (!vehicle.kasko_expiry_date) {
    return { error: "Kasko bitiş tarihi bulunamadı" };
  }

  const daysUntilKasko = Math.ceil(
    (new Date(vehicle.kasko_expiry_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const message = `🚗 Kasko Bitiş Bildirimi\n\nPlaka: ${vehicle.plate_number}\nMarka/Model: ${vehicle.brand} ${vehicle.model}\nKasko Şirketi: ${vehicle.kasko_company || "-"}\nKasko Poliçe: ${vehicle.kasko_policy_number || "-"}\nKasko Bitiş Tarihi: ${new Date(vehicle.kasko_expiry_date).toLocaleDateString("tr-TR")}\n${daysUntilKasko < 0 ? `⚠️ Kasko ${Math.abs(daysUntilKasko)} gün önce sona erdi!` : daysUntilKasko === 0 ? "⚠️ Kasko bugün sona eriyor!" : `⏰ Kaskoya ${daysUntilKasko} gün kaldı`}`;

  // WhatsApp bildirimi
  if (admin.phone) {
    await sendWhatsAppNotification(admin.phone, message);
  }

  // Email bildirimi
  if (admin.email) {
    await sendEmailNotification(
      admin.email,
      `Kasko Bitiş Bildirimi - ${vehicle.plate_number}`,
      message.replace(/\n/g, "<br>")
    );
  }

  // Bildirimi kaydet
  await supabase.from("notifications").insert({
    user_id: admin.id,
    type: "email",
    title: `Kasko Bitiş Bildirimi - ${vehicle.plate_number}`,
    message,
    related_type: "vehicle",
    related_id: vehicleId,
  });

  return { success: true };
}

