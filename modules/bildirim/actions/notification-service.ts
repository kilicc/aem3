"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type NotificationType =
  | "work_order_created"
  | "work_order_status_changed"
  | "work_order_completed"
  | "stock_in"
  | "stock_out"
  | "stock_low"
  | "invoice_created"
  | "invoice_paid"
  | "material_request"
  | "tool_assigned"
  | "tool_returned"
  | "customer_created"
  | "customer_updated"
  | "vehicle_maintenance_due"
  | "vehicle_maintenance_completed";

export type TargetRole =
  | "depo_sorunlusu"
  | "saha_personeli"
  | "saha_sefi"
  | "ofis_personeli"
  | "ofis_sefi"
  | "yonetici"
  | "muhasebe_personeli";

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  targetRoles: TargetRole[];
  relatedType?: string;
  relatedId?: string;
  excludeUserIds?: string[]; // Bildirim gönderilmeyecek kullanıcılar (örneğin işlemi yapan kişi)
}

/**
 * Belirtilen rollere bildirim gönderir
 * Yönetici rolündeki kullanıcılar her zaman tüm bildirimleri alır
 */
export async function sendNotificationToRoles(data: NotificationData) {
  const supabase = await createClient();

  // Hedef rolleri al (yönetici her zaman dahil)
  const targetRoles = [...new Set([...data.targetRoles, "yonetici"])];

  // İlgili rollerdeki kullanıcıları getir
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role")
    .in("role", targetRoles);

  if (error) {
    console.error("Bildirim gönderme hatası:", error);
    return { error: error.message };
  }

  if (!users || users.length === 0) {
    return { success: true, sent: 0 };
  }

  // Bildirimleri oluştur
  const notifications = users
    .filter((user) => !data.excludeUserIds?.includes(user.id))
    .map((user) => ({
      user_id: user.id,
      type: "push", // Varsayılan olarak push notification
      title: data.title,
      message: data.message,
      notification_type: data.type,
      related_type: data.relatedType,
      related_id: data.relatedId,
      target_roles: data.targetRoles,
      is_read: false,
    }));

  if (notifications.length === 0) {
    return { success: true, sent: 0 };
  }

  // Bildirimleri kaydet
  const { error: insertError } = await supabase
    .from("notifications")
    .insert(notifications);

  if (insertError) {
    console.error("Bildirim kaydetme hatası:", insertError);
    return { error: insertError.message };
  }

  // İlgili sayfaları yeniden doğrula
  if (data.relatedType === "work_order") {
    revalidatePath("/is-emri");
    revalidatePath("/dashboard");
    revalidatePath("/admin/dashboard");
  } else if (data.relatedType === "stock" || data.relatedType === "warehouse_stock") {
    revalidatePath("/depo/stock");
  } else if (data.relatedType === "invoice") {
    revalidatePath("/fatura");
  }

  return { success: true, sent: notifications.length };
}

/**
 * İş emri oluşturulduğunda bildirim gönder
 */
export async function notifyWorkOrderCreated(workOrderId: string, createdByUserId: string) {
  const supabase = await createClient();

  const { data: workOrder } = await supabase
    .from("work_orders")
    .select(
      `
      *,
      customer:customers!work_orders_customer_id_fkey(name),
      service:services!work_orders_service_id_fkey(name)
    `
    )
    .eq("id", workOrderId)
    .single();

  if (!workOrder) {
    return { error: "İş emri bulunamadı" };
  }

  const customer = Array.isArray(workOrder.customer)
    ? workOrder.customer[0]
    : workOrder.customer;
  const service = Array.isArray(workOrder.service)
    ? workOrder.service[0]
    : workOrder.service;

  return await sendNotificationToRoles({
    type: "work_order_created",
    title: "Yeni İş Emri Oluşturuldu",
    message: `Yeni iş emri oluşturuldu.\n\nİş Emri No: ${workOrder.order_number}\nMüşteri: ${customer?.name || "-"}\nHizmet: ${service?.name || "-"}\nÖncelik: ${workOrder.priority === "urgent" ? "Acil" : workOrder.priority === "high" ? "Yüksek" : workOrder.priority === "normal" ? "Normal" : "Düşük"}`,
    targetRoles: ["saha_personeli", "saha_sefi", "ofis_sefi"],
    relatedType: "work_order",
    relatedId: workOrderId,
    excludeUserIds: [createdByUserId],
  });
}

/**
 * İş emri durumu değiştiğinde bildirim gönder
 */
export async function notifyWorkOrderStatusChanged(
  workOrderId: string,
  oldStatus: string,
  newStatus: string,
  changedByUserId: string
) {
  const supabase = await createClient();

  const { data: workOrder } = await supabase
    .from("work_orders")
    .select(
      `
      *,
      customer:customers!work_orders_customer_id_fkey(name),
      service:services!work_orders_service_id_fkey(name)
    `
    )
    .eq("id", workOrderId)
    .single();

  if (!workOrder) {
    return { error: "İş emri bulunamadı" };
  }

  const customer = Array.isArray(workOrder.customer)
    ? workOrder.customer[0]
    : workOrder.customer;
  const service = Array.isArray(workOrder.service)
    ? workOrder.service[0]
    : workOrder.service;

  const statusText =
    newStatus === "in_progress"
      ? "İşleme alındı"
      : newStatus === "completed"
      ? "Tamamlandı"
      : newStatus === "cancelled"
      ? "İptal edildi"
      : "Beklemede";

  const targetRoles: TargetRole[] = ["saha_sefi", "ofis_sefi"];
  
  // Eğer tamamlandıysa muhasebe personeline de bildir
  if (newStatus === "completed") {
    targetRoles.push("muhasebe_personeli");
  }

  return await sendNotificationToRoles({
    type: "work_order_status_changed",
    title: "İş Emri Durumu Değişti",
    message: `İş emri durumu değiştirildi.\n\nİş Emri No: ${workOrder.order_number}\nYeni Durum: ${statusText}\nMüşteri: ${customer?.name || "-"}\nHizmet: ${service?.name || "-"}`,
    targetRoles,
    relatedType: "work_order",
    relatedId: workOrderId,
    excludeUserIds: [changedByUserId],
  });
}

/**
 * Stok girişi bildirimi
 */
export async function notifyStockIn(
  warehouseId: string,
  productId: string,
  quantity: number,
  userId: string
) {
  const supabase = await createClient();

  const { data: warehouse } = await supabase
    .from("warehouses")
    .select("name")
    .eq("id", warehouseId)
    .single();

  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("id", productId)
    .single();

  return await sendNotificationToRoles({
    type: "stock_in",
    title: "Stok Girişi Yapıldı",
    message: `Yeni stok girişi yapıldı.\n\nDepo: ${warehouse?.name || "-"}\nÜrün: ${product?.name || "-"}\nMiktar: ${quantity}`,
    targetRoles: ["depo_sorunlusu"],
    relatedType: "warehouse_stock",
    relatedId: warehouseId,
    excludeUserIds: [userId],
  });
}

/**
 * Stok çıkışı bildirimi
 */
export async function notifyStockOut(
  warehouseId: string,
  productId: string,
  quantity: number,
  userId: string
) {
  const supabase = await createClient();

  const { data: warehouse } = await supabase
    .from("warehouses")
    .select("name")
    .eq("id", warehouseId)
    .single();

  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("id", productId)
    .single();

  return await sendNotificationToRoles({
    type: "stock_out",
    title: "Stok Çıkışı Yapıldı",
    message: `Stok çıkışı yapıldı.\n\nDepo: ${warehouse?.name || "-"}\nÜrün: ${product?.name || "-"}\nMiktar: ${quantity}`,
    targetRoles: ["depo_sorunlusu"],
    relatedType: "warehouse_stock",
    relatedId: warehouseId,
    excludeUserIds: [userId],
  });
}

/**
 * Fatura oluşturulduğunda bildirim gönder
 */
export async function notifyInvoiceCreated(invoiceId: string, createdByUserId: string) {
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      `
      *,
      customer:customers!invoices_customer_id_fkey(name)
    `
    )
    .eq("id", invoiceId)
    .single();

  if (!invoice) {
    return { error: "Fatura bulunamadı" };
  }

  const customer = Array.isArray(invoice.customer)
    ? invoice.customer[0]
    : invoice.customer;

  return await sendNotificationToRoles({
    type: "invoice_created",
    title: "Yeni Fatura Oluşturuldu",
    message: `Yeni fatura oluşturuldu.\n\nFatura No: ${invoice.invoice_number}\nMüşteri: ${customer?.name || "-"}\nTutar: ${invoice.total_amount.toLocaleString("tr-TR")} ₺`,
    targetRoles: ["muhasebe_personeli", "ofis_sefi"],
    relatedType: "invoice",
    relatedId: invoiceId,
    excludeUserIds: [createdByUserId],
  });
}

/**
 * Malzeme talebi bildirimi
 */
export async function notifyMaterialRequest(
  workOrderId: string,
  productId: string,
  quantity: number,
  userId: string
) {
  const supabase = await createClient();

  const { data: workOrder } = await supabase
    .from("work_orders")
    .select("order_number")
    .eq("id", workOrderId)
    .single();

  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("id", productId)
    .single();

  return await sendNotificationToRoles({
    type: "material_request",
    title: "Malzeme Talebi",
    message: `Yeni malzeme talebi.\n\nİş Emri No: ${workOrder?.order_number || "-"}\nÜrün: ${product?.name || "-"}\nMiktar: ${quantity}`,
    targetRoles: ["depo_sorunlusu", "ofis_personeli"],
    relatedType: "work_order",
    relatedId: workOrderId,
    excludeUserIds: [userId],
  });
}

/**
 * Araç-gereç zimmetlendiğinde bildirim gönder
 */
export async function notifyToolAssigned(
  toolId: string,
  assignedToUserId: string,
  assignedByUserId: string
) {
  const supabase = await createClient();

  const { data: tool } = await supabase
    .from("tools")
    .select("name")
    .eq("id", toolId)
    .single();

  const { data: assignedUser } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", assignedToUserId)
    .single();

  return await sendNotificationToRoles({
    type: "tool_assigned",
    title: "Araç-Gereç Zimmetlendi",
    message: `Araç-gereç zimmetlendi.\n\nAraç-Gereç: ${tool?.name || "-"}\nZimmetlenen: ${assignedUser?.full_name || "-"}`,
    targetRoles: ["depo_sorunlusu", "saha_sefi"],
    relatedType: "tool_assignment",
    relatedId: toolId,
    excludeUserIds: [assignedByUserId],
  });
}

/**
 * Müşteri oluşturulduğunda/güncellendiğinde bildirim gönder
 */
export async function notifyCustomerCreated(customerId: string, createdByUserId: string) {
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("name")
    .eq("id", customerId)
    .single();

  if (!customer) {
    return { error: "Müşteri bulunamadı" };
  }

  return await sendNotificationToRoles({
    type: "customer_created",
    title: "Yeni Müşteri Eklendi",
    message: `Yeni müşteri eklendi.\n\nMüşteri: ${customer.name}`,
    targetRoles: ["ofis_personeli", "ofis_sefi"],
    relatedType: "customer",
    relatedId: customerId,
    excludeUserIds: [createdByUserId],
  });
}

