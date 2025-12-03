const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Ortam değişkenleri bulunamadı. .env.local dosyasını kontrol edin.");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createSingleService() {
  const serviceName = "Arıza Bakım ve Malzeme Sipariş Fişi";
  
  console.log("\n🔧 Tek hizmet oluşturuluyor/güncelleniyor...\n");

  try {
    // Mevcut tüm hizmetleri kontrol et
    const { data: existingServices } = await adminClient
      .from("services")
      .select("*");

    // Eğer "Arıza Bakım ve Malzeme Sipariş Fişi" hizmeti varsa güncelle, yoksa oluştur
    const targetService = existingServices?.find(s => s.name === serviceName);

    const serviceFormTemplate = {
      fields: [
        { type: "text", label: "Form No", name: "form_number", required: false },
        { type: "text", label: "Tarih", name: "date", required: false },
        { type: "text", label: "SAYIN", name: "sayin", required: false },
        { type: "text", label: "ADRES", name: "address", required: false },
        { type: "text", label: "T.C.V.NO.-V.D.", name: "tax_id", required: false },
        { type: "text", label: "TEL.", name: "phone", required: false },
        { type: "time", label: "İŞE BAŞLAMA SAATİ", name: "start_time", required: false },
        { type: "time", label: "BİTİŞ SAATİ", name: "end_time", required: false },
        { type: "text", label: "PERSONEL", name: "personnel", required: false },
        { type: "textarea", label: "NOT", name: "note", required: false },
      ],
    };

    if (targetService) {
      // Mevcut hizmeti güncelle
      const { error: updateError } = await adminClient
        .from("services")
        .update({
          name: serviceName,
          description: "Arıza bakım ve malzeme sipariş fişi hizmeti",
          is_active: true,
          service_form_template: serviceFormTemplate,
        })
        .eq("id", targetService.id);

      if (updateError) {
        console.error("❌ Hizmet güncellenirken hata:", updateError.message);
        return;
      }

      console.log("✅ Mevcut hizmet güncellendi!");
    } else {
      // Yeni hizmet oluştur
      const { data: newService, error: createError } = await adminClient
        .from("services")
        .insert({
          name: serviceName,
          description: "Arıza bakım ve malzeme sipariş fişi hizmeti",
          is_active: true,
          service_form_template: serviceFormTemplate,
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Hizmet oluşturulurken hata:", createError.message);
        return;
      }

      console.log("✅ Yeni hizmet oluşturuldu!");
    }

    // Diğer tüm hizmetleri pasif yap veya sil
    if (existingServices && existingServices.length > 0) {
      const otherServices = existingServices.filter(s => s.name !== serviceName);
      if (otherServices.length > 0) {
        const { error: deactivateError } = await adminClient
          .from("services")
          .update({ is_active: false })
          .neq("name", serviceName);

        if (deactivateError) {
          console.error("⚠️  Diğer hizmetler pasif yapılırken hata:", deactivateError.message);
        } else {
          console.log(`✅ ${otherServices.length} hizmet pasif yapıldı.`);
        }
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 Hizmet:", serviceName);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
}

createSingleService();

