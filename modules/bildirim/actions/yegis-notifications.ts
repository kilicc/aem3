"use server";

import { createClient } from "@/lib/supabase/server";
import { sendNotificationToRoles } from "./notification-service";
import { sendWhatsAppNotification, sendEmailNotification } from "./messaging";

const YEGIS_MANAGER_EMAIL = "satis@aemakgun.com.tr";
const YEGIS_MANAGER_NAME = "Necmiye Öztürk";

/**
 * YEGİS form kontrol tarihi yaklaşan bildirimleri gönder
 * 1 ayı dolan formlar için sistem yöneticilerine ve YEGİS yöneticisine bildirim gönderir
 */
export async function checkYegisFormsDue() {
  const supabase = await createClient();

  // Bugünün tarihi
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1 ay öncesinden bugüne kadar olan formları getir
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // next_control_date bugün veya geçmiş olan, status'u completed veya approved olan formları getir
  const { data: formsDue, error } = await supabase
    .from("yegis_forms")
    .select(`
      *,
      customer:customers(id, name, phone, address)
    `)
    .lte("next_control_date", today.toISOString().split("T")[0])
    .in("status", ["completed", "approved"])
    .order("next_control_date", { ascending: true });

  if (error) {
    console.error("YEGİS form kontrolü hatası:", error);
    return { error: error.message };
  }

  if (!formsDue || formsDue.length === 0) {
    return { success: true, sent: 0, message: "Kontrol zamanı gelen YEGİS formu yok" };
  }

  // Sistem yöneticilerini getir (admin rolü)
  const { data: adminUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .eq("role", "admin");

  let totalNotifications = 0;

  // Her form için bildirim gönder
  for (const form of formsDue) {
    const customer = Array.isArray(form.customer) ? form.customer[0] : form.customer;
    const daysOverdue = Math.ceil(
      (today.getTime() - new Date(form.next_control_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const message = `🔌 YEGİS Periyodik Kontrol Bildirimi\n\nForm No: ${form.form_number}\nMüşteri: ${form.customer_name}\n${customer?.address ? `Adres: ${customer.address}\n` : ""}Son Kontrol Tarihi: ${new Date(form.control_date).toLocaleDateString("tr-TR")}\nSonraki Kontrol Tarihi: ${new Date(form.next_control_date).toLocaleDateString("tr-TR")}\n${daysOverdue > 0 ? `⚠️ Kontrol tarihi ${daysOverdue} gün önce geçti!` : "⏰ Kontrol zamanı geldi!"}`;

    // Sistem yöneticilerine bildirim gönder
    if (adminUsers && adminUsers.length > 0) {
      for (const admin of adminUsers) {
        // Bildirim kaydı oluştur
        await sendNotificationToRoles({
          type: "yegis_control_due",
          title: "YEGİS Periyodik Kontrol Bildirimi",
          message: `Form No: ${form.form_number} - Müşteri: ${form.customer_name} için kontrol zamanı geldi.`,
          targetRoles: ["yonetici"],
          relatedType: "yegis_form",
          relatedId: form.id,
        });

        // WhatsApp bildirimi
        if (admin.phone) {
          await sendWhatsAppNotification(admin.phone, message);
        }

        // Email bildirimi
        if (admin.email) {
          await sendEmailNotification(
            admin.email,
            `YEGİS Periyodik Kontrol Bildirimi - ${form.form_number}`,
            message.replace(/\n/g, "<br>")
          );
        }

        totalNotifications++;
      }
    }

    // YEGİS yöneticisine bildirim gönder (email ile)
    await sendEmailNotification(
      YEGIS_MANAGER_EMAIL,
      `YEGİS Periyodik Kontrol Bildirimi - ${form.form_number}`,
      `<p>Sayın ${YEGIS_MANAGER_NAME},</p>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <p>Lütfen kontrol işlemini gerçekleştiriniz.</p>`
    );

    totalNotifications++;
  }

  return {
    success: true,
    sent: totalNotifications,
    formsCount: formsDue.length,
    message: `${formsDue.length} YEGİS formu için ${totalNotifications} bildirim gönderildi`,
  };
}

/**
 * YEGİS form oluşturulduğunda bildirim gönder
 */
export async function notifyYegisFormCreated(formId: string) {
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("yegis_forms")
    .select(`
      *,
      customer:customers(id, name),
      creator:profiles!yegis_forms_created_by_fkey(id, full_name, email)
    `)
    .eq("id", formId)
    .single();

  if (!form) {
    return { error: "Form bulunamadı" };
  }

  // Sistem yöneticilerine bildirim gönder
  await sendNotificationToRoles({
    type: "yegis_form_created",
    title: "Yeni YEGİS Formu Oluşturuldu",
    message: `Form No: ${form.form_number} - ${form.customer_name} için yeni YEGİS formu oluşturuldu.`,
    targetRoles: ["yonetici"],
    relatedType: "yegis_form",
    relatedId: form.id,
  });

  return { success: true };
}

