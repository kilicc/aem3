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

interface VehicleRow {
  [key: string]: any;
}

interface EmployeeRow {
  [key: string]: any;
}

function parseDate(value: any): string | null {
  if (!value) return null;
  
  // Excel tarih numarası mı?
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    return date.toISOString().split('T')[0];
  }
  
  // String ise parse et
  if (typeof value === 'string') {
    // DD.MM.YYYY formatı
    if (value.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      const [day, month, year] = value.split('.');
      return `${year}-${month}-${day}`;
    }
    // DD/MM/YYYY formatı
    if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = value.split('/');
      return `${year}-${month}-${day}`;
    }
    // YYYY-MM-DD formatı
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return value;
    }
  }
  
  // Date objesi ise
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  
  return null;
}

function parseNumber(value: any): number | null {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

async function importVehicles() {
  console.log("\n🚗 Araçlar import ediliyor...\n");
  
  try {
    const workbook = XLSX.readFile("ARAÇLAR.xlsx");
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: VehicleRow[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });
    
    console.log(`📄 Toplam ${data.length} araç bulundu\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
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
        // Kolonları map et (Excel'deki kolon isimlerine göre)
        const plateNumber = row["PLAKA NUMARASI"] || row["Plaka Numarası"] || row["PLAKA"] || null;
        const brand = row["MARKA"] || row["Marka"] || null;
        const model = row["MODEL"] || row["Model"] || null;
        const year = parseNumber(row["ÜRETİM YILI"] || row["Üretim Yılı"]);
        const color = row["RENK"] || row["Renk"] || null;
        const mileage = parseNumber(row["KİLOMETRE"] || row["Kilometre"] || row["KM"] || 0);
        const fuelType = row["YAKIT TİPİ"] || row["Yakıt Tipi"] || null;
        const chassisNumber = row["ŞASİ NUMARASI"] || row["Şasi Numarası"] || null;
        const engineNumber = row["MOTOR NUMARASI"] || row["Motor Numarası"] || null;
        const licensePlateDate = parseDate(row["RUHSAT TARİHİ"] || row["Ruhsat Tarihi"]);
        const licenseNumber = row["RUHSAT NO"] || row["Ruhsat No"] || null;
        const insuranceCompany = row["SİGORTA ŞİRKETİ"] || row["Sigorta Şirketi"] || null;
        const insurancePolicyNumber = row["SİGORTA POLİÇE NUMARASI"] || row["Sigorta Poliçe Numarası"] || null;
        const insurancePremium = parseNumber(row["SİGORTA PRİM TUTARI"] || row["Sigorta Prim Tutarı"]);
        const insuranceExpiryDate = parseDate(row["SİGORTA BİTİŞ TARİHİ"] || row["Sigorta Bitiş Tarihi"]);
        const kaskoCompany = row["KASKO ŞİRKETİ"] || row["Kasko Şirketi"] || null;
        const kaskoPolicyNumber = row["KASKO POLİÇE NUMARASI"] || row["Kasko Poliçe Numarası"] || null;
        const kaskoStartDate = parseDate(row["KASKO BAŞLANGIÇ TARİHİ"] || row["Kasko Başlangıç Tarihi"]);
        const kaskoExpiryDate = parseDate(row["KASKO BİTİŞ TARİHİ"] || row["Kasko Bitiş Tarihi"]);
        const kaskoPremium = parseNumber(row["KASKO PRİM TUTARI"] || row["Kasko Prim Tutarı"]);
        const lastMaintenanceDate = parseDate(row["SON BAKIM TARİHİ"] || row["Son Bakım Tarihi"]);
        const maintenanceIntervalKm = parseNumber(row["BAKIM ARALIĞI (KM)"] || row["Bakım Aralığı (KM)"]) || 10000;
        const status = row["DURUM"] || row["Durum"] || "active";
        
        if (!plateNumber || !brand || !model) {
          errors.push(`Satır ${rowNum}: Plaka, Marka ve Model zorunludur`);
          errorCount++;
          continue;
        }
        
        // Mevcut araç kontrolü
        const { data: existing } = await adminClient
          .from("vehicles")
          .select("id")
          .eq("plate_number", plateNumber.trim().toUpperCase())
          .single();
        
        if (existing) {
          console.log(`⚠️  Satır ${rowNum}: ${plateNumber} zaten kayıtlı, atlanıyor...`);
          continue;
        }
        
        // Yakıt tipini normalize et
        let normalizedFuelType = null;
        if (fuelType) {
          const fuelLower = fuelType.toLowerCase().trim();
          if (fuelLower.includes("benzin")) normalizedFuelType = "benzin";
          else if (fuelLower.includes("dizel")) normalizedFuelType = "dizel";
          else if (fuelLower.includes("elektrik")) normalizedFuelType = "elektrik";
          else if (fuelLower.includes("hibrit")) normalizedFuelType = "hibrit";
          else if (fuelLower.includes("lpg")) normalizedFuelType = "lpg";
        }
        
        // Durumu normalize et
        let normalizedStatus = "active";
        if (status) {
          const statusLower = status.toLowerCase().trim();
          if (statusLower.includes("aktif") || statusLower.includes("active")) normalizedStatus = "active";
          else if (statusLower.includes("bakım") || statusLower.includes("maintenance")) normalizedStatus = "maintenance";
          else if (statusLower.includes("pasif") || statusLower.includes("inactive")) normalizedStatus = "inactive";
        }
        
        const { error } = await adminClient
          .from("vehicles")
          .insert({
            plate_number: plateNumber.trim().toUpperCase(),
            brand: brand.trim(),
            model: model.trim(),
            year: year ? Math.floor(year) : null,
            color: color?.trim() || null,
            chassis_number: chassisNumber?.trim() || null,
            engine_number: engineNumber?.trim() || null,
            fuel_type: normalizedFuelType,
            license_plate_date: licensePlateDate,
            insurance_company: insuranceCompany?.trim() || null,
            insurance_policy_number: insurancePolicyNumber?.trim() || null,
            insurance_expiry_date: insuranceExpiryDate,
            kasko_company: kaskoCompany?.trim() || null,
            kasko_policy_number: kaskoPolicyNumber?.trim() || null,
            kasko_start_date: kaskoStartDate,
            kasko_expiry_date: kaskoExpiryDate,
            kasko_premium: kaskoPremium,
            last_maintenance_date: lastMaintenanceDate,
            maintenance_interval_km: maintenanceIntervalKm,
            mileage: mileage || 0,
            status: normalizedStatus,
            created_by: adminUser.id,
          });
        
        if (error) {
          errors.push(`Satır ${rowNum} (${plateNumber}): ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Satır ${rowNum}: ${plateNumber} - ${brand} ${model} eklendi`);
          successCount++;
        }
      } catch (err: any) {
        errors.push(`Satır ${rowNum}: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Araç Import Sonucu:`);
    console.log(`   ✅ Başarılı: ${successCount}`);
    console.log(`   ❌ Hatalı: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Hatalar:`);
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
  } catch (err: any) {
    console.error("❌ Excel dosyası okunurken hata:", err.message);
  }
}

async function importEmployees() {
  console.log("\n👥 Personel import ediliyor...\n");
  
  try {
    const workbook = XLSX.readFile("PERSONEL.xlsx");
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Personel dosyasında header 2 satır, veriler 3. satırdan başlıyor
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
    
    // İlk 2 satırı atla (header'lar)
    const dataRows = rawData.slice(2);
    
    console.log(`📄 Toplam ${dataRows.length} personel bulundu\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
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
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 3; // Excel'de satır numarası (2 header + 1)
      
      try {
        // Personel dosyasında kolonlar şu sırada:
        // 0: PERSONEL NO
        // 1: T.C KİMLİK NO
        // 2: AD
        // 3: SOYAD
        // 4: DOĞUM TARİHİ
        // 5: DOĞUM YERİ
        // 6: CİNSİYET
        // 7: MEDENİ DURUM
        // 8: KAN GRUBU
        // 9: TELEFON
        // 10: E-POSTA
        // 11: İL
        // 12: İLÇE
        // 13: ADRES
        // 14: ACİL DURUM AD SOYAD
        // 15: ACİL DURUM TELEFON
        // 16: ACİL DURUM YAKINLIK
        // 17: İŞE BAŞLAMA TARİHİ
        // 18: İŞTEN AYRILMA TARİHİ
        // 19: DEPARTMAN
        // 20: POZİSYON/UNVAN
        // 21: MAAŞ
        // 22: DURUM
        
        const employeeNumber = row[0]?.toString().trim() || null;
        const tcIdentity = row[1]?.toString().trim() || null;
        const firstName = row[2]?.toString().trim() || null;
        const lastName = row[3]?.toString().trim() || null;
        const birthDate = parseDate(row[4]);
        const birthPlace = row[5]?.toString().trim() || null;
        const gender = row[6]?.toString().trim() || null;
        const maritalStatus = row[7]?.toString().trim() || null;
        const bloodType = row[8]?.toString().trim() || null;
        const phone = row[9]?.toString().trim() || null;
        const email = row[10]?.toString().trim() || null;
        const city = row[11]?.toString().trim() || null;
        const district = row[12]?.toString().trim() || null;
        const address = row[13]?.toString().trim() || null;
        const emergencyContactName = row[14]?.toString().trim() || null;
        const emergencyContactPhone = row[15]?.toString().trim() || null;
        const emergencyContactRelation = row[16]?.toString().trim() || null;
        const hireDate = parseDate(row[17]);
        const terminationDate = parseDate(row[18]);
        const department = row[19]?.toString().trim() || null;
        const position = row[20]?.toString().trim() || null;
        const salary = parseNumber(row[21]);
        const status = row[22]?.toString().trim() || "AKTİF";
        
        // Ad ve soyad kontrolü
        if (!firstName || !lastName) {
          errors.push(`Satır ${rowNum}: Ad ve Soyad zorunludur`);
          errorCount++;
          continue;
        }
        
        // Boş satır kontrolü
        if (firstName.trim() === "" && lastName.trim() === "") {
          console.log(`⏭️  Satır ${rowNum}: Boş satır, atlanıyor...`);
          continue;
        }
        
        // Cinsiyet normalize et
        let normalizedGender = null;
        if (gender) {
          const genderLower = gender.toLowerCase().trim();
          if (genderLower.includes("erkek") || genderLower.includes("male")) normalizedGender = "erkek";
          else if (genderLower.includes("kadın") || genderLower.includes("female")) normalizedGender = "kadın";
        }
        
        // Medeni durum normalize et
        let normalizedMaritalStatus = null;
        if (maritalStatus) {
          const statusLower = maritalStatus.toLowerCase().trim();
          if (statusLower.includes("bekar") || statusLower.includes("single")) normalizedMaritalStatus = "bekar";
          else if (statusLower.includes("evli") || statusLower.includes("married")) normalizedMaritalStatus = "evli";
          else if (statusLower.includes("boşanmış") || statusLower.includes("divorced")) normalizedMaritalStatus = "boşanmış";
          else if (statusLower.includes("dul") || statusLower.includes("widowed")) normalizedMaritalStatus = "dul";
        }
        
        // Kan grubu normalize et
        let normalizedBloodType = null;
        if (bloodType) {
          const blood = bloodType.toString().trim().toUpperCase().replace(/\s+/g, "");
          if (blood.match(/^[AB0]\+$/)) normalizedBloodType = blood;
          else if (blood.match(/^[AB0]-$/)) normalizedBloodType = blood;
          else if (blood.match(/^0RH\+$/)) normalizedBloodType = "0+";
          else if (blood.match(/^0RH-$/)) normalizedBloodType = "0-";
          else if (blood.match(/^A\+$/)) normalizedBloodType = "A+";
          else if (blood.match(/^A-$/)) normalizedBloodType = "A-";
          else if (blood.match(/^B\+$/)) normalizedBloodType = "B+";
          else if (blood.match(/^B-$/)) normalizedBloodType = "B-";
          else if (blood.match(/^AB\+$/)) normalizedBloodType = "AB+";
          else if (blood.match(/^AB-$/)) normalizedBloodType = "AB-";
        }
        
        // Durum normalize et
        const isActive = status?.toUpperCase().includes("AKTİF") || status?.toUpperCase().includes("ACTIVE") || false;
        
        // Mevcut kaydı kontrol et (TC kimlik, personel no veya ad-soyad ile)
        let existingEmployee = null;
        
        // Önce TC kimlik ile kontrol et
        if (tcIdentity) {
          const { data: existing } = await adminClient
            .from("employees")
            .select("id")
            .eq("tc_identity_number", tcIdentity.toString().trim())
            .single();
          if (existing) existingEmployee = existing;
        }
        
        // Personel no ile kontrol et
        if (!existingEmployee && employeeNumber) {
          const { data: existing } = await adminClient
            .from("employees")
            .select("id")
            .eq("employee_number", employeeNumber.toString().trim())
            .single();
          if (existing) existingEmployee = existing;
        }
        
        // Ad-soyad ile kontrol et (son çare)
        if (!existingEmployee && firstName && lastName) {
          const { data: existing } = await adminClient
            .from("employees")
            .select("id")
            .eq("first_name", firstName.trim())
            .eq("last_name", lastName.trim())
            .limit(1)
            .single();
          if (existing) existingEmployee = existing;
        }
        
        // Tüm alanları eksiksiz hazırla
        const employeeData = {
          // Kişisel Bilgiler
          employee_number: employeeNumber?.toString().trim() || null,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          tc_identity_number: tcIdentity?.toString().trim() || null,
          birth_date: birthDate,
          birth_place: birthPlace?.toString().trim() || null,
          gender: normalizedGender,
          marital_status: normalizedMaritalStatus,
          blood_type: normalizedBloodType,
          
          // İletişim Bilgileri
          phone: phone?.toString().trim() || null,
          email: email?.toString().trim() || null,
          city: city?.toString().trim() || null,
          district: district?.toString().trim() || null,
          address: address?.toString().trim() || null,
          postal_code: null, // Excel'de yok
          
          // Acil Durum İletişim
          emergency_contact_name: emergencyContactName?.toString().trim() || null,
          emergency_contact_phone: emergencyContactPhone?.toString().trim() || null,
          emergency_contact_relation: emergencyContactRelation?.toString().trim() || null,
          
          // İş Bilgileri
          hire_date: hireDate,
          termination_date: terminationDate,
          department: department?.toString().trim() || null,
          position: position?.toString().trim() || null,
          salary: salary,
          is_active: isActive,
        };
        
        let error;
        if (existingEmployee) {
          // Mevcut kaydı güncelle (tüm alanları)
          console.log(`🔄 Satır ${rowNum}: ${firstName} ${lastName} - Mevcut kayıt güncelleniyor...`);
          const { error: updateError } = await adminClient
            .from("employees")
            .update(employeeData)
            .eq("id", existingEmployee.id);
          error = updateError;
        } else {
          // Yeni kayıt oluştur
          const { error: insertError } = await adminClient
            .from("employees")
            .insert({
              ...employeeData,
              // Excel'de olmayan alanlar (null olarak bırak)
              bank_name: null,
              bank_account_number: null,
              iban: null,
              driving_license_number: null,
              driving_license_class: null,
              education_level: null,
              school_name: null,
              graduation_year: null,
              notes: null,
              created_by: adminUser.id,
            });
          error = insertError;
        }
        
        if (error) {
          errors.push(`Satır ${rowNum} (${firstName || ""} ${lastName || ""}): ${error.message}`);
          errorCount++;
        } else {
          if (existingEmployee) {
            console.log(`✅ Satır ${rowNum}: ${firstName} ${lastName} - Tüm bilgiler güncellendi`);
          } else {
            console.log(`✅ Satır ${rowNum}: ${firstName} ${lastName} - Yeni kayıt eklendi`);
          }
          successCount++;
        }
      } catch (err: any) {
        errors.push(`Satır ${rowNum}: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Personel Import Sonucu:`);
    console.log(`   ✅ Başarılı: ${successCount}`);
    console.log(`   ❌ Hatalı: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Hatalar:`);
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
  } catch (err: any) {
    console.error("❌ Excel dosyası okunurken hata:", err.message);
  }
}

async function main() {
  console.log("📥 Excel Verileri Import Ediliyor...\n");
  console.log("=" .repeat(50));
  
  await importVehicles();
  await importEmployees();
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ Import işlemi tamamlandı!\n");
}

main().catch(console.error);

