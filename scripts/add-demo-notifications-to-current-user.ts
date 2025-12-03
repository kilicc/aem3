import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// .env.local dosyasını yükle
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Hata: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY environment değişkenleri gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDemoNotificationsToCurrentUser() {
  console.log("Demo bildirimler ekleniyor...");

  // Tüm kullanıcıları listele
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .order("created_at", { ascending: false });

  if (usersError) {
    console.error("Kullanıcı listesi alınamadı:", usersError);
    return;
  }

  if (!users || users.length === 0) {
    console.error("Kullanıcı bulunamadı. Önce bir kullanıcı oluşturun.");
    return;
  }

  console.log(`\nBulunan kullanıcılar (${users.length} adet):`);
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} (${user.full_name || "İsimsiz"}) - ID: ${user.id}`);
  });

  // İlk kullanıcıya ekle (veya tüm kullanıcılara)
  const targetUsers = users; // Tüm kullanıcılara ekle

  // Demo bildirimler
  const demoNotifications = targetUsers.flatMap((user) => [
    // İş Emirleri
    {
      user_id: user.id,
      type: "push",
      title: "Yeni İş Emri Oluşturuldu",
      message: "Yeni iş emri oluşturuldu.\n\nİş Emri No: WO-2024-000123\nMüşteri: ABC Teknoloji A.Ş.\nHizmet: Trafo Bakımı\nÖncelik: Yüksek",
      notification_type: "work_order_created",
      related_type: "work_order",
      related_id: null,
      is_read: false,
      target_roles: ["saha_personeli", "saha_sefi", "ofis_sefi"],
      sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
    },
    {
      user_id: user.id,
      type: "push",
      title: "İş Emri Durumu Değişti",
      message: "İş emri durumu değiştirildi.\n\nİş Emri No: WO-2024-000122\nYeni Durum: İşleme alındı\nMüşteri: XYZ Sanayi Ltd.\nHizmet: Pano Montajı",
      notification_type: "work_order_status_changed",
      related_type: "work_order",
      related_id: null,
      is_read: false,
      target_roles: ["saha_sefi", "ofis_sefi"],
      sent_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 saat önce
    },
    {
      user_id: user.id,
      type: "push",
      title: "İş Emri Tamamlandı",
      message: "İş emri tamamlandı.\n\nİş Emri No: WO-2024-000121\nMüşteri: DEF Elektrik A.Ş.\nHizmet: UPS Bakımı\nDurum: Tamamlandı",
      notification_type: "work_order_completed",
      related_type: "work_order",
      related_id: null,
      is_read: true,
      target_roles: ["saha_sefi", "ofis_sefi", "muhasebe_personeli"],
      sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
    },
    // Stok İşlemleri
    {
      user_id: user.id,
      type: "push",
      title: "Stok Girişi Yapıldı",
      message: "Yeni stok girişi yapıldı.\n\nDepo: Ana Depo\nÜrün: Trafo Yağı (10L)\nMiktar: 50",
      notification_type: "stock_in",
      related_type: "warehouse_stock",
      related_id: null,
      is_read: false,
      target_roles: ["depo_sorunlusu"],
      sent_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 saat önce
    },
    {
      user_id: user.id,
      type: "push",
      title: "Stok Çıkışı Yapıldı",
      message: "Stok çıkışı yapıldı.\n\nDepo: Ana Depo\nÜrün: Kablo (3x2.5mm)\nMiktar: 100 metre",
      notification_type: "stock_out",
      related_type: "warehouse_stock",
      related_id: null,
      is_read: true,
      target_roles: ["depo_sorunlusu"],
      sent_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 saat önce
    },
    {
      user_id: user.id,
      type: "push",
      title: "Düşük Stok Uyarısı",
      message: "Stok seviyesi düşük!\n\nDepo: Ana Depo\nÜrün: Sigorta (16A)\nMevcut: 5 adet\nMinimum: 20 adet",
      notification_type: "stock_low",
      related_type: "warehouse_stock",
      related_id: null,
      is_read: false,
      target_roles: ["depo_sorunlusu"],
      sent_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 saat önce
    },
    // Faturalar
    {
      user_id: user.id,
      type: "push",
      title: "Yeni Fatura Oluşturuldu",
      message: "Yeni fatura oluşturuldu.\n\nFatura No: INV-2024-000456\nMüşteri: ABC Teknoloji A.Ş.\nTutar: 15.000,00 ₺",
      notification_type: "invoice_created",
      related_type: "invoice",
      related_id: null,
      is_read: false,
      target_roles: ["muhasebe_personeli", "ofis_sefi"],
      sent_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 saat önce
    },
    {
      user_id: user.id,
      type: "push",
      title: "Fatura Ödendi",
      message: "Fatura ödendi.\n\nFatura No: INV-2024-000455\nMüşteri: XYZ Sanayi Ltd.\nTutar: 8.500,00 ₺\nÖdeme Tarihi: Bugün",
      notification_type: "invoice_paid",
      related_type: "invoice",
      related_id: null,
      is_read: true,
      target_roles: ["muhasebe_personeli", "ofis_sefi"],
      sent_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 saat önce
    },
    // Müşteriler
    {
      user_id: user.id,
      type: "push",
      title: "Yeni Müşteri Eklendi",
      message: "Yeni müşteri eklendi.\n\nMüşteri: GHI Endüstri A.Ş.\nTelefon: 0212 555 1234\nAdres: İstanbul",
      notification_type: "customer_created",
      related_type: "customer",
      related_id: null,
      is_read: false,
      target_roles: ["ofis_personeli", "ofis_sefi"],
      sent_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 saat önce
    },
    {
      user_id: user.id,
      type: "push",
      title: "Müşteri Bilgileri Güncellendi",
      message: "Müşteri bilgileri güncellendi.\n\nMüşteri: DEF Elektrik A.Ş.\nGüncellenen: İletişim bilgileri",
      notification_type: "customer_updated",
      related_type: "customer",
      related_id: null,
      is_read: true,
      target_roles: ["ofis_personeli", "ofis_sefi"],
      sent_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 saat önce
    },
    // Araç-Gereçler
    {
      user_id: user.id,
      type: "push",
      title: "Araç-Gereç Zimmetlendi",
      message: "Araç-gereç zimmetlendi.\n\nAraç-Gereç: Multimetre (Fluke 87V)\nZimmetlenen: Ahmet Yılmaz\nTarih: Bugün",
      notification_type: "tool_assigned",
      related_type: "tool_assignment",
      related_id: null,
      is_read: false,
      target_roles: ["depo_sorunlusu", "saha_sefi"],
      sent_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 dakika önce
    },
    {
      user_id: user.id,
      type: "push",
      title: "Araç-Gereç İade Edildi",
      message: "Araç-gereç iade edildi.\n\nAraç-Gereç: Penset Seti\nİade Eden: Mehmet Demir\nTarih: Dün",
      notification_type: "tool_returned",
      related_type: "tool_assignment",
      related_id: null,
      is_read: true,
      target_roles: ["depo_sorunlusu", "saha_sefi"],
      sent_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 saat önce
    },
    // Malzeme Talepleri
    {
      user_id: user.id,
      type: "push",
      title: "Malzeme Talebi",
      message: "Yeni malzeme talebi.\n\nİş Emri No: WO-2024-000120\nÜrün: Trafo Yağı (10L)\nMiktar: 20",
      notification_type: "material_request",
      related_type: "work_order",
      related_id: null,
      is_read: false,
      target_roles: ["depo_sorunlusu", "ofis_personeli"],
      sent_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 dakika önce
    },
  ]);

  // Bildirimleri ekle
  const { data, error } = await supabase
    .from("notifications")
    .insert(demoNotifications)
    .select();

  if (error) {
    console.error("Hata:", error);
    return;
  }

  console.log(`\n✅ ${data.length} adet demo bildirim başarıyla eklendi!`);
  console.log(`   ${targetUsers.length} kullanıcıya ${demoNotifications.length / targetUsers.length} adet bildirim eklendi.`);
  console.log("\nEklenen bildirim kategorileri:");
  console.log("- İş Emirleri: 3 adet");
  console.log("- Stok İşlemleri: 3 adet");
  console.log("- Faturalar: 2 adet");
  console.log("- Müşteriler: 2 adet");
  console.log("- Araç-Gereçler: 2 adet");
  console.log("- Malzeme Talepleri: 1 adet");
}

addDemoNotificationsToCurrentUser()
  .then(() => {
    console.log("\n✅ İşlem tamamlandı!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Hata:", error);
    process.exit(1);
  });

