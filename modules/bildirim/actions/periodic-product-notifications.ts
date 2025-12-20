"use server";

import { createClient } from "@/lib/supabase/server";
import { sendNotificationToRoles } from "./notification-service";
import { sendWhatsAppNotification, sendEmailNotification } from "./messaging";

/**
 * Periyodik ürün yenileme tarihi yaklaşan bildirimleri gönder
 * 30 gün içinde yenilenecek veya süresi dolan dağıtımlar için bildirim gönderir
 */
export async function checkPeriodicProductsDue() {
  const supabase = await createClient();

  // Bugünün tarihi
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // 30 gün sonrasının tarihi
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split("T")[0];

  // Süresi dolan veya 30 gün içinde yenilenecek dağıtımları getir
  const { data: distributionsDue, error } = await supabase
    .from("periodic_product_tracking")
    .select(`
      *,
      distribution:periodic_product_distributions!periodic_product_tracking_distribution_id_fkey(
        id,
        quantity,
        period_months,
        distribution_date,
        equipment:equipment!periodic_product_distributions_equipment_id_fkey(id, name, category),
        employee:profiles!periodic_product_distributions_employee_id_fkey(id, full_name, email, phone)
      )
    `)
    .lte("next_renewal_date", thirtyDaysLaterStr)
    .in("status", ["due_soon", "overdue"])
    .order("next_renewal_date", { ascending: true });

  if (error) {
    console.error("Periyodik ürün kontrolü hatası:", error);
    return { error: error.message };
  }

  if (!distributionsDue || distributionsDue.length === 0) {
    return { success: true, sent: 0, message: "Yenileme zamanı gelen periyodik ürün yok" };
  }

  // Sistem yöneticilerini getir (admin rolü)
  const { data: adminUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .eq("role", "admin");

  let totalNotifications = 0;

  // Her dağıtım için bildirim gönder
  for (const tracking of distributionsDue) {
    const distribution = Array.isArray(tracking.distribution) 
      ? tracking.distribution[0] 
      : tracking.distribution;
    
    if (!distribution) continue;

    const equipment = Array.isArray(distribution.equipment)
      ? distribution.equipment[0]
      : distribution.equipment;
    const employee = Array.isArray(distribution.employee)
      ? distribution.employee[0]
      : distribution.employee;

    if (!equipment || !employee) continue;

    const daysUntilRenewal = tracking.days_until_renewal || 0;
    const isOverdue = daysUntilRenewal < 0;
    const categoryLabels: Record<string, string> = {
      yelek: "Yelek",
      çeket: "Çeket",
      iş_ayakkabısı: "İş Ayakkabısı",
      baret: "Baret",
      eldiven: "Eldiven",
      gözlük: "Gözlük",
      maske: "Maske",
      diğer: "Diğer",
    };

    const categoryLabel = categoryLabels[equipment.category] || equipment.category;

    const message = `🔔 Periyodik Ürün Yenileme Bildirimi\n\nÇalışan: ${employee.full_name}\nÜrün: ${equipment.name} (${categoryLabel})\nMiktar: ${distribution.quantity}\nSon Yenileme: ${new Date(distribution.distribution_date).toLocaleDateString("tr-TR")}\nSonraki Yenileme: ${new Date(tracking.next_renewal_date).toLocaleDateString("tr-TR")}\n${isOverdue ? `⚠️ Yenileme tarihi ${Math.abs(daysUntilRenewal)} gün önce geçti!` : `⏰ Yenileme tarihi ${daysUntilRenewal} gün sonra!`}`;

    // Sistem yöneticilerine bildirim gönder
    if (adminUsers && adminUsers.length > 0) {
      for (const admin of adminUsers) {
        // Bildirim kaydı oluştur
        await sendNotificationToRoles({
          type: isOverdue ? "periodic_product_overdue" : "periodic_product_due_soon",
          title: isOverdue ? "Periyodik Ürün Yenileme Süresi Doldu" : "Periyodik Ürün Yenileme Yaklaşıyor",
          message: `${employee.full_name} için ${equipment.name} yenileme zamanı ${isOverdue ? "geçti" : "yaklaşıyor"}.`,
          targetRoles: ["yonetici", "depo_sorunlusu"],
          relatedType: "periodic_product_distribution",
          relatedId: distribution.id,
        });

        // WhatsApp bildirimi
        if (admin.phone) {
          await sendWhatsAppNotification(admin.phone, message);
        }

        // Email bildirimi
        if (admin.email) {
          await sendEmailNotification(
            admin.email,
            `${isOverdue ? "Periyodik Ürün Yenileme Süresi Doldu" : "Periyodik Ürün Yenileme Yaklaşıyor"} - ${employee.full_name}`,
            message.replace(/\n/g, "<br>")
          );
        }

        totalNotifications++;
      }
    }

    // Çalışana da bildirim gönder (sadece süresi dolanlar için)
    if (isOverdue && employee.phone) {
      await sendWhatsAppNotification(
        employee.phone,
        `🔔 ${equipment.name} yenileme zamanı geldi. Lütfen yönetim ile iletişime geçiniz.`
      );
    }
    if (isOverdue && employee.email) {
      await sendEmailNotification(
        employee.email,
        `${equipment.name} Yenileme Zamanı`,
        `<p>Sayın ${employee.full_name},</p>
        <p>${equipment.name} (${categoryLabel}) yenileme zamanı geldi. Lütfen yönetim ile iletişime geçiniz.</p>`
      );
    }

    // Tracking kaydındaki bildirim tarihini güncelle
    await supabase
      .from("periodic_product_tracking")
      .update({ last_notification_sent_at: new Date().toISOString() })
      .eq("id", tracking.id);
  }

  return {
    success: true,
    sent: totalNotifications,
    distributionsCount: distributionsDue.length,
    message: `${distributionsDue.length} periyodik ürün dağıtımı için ${totalNotifications} bildirim gönderildi`,
  };
}

