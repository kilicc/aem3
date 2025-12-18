import * as XLSX from "xlsx";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

function checkColumns(fileName: string) {
  console.log(`\n📄 ${fileName} dosyası analiz ediliyor...\n`);
  
  try {
    const workbook = XLSX.readFile(fileName);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Tüm satırları oku
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
    
    if (data.length > 0) {
      console.log("=".repeat(80));
      console.log("KOLON YAPISI ANALİZİ");
      console.log("=".repeat(80));
      
      // İlk satır (başlık satırı)
      const headerRow1 = data[0] as any[];
      console.log("\n📋 İLK SATIR (Ana Başlıklar):");
      headerRow1.forEach((header, index) => {
        if (header && header.toString().trim() !== "") {
          console.log(`   ${index + 1}. ${header}`);
        }
      });
      
      // İkinci satır (alt başlıklar)
      if (data.length > 1) {
        const headerRow2 = data[1] as any[];
        console.log("\n📋 İKİNCİ SATIR (Alt Başlıklar):");
        headerRow2.forEach((header, index) => {
          if (header && header.toString().trim() !== "") {
            console.log(`   ${index + 1}. ${header}`);
          }
        });
      }
      
      // İlk 3 veri satırını göster
      console.log("\n📊 İLK 3 VERİ SATIRI:");
      for (let i = 2; i < Math.min(5, data.length); i++) {
        console.log(`\n--- Satır ${i + 1} ---`);
        const row = data[i] as any[];
        const headerRow2 = data[1] as any[];
        row.forEach((cell, index) => {
          if (cell !== "" && cell !== null && cell !== undefined) {
            const header = headerRow2[index] || `Kolon ${index + 1}`;
            console.log(`   ${header}: ${cell}`);
          }
        });
      }
      
      // Toplam kolon sayısı
      const maxCols = Math.max(...data.map(row => (row as any[]).length));
      console.log(`\n📈 Toplam Kolon Sayısı: ${maxCols}`);
      console.log(`📈 Toplam Satır Sayısı: ${data.length} (${data.length - 2} veri satırı)`);
    }
  } catch (err: any) {
    console.error(`❌ Hata: ${err.message}`);
  }
}

checkColumns("PERSONEL.xlsx");

