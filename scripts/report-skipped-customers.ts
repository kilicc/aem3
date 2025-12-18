import * as XLSX from "xlsx";
import * as dotenv from "dotenv";
import { resolve } from "path";
import * as fs from "fs";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

function parsePhone(phone: any): string | null {
  if (!phone) return null;
  
  let cleaned = phone.toString().trim();
  cleaned = cleaned.replace(/[()\s-]/g, "");
  
  if (cleaned.startsWith("+90")) cleaned = cleaned.substring(3);
  if (cleaned.startsWith("90")) cleaned = cleaned.substring(2);
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return cleaned;
  }
  
  return cleaned || phone.toString().trim();
}

async function reportSkippedCustomers() {
  console.log("\n📋 Atlanan Müşteri Kayıtları Raporu\n");
  console.log("=".repeat(80));
  
  try {
    const workbook = XLSX.readFile("cari_liste.xlsx");
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });
    
    const skippedRecords: Array<{
      satir: number;
      kod: string | null;
      unvan: string | null;
      vkn: string | null;
      telefon: string | null;
      adres: string | null;
      email: string | null;
      sehir: string | null;
      ilce: string | null;
      sebep: string;
    }> = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;
      
      const kod = row["Kod"]?.toString().trim() || null;
      const name = row["Ünvan"]?.toString().trim() || null;
      const vkn = row["VKN"]?.toString().trim() || null;
      const phone = parsePhone(row["Telefon"]);
      const email = row["e-Mail Adresi"]?.toString().trim() || null;
      const city = row["İl"]?.toString().trim() || null;
      const district = row["İlçe"]?.toString().trim() || null;
      const address = row["Adres"]?.toString().trim() || null;
      
      // Zorunlu alan kontrolü
      if (!name) {
        skippedRecords.push({
          satir: rowNum,
          kod,
          unvan: name,
          vkn,
          telefon: phone,
          adres: address,
          email,
          sehir: city,
          ilce: district,
          sebep: "Ünvan eksik",
        });
        continue;
      }
      
      if (!phone && !address) {
        skippedRecords.push({
          satir: rowNum,
          kod,
          unvan: name,
          vkn,
          telefon: phone,
          adres: address,
          email,
          sehir: city,
          ilce: district,
          sebep: "Telefon ve Adres eksik (en az biri gerekli)",
        });
        continue;
      }
    }
    
    // Rapor dosyası oluştur
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const filename = `atlanan-musteriler-${timestamp}.txt`;
    
    let content = "=".repeat(80) + "\n";
    content += "ATLANAN MÜŞTERİ KAYITLARI RAPORU\n";
    content += "=".repeat(80) + "\n\n";
    content += `Rapor Tarihi: ${new Date().toLocaleString("tr-TR")}\n`;
    content += `Toplam Atlanan Kayıt: ${skippedRecords.length}\n\n`;
    content += "=".repeat(80) + "\n\n";
    
    if (skippedRecords.length === 0) {
      content += "✅ Atlanan kayıt bulunmamaktadır.\n";
    } else {
      skippedRecords.forEach((record, index) => {
        content += `${index + 1}. Satır ${record.satir}\n`;
        content += `   Ünvan: ${record.unvan || "(Eksik)"}\n`;
        content += `   Kod: ${record.kod || "(Yok)"}\n`;
        content += `   VKN: ${record.vkn || "(Yok)"}\n`;
        content += `   Telefon: ${record.telefon || "(Eksik)"}\n`;
        content += `   E-posta: ${record.email || "(Yok)"}\n`;
        content += `   Şehir: ${record.sehir || "(Yok)"}\n`;
        content += `   İlçe: ${record.ilce || "(Yok)"}\n`;
        content += `   Adres: ${record.adres || "(Eksik)"}\n`;
        content += `   Sebep: ${record.sebep}\n`;
        content += "\n" + "-".repeat(80) + "\n\n";
      });
    }
    
    content += "\n" + "=".repeat(80) + "\n";
    content += "ÖNEMLİ NOTLAR:\n";
    content += "=".repeat(80) + "\n";
    content += "1. Bu kayıtlar telefon ve/veya adres bilgisi eksik olduğu için atlanmıştır.\n";
    content += "2. Bu kayıtları sisteme eklemek için eksik bilgileri tamamlayın.\n";
    content += "3. Telefon veya Adres alanlarından en az biri dolu olmalıdır.\n";
    content += "=".repeat(80) + "\n";
    
    fs.writeFileSync(filename, content, "utf-8");
    
    // Konsola özet
    console.log(`📊 Toplam ${skippedRecords.length} kayıt atlandı\n`);
    
    if (skippedRecords.length > 0) {
      console.log("📋 Atlanan Kayıtlar:\n");
      skippedRecords.slice(0, 20).forEach((record, index) => {
        console.log(`${index + 1}. Satır ${record.satir}: ${record.unvan || "(Ünvan Yok)"}`);
        console.log(`   Sebep: ${record.sebep}`);
        console.log(`   Telefon: ${record.telefon || "Eksik"} | Adres: ${record.adres ? "Var" : "Eksik"}\n`);
      });
      
      if (skippedRecords.length > 20) {
        console.log(`   ... ve ${skippedRecords.length - 20} kayıt daha\n`);
      }
    }
    
    console.log(`\n📝 Detaylı rapor '${filename}' dosyasına kaydedildi.\n`);
    
  } catch (err: any) {
    console.error("❌ Hata:", err.message);
  }
}

reportSkippedCustomers().catch(console.error);

