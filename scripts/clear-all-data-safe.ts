/**
 * ⚠️ DİKKAT: Bu script tüm verileri siler, sadece admin@aem.com.tr kullanıcısı kalır
 * 
 * Kullanım:
 * npx tsx scripts/clear-all-data-safe.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// .env.local dosyasını yükle
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Supabase URL veya Service Role Key bulunamadı!");
  process.exit(1);
}

// Service role key ile client oluştur (RLS bypass)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function clearAllData() {
  console.log("🔄 Veriler siliniyor...\n");

  try {
    // 1. Admin kullanıcısını kontrol et
    const { data: adminUser, error: adminError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", "admin@aem.com.tr")
      .single();

    if (adminError || !adminUser) {
      console.error("❌ Admin kullanıcısı bulunamadı!");
      console.error("Hata:", adminError);
      process.exit(1);
    }

    console.log("✅ Admin kullanıcısı bulundu:", adminUser.email);

    // 2. Tüm verileri sil (doğru sırayla - foreign key constraint'leri için)
    console.log("\n📋 Veriler siliniyor...");

    // Önce child tabloları sil (foreign key constraint'leri için)
    
    // Faturalar (invoices) - work_orders'a bağlı
    const { error: invoicesError } = await supabase
      .from("invoices")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (invoicesError && !invoicesError.message.includes("Could not find")) {
      console.error("invoices:", invoicesError.message);
    } else {
      console.log("  ✅ Faturalar silindi");
    }

    // Fatura kalemleri
    const { error: invoiceItemsError } = await supabase
      .from("invoice_items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (invoiceItemsError && !invoiceItemsError.message.includes("Could not find")) {
      console.error("invoice_items:", invoiceItemsError.message);
    } else {
      console.log("  ✅ Fatura kalemleri silindi");
    }

    // Araç kullanım logları
    const { error: vehicleLogsError } = await supabase
      .from("vehicle_usage_logs")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (vehicleLogsError && !vehicleLogsError.message.includes("Could not find")) {
      console.error("vehicle_usage_logs:", vehicleLogsError.message);
    } else {
      console.log("  ✅ Araç kullanım logları silindi");
    }

    // İş emri malzemeleri
    const { error: workOrderMaterialsError } = await supabase
      .from("work_order_materials")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (workOrderMaterialsError && !workOrderMaterialsError.message.includes("Could not find")) {
      console.error("work_order_materials:", workOrderMaterialsError.message);
    } else {
      console.log("  ✅ İş emri malzemeleri silindi");
    }

    // İş emirleri (invoices'tan sonra)
    const { error: workOrdersError } = await supabase
      .from("work_orders")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (workOrdersError) {
      console.error("work_orders:", workOrdersError.message);
    } else {
      console.log("  ✅ İş emirleri silindi");
    }

    // Araç-gereç zimmetleri
    const { error: toolAssignmentsError } = await supabase
      .from("tool_assignments")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (toolAssignmentsError && !toolAssignmentsError.message.includes("Could not find")) {
      console.error("tool_assignments:", toolAssignmentsError.message);
    } else {
      console.log("  ✅ Araç-gereç zimmetleri silindi");
    }

    // Müşteri cihazları (work_orders'tan sonra)
    const { error: customerDevicesError } = await supabase
      .from("customer_devices")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (customerDevicesError && !customerDevicesError.message.includes("Could not find")) {
      console.error("customer_devices:", customerDevicesError.message);
    } else {
      console.log("  ✅ Müşteri cihazları silindi");
    }

    // Müşteriler (work_orders ve customer_devices'ten sonra)
    const { error: customersError } = await supabase
      .from("customers")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (customersError && !customersError.message.includes("Could not find")) {
      console.error("customers:", customersError.message);
    } else {
      console.log("  ✅ Müşteriler silindi");
    }

    // Bildirimler
    const { error: notificationsError } = await supabase
      .from("notifications")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (notificationsError) console.error("notifications:", notificationsError.message);
    else console.log("  ✅ Bildirimler silindi");

    // Stok kayıtları (warehouse_stock tablosu olabilir)
    try {
      const { error: stockError } = await supabase
        .from("warehouse_stock")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (stockError && !stockError.message.includes("Could not find")) {
        console.error("warehouse_stock:", stockError.message);
      } else {
        console.log("  ✅ Stok kayıtları silindi");
      }
    } catch (e) {
      // Tablo yoksa sessizce geç
    }

    // Araç-gereçler
    const { error: toolsError } = await supabase
      .from("tools")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (toolsError) console.error("tools:", toolsError.message);
    else console.log("  ✅ Araç-gereçler silindi");

    // Ürünler
    const { error: productsError } = await supabase
      .from("products")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (productsError) console.error("products:", productsError.message);
    else console.log("  ✅ Ürünler silindi");

    // Araçlar
    const { error: vehiclesError } = await supabase
      .from("vehicles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (vehiclesError) console.error("vehicles:", vehiclesError.message);
    else console.log("  ✅ Araçlar silindi");

    // Depolar
    const { error: warehousesError } = await supabase
      .from("warehouses")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (warehousesError) console.error("warehouses:", warehousesError.message);
    else console.log("  ✅ Depolar silindi");

    // Hizmetler (varsayılan hariç)
    const { error: servicesError } = await supabase
      .from("services")
      .delete()
      .neq("name", "Arıza Bakım ve Malzeme Sipariş Fişi");
    if (servicesError) console.error("services:", servicesError.message);
    else console.log("  ✅ Hizmetler silindi (varsayılan korundu)");

    // Profiller (admin hariç) - customers'tan sonra
    const { error: profilesError } = await supabase
      .from("profiles")
      .delete()
      .neq("email", "admin@aem.com.tr");
    if (profilesError && !profilesError.message.includes("Could not find")) {
      console.error("profiles:", profilesError.message);
    } else {
      console.log("  ✅ Profiller silindi (admin korundu)");
    }

    // Auth users (admin hariç) - Bu için service role key gerekli
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    if (!authUsersError && authUsers) {
      for (const user of authUsers.users) {
        if (user.email && user.email.toLowerCase() !== "admin@aem.com.tr") {
          try {
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
            if (deleteError) {
              console.error(`Auth user silme hatası (${user.email}):`, deleteError.message);
            } else {
              console.log(`  ✅ Auth user silindi: ${user.email}`);
            }
          } catch (e: any) {
            console.error(`Auth user silme hatası (${user.email}):`, e.message);
          }
        }
      }
    }

    // Kontrol: Sadece admin kaldı mı?
    console.log("\n📊 Kontrol ediliyor...\n");

    const { data: remainingProfiles } = await supabase
      .from("profiles")
      .select("id, email, full_name");

    console.log("Kalan kullanıcılar:");
    if (remainingProfiles && remainingProfiles.length > 0) {
      remainingProfiles.forEach((profile) => {
        console.log(`  ✅ ${profile.email} - ${profile.full_name || "İsimsiz"}`);
      });
    } else {
      console.log("  ⚠️ Hiç kullanıcı kalmadı!");
    }

    console.log("\n✅ Tüm veriler silindi! Sadece admin@aem.com.tr kullanıcısı kaldı.");
  } catch (error) {
    console.error("❌ Hata oluştu:", error);
    process.exit(1);
  }
}

// Script'i çalıştır
clearAllData();

