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
      const headerRow = data[0] as any[];
      console.log("\n📋 KOLON İSİMLERİ (İlk Satır):");
      headerRow.forEach((header, index) => {
        if (header && header.toString().trim() !== "") {
          console.log(`   ${index + 1}. ${header}`);
        }
      });
      
      // İlk 3 veri satırını göster
      console.log("\n📊 İLK 3 VERİ SATIRI:");
      for (let i = 1; i < Math.min(4, data.length); i++) {
        console.log(`\n--- Satır ${i + 1} ---`);
        const row = data[i] as any[];
        row.forEach((cell, index) => {
          if (cell !== "" && cell !== null && cell !== undefined) {
            const header = headerRow[index] || `Kolon ${index + 1}`;
            console.log(`   ${header}: ${cell}`);
          }
        });
      }
      
      // Toplam kolon sayısı
      const maxCols = Math.max(...data.map(row => (row as any[]).length));
      console.log(`\n📈 Toplam Kolon Sayısı: ${maxCols}`);
      console.log(`📈 Toplam Satır Sayısı: ${data.length} (${data.length - 1} veri satırı)`);
    }
  } catch (err: any) {
    console.error(`❌ Hata: ${err.message}`);
  }
}

checkColumns("cari_liste.xlsx");
