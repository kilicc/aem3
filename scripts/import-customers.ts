import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Environment variables'ı yükle
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY bulunamadı!");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface CustomerRow {
  [key: string]: any;
}

function parsePhone(phone: any): string | null {
  if (!phone) return null;
  
  // Telefon numarasını temizle
  let cleaned = phone.toString().trim();
  
  // Parantez, tire, boşluk gibi karakterleri kaldır
  cleaned = cleaned.replace(/[()\s-]/g, "");
  
  // Başında 0 varsa kaldır, +90 veya 90 varsa kaldır
  if (cleaned.startsWith("+90")) cleaned = cleaned.substring(3);
  if (cleaned.startsWith("90")) cleaned = cleaned.substring(2);
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  
  // 10 haneli telefon numarası kontrolü
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return cleaned;
  }
  
  // Orijinal değeri döndür (temizlenmiş hali)
  return cleaned || phone.toString().trim();
}

async function importCustomers() {
  console.log("\n👥 Müşteriler import ediliyor...\n");
  
  try {
    const workbook = XLSX.readFile("cari_liste.xlsx");
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: CustomerRow[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });
    
    console.log(`📄 Toplam ${data.length} müşteri bulundu\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const skippedRecords: Array<{
      row: number;
      name: string;
      reason: string;
      kod?: string;
      vkn?: string;
      phone?: string;
      address?: string;
    }> = [];
    
    // Admin kullanıcısını bul
    const { data: adminUser } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", "admin@aem.com.tr")
      .single();
    
    if (!adminUser) {
      console.error("❌ Admin kullanıcısı bulunamadı!");
      return;
    }
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Excel'de satır numarası (header + 1)
      
      try {
        // Kolonları map et
        const kod = row["Kod"]?.toString().trim() || null;
        const name = row["Ünvan"]?.toString().trim() || null;
        const vkn = row["VKN"]?.toString().trim() || null;
        const tcKimlik = row["T.C. Kimlik No"]?.toString().trim() || null;
        const taxOffice = row["Vergi Dairesi"]?.toString().trim() || null;
        const phone = parsePhone(row["Telefon"]);
        const email = row["e-Mail Adresi"]?.toString().trim() || null;
        const city = row["İl"]?.toString().trim() || null;
        const district = row["İlçe"]?.toString().trim() || null;
        const postalCode = row["Posta Kodu"]?.toString().trim() || null;
        const address = row["Adres"]?.toString().trim() || null;
        
        // Zorunlu alanlar
        if (!name) {
          const reason = "Ünvan zorunludur";
          errors.push(`Satır ${rowNum}: ${reason}`);
          skippedRecords.push({
            row: rowNum,
            name: "Ünvan Yok",
            reason,
            kod: kod || undefined,
            vkn: vkn || undefined,
            phone: row["Telefon"]?.toString().trim() || undefined,
            address: address || undefined,
          });
          errorCount++;
          continue;
        }
        
        if (!phone && !address) {
          const reason = "Telefon ve Adres bilgisi eksik (en az biri zorunlu)";
          errors.push(`Satır ${rowNum}: ${reason}`);
          skippedRecords.push({
            row: rowNum,
            name: name,
            reason,
            kod: kod || undefined,
            vkn: vkn || undefined,
            phone: row["Telefon"]?.toString().trim() || undefined,
            address: address || undefined,
          });
          errorCount++;
          continue;
        }
        
        // Notes alanını oluştur (Kod varsa)
        let notes = "";
        if (kod) notes += `Kod: ${kod}`;
        // T.C. Kimlik No varsa ve VKN yoksa, tax_id'ye ekle
        if (tcKimlik && !vkn) {
          // T.C. Kimlik No'yu notes'a ekle
          if (notes) notes += `\n`;
          notes += `T.C. Kimlik No: ${tcKimlik}`;
        } else if (tcKimlik && vkn) {
          // Hem VKN hem T.C. Kimlik varsa, T.C. Kimlik'i notes'a ekle
          if (notes) notes += `\n`;
          notes += `T.C. Kimlik No: ${tcKimlik}`;
        }
        notes = notes.trim() || null;
        
        // Mevcut müşteriyi kontrol et (VKN veya telefon ile)
        let existingCustomer = null;
        
        if (vkn) {
          const { data: existing } = await adminClient
            .from("customers")
            .select("id")
            .eq("tax_id", vkn)
            .single();
          if (existing) existingCustomer = existing;
        }
        
        // VKN yoksa telefon ile kontrol et
        if (!existingCustomer && phone) {
          const { data: existing } = await adminClient
            .from("customers")
            .select("id")
            .eq("phone", phone)
            .single();
          if (existing) existingCustomer = existing;
        }
        
        // VKN ve telefon yoksa isim ile kontrol et
        if (!existingCustomer && name) {
          const { data: existing } = await adminClient
            .from("customers")
            .select("id")
            .eq("name", name.trim())
            .limit(1)
            .single();
          if (existing) existingCustomer = existing;
        }
        
        // Müşteri verilerini hazırla (tüm alanlar eksiksiz)
        const customerData = {
          name: name.trim(),
          tax_id: vkn || tcKimlik || null, // VKN öncelikli, yoksa T.C. Kimlik No
          tax_office: taxOffice || null,
          email: email || null,
          phone: phone || "",
          address: address || "",
          city: city || null,
          district: district || null,
          postal_code: postalCode || null,
          notes: notes,
        };
        
        let error;
        if (existingCustomer) {
          // Mevcut kaydı güncelle
          console.log(`🔄 Satır ${rowNum}: ${name} - Mevcut kayıt güncelleniyor...`);
          const { error: updateError } = await adminClient
            .from("customers")
            .update(customerData)
            .eq("id", existingCustomer.id);
          error = updateError;
          if (!error) updatedCount++;
        } else {
          // Yeni kayıt oluştur
          const { error: insertError } = await adminClient
            .from("customers")
            .insert({
              ...customerData,
              created_by: adminUser.id,
            });
          error = insertError;
        }
        
        if (error) {
          errors.push(`Satır ${rowNum} (${name}): ${error.message}`);
          errorCount++;
        } else {
          if (existingCustomer) {
            console.log(`✅ Satır ${rowNum}: ${name} - Tüm bilgiler güncellendi`);
          } else {
            console.log(`✅ Satır ${rowNum}: ${name} - Yeni kayıt eklendi`);
          }
          successCount++;
        }
      } catch (err: any) {
        errors.push(`Satır ${rowNum}: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Müşteri Import Sonucu:`);
    console.log(`   ✅ Başarılı: ${successCount} (${successCount - updatedCount} yeni, ${updatedCount} güncellendi)`);
    console.log(`   ❌ Hatalı: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Hatalar:`);
      errors.slice(0, 20).forEach(err => console.log(`   - ${err}`));
      if (errors.length > 20) {
        console.log(`   ... ve ${errors.length - 20} hata daha`);
      }
    }
    
  } catch (err: any) {
    console.error("❌ Excel dosyası okunurken hata:", err.message);
  }
}

async function main() {
  console.log("📥 Müşteri Verileri Import Ediliyor...\n");
  console.log("=".repeat(50));
  
  await importCustomers();
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ Import işlemi tamamlandı!\n");
}

main().catch(console.error);
