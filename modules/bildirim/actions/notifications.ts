"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendWhatsAppNotification, sendEmailNotification } from "./messaging";

export async function sendWorkOrderNotification(
  workOrderId: string,
  type: "created" | "status_changed"
) {
  const supabase = await createClient();

  // İş emri bilgilerini getir
  const { data: workOrder } = await supabase
    .from("work_orders")
    .select(
      `
      *,
      customer:customers!work_orders_customer_id_fkey(name, phone, email),
      service:services!work_orders_service_id_fkey(name),
      created_by_profile:profiles!work_orders_created_by_fkey(full_name, email)
    `
    )
    .eq("id", workOrderId)
    .single();

  if (!workOrder) {
    return { error: "Work order not found" };
  }

  const customer = Array.isArray(workOrder.customer)
    ? workOrder.customer[0]
    : workOrder.customer;
  const service = Array.isArray(workOrder.service)
    ? workOrder.service[0]
    : workOrder.service;
  const createdBy = Array.isArray(workOrder.created_by_profile)
    ? workOrder.created_by_profile[0]
    : workOrder.created_by_profile;

  // Atanan kullanıcıları getir
  const { data: assignedUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .in("id", workOrder.assigned_to || []);

  // Admin kullanıcısını getir
  const { data: adminUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .eq("role", "admin");

  const notifications: any[] = [];

  if (type === "created") {
    // Yeni iş emri bildirimi - kullanıcılara gönder
    const message = `Yeni iş emri oluşturuldu!\n\nİş Emri No: ${workOrder.order_number}\nMüşteri: ${customer?.name || "-"}\nHizmet: ${service?.name || "-"}\nÖncelik: ${workOrder.priority === "urgent" ? "Acil" : workOrder.priority === "high" ? "Yüksek" : workOrder.priority === "normal" ? "Normal" : "Düşük"}`;

    for (const user of assignedUsers || []) {
      if (user.phone) {
        await sendWhatsAppNotification(user.phone, message);
      }
      if (user.email) {
        await sendEmailNotification(
          user.email,
          "Yeni İş Emri",
          message.replace(/\n/g, "<br>")
        );
      }

      // Bildirimi kaydet
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "whatsapp",
        title: "Yeni İş Emri",
        message,
        related_type: "work_order",
        related_id: workOrderId,
      });
    }
  } else if (type === "status_changed") {
    // Durum değişikliği bildirimi - admin'e gönder
    const statusText =
      workOrder.status === "in_progress"
        ? "İşleme alındı"
        : workOrder.status === "completed"
        ? "Tamamlandı"
        : workOrder.status === "cancelled"
        ? "İptal edildi"
        : "Beklemede";

    const message = `İş emri durumu değiştirildi!\n\nİş Emri No: ${workOrder.order_number}\nYeni Durum: ${statusText}\nMüşteri: ${customer?.name || "-"}\nHizmet: ${service?.name || "-"}`;

    for (const admin of adminUsers || []) {
      if (admin.phone) {
        await sendWhatsAppNotification(admin.phone, message);
      }
      if (admin.email) {
        await sendEmailNotification(
          admin.email,
          "İş Emri Durum Değişikliği",
          message.replace(/\n/g, "<br>")
        );
      }

      // Bildirimi kaydet
      await supabase.from("notifications").insert({
        user_id: admin.id,
        type: "email",
        title: "İş Emri Durum Değişikliği",
        message,
        related_type: "work_order",
        related_id: workOrderId,
      });
    }
  }

  revalidatePath("/is-emri");
  return { success: true };
}

export async function sendVehicleMaintenanceNotification(
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

  const daysUntilMaintenance = vehicle.next_maintenance_date
    ? Math.ceil(
        (new Date(vehicle.next_maintenance_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const message = `🚗 Araç Bakım Bildirimi\n\nPlaka: ${vehicle.plate_number}\nMarka/Model: ${vehicle.brand} ${vehicle.model}\nSonraki Bakım Tarihi: ${vehicle.next_maintenance_date ? new Date(vehicle.next_maintenance_date).toLocaleDateString("tr-TR") : "-"}\n${daysUntilMaintenance < 0 ? `⚠️ Bakım tarihi ${Math.abs(daysUntilMaintenance)} gün önce geçti!` : daysUntilMaintenance === 0 ? "⚠️ Bakım zamanı bugün!" : `⏰ Bakıma ${daysUntilMaintenance} gün kaldı`}\n${vehicle.mileage ? `Kilometre: ${vehicle.mileage.toLocaleString("tr-TR")} km` : ""}`;

  // WhatsApp bildirimi
  if (admin.phone) {
    await sendWhatsAppNotification(admin.phone, message);
  }

  // Email bildirimi
  if (admin.email) {
    await sendEmailNotification(
      admin.email,
      `Araç Bakım Bildirimi - ${vehicle.plate_number}`,
      message.replace(/\n/g, "<br>")
    );
  }

  // Bildirimi kaydet
  await supabase.from("notifications").insert({
    user_id: admin.id,
    type: "email",
    title: `Araç Bakım Bildirimi - ${vehicle.plate_number}`,
    message,
    related_type: "vehicle",
    related_id: vehicleId,
  });

  return { success: true };
}
