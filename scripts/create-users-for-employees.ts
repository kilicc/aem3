import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import * as fs from "fs";

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

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  employee_number: string | null;
  tc_identity_number: string | null;
  user_id: string | null;
}

function generatePassword(firstName: string, lastName: string, employeeNumber?: string | null): string {
  // İlk harf büyük, geri kalan küçük
  const firstChar = firstName.charAt(0).toUpperCase();
  const lastChar = lastName.charAt(0).toUpperCase();
  
  // Personel numarası varsa son 4 hanesini al, yoksa random 4 rakam
  const numberPart = employeeNumber 
    ? employeeNumber.slice(-4).padStart(4, '0')
    : Math.floor(1000 + Math.random() * 9000).toString();
  
  // Şifre formatı: İlkAdİlkSoyad4Rakam! (örn: AA1234!)
  return `${firstChar}${lastChar}${numberPart}!`;
}

function generateEmail(firstName: string, lastName: string): string {
  // Email formatı: ad.soyad@aemakgun.com.tr
  const cleanFirstName = firstName
    .toLowerCase()
    .replace(/[^a-zçğıöşü]/g, '')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
  
  const cleanLastName = lastName
    .toLowerCase()
    .replace(/[^a-zçğıöşü]/g, '')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
  
  let email = `${cleanFirstName}.${cleanLastName}@aemakgun.com.tr`;
  
  return email;
}

async function createUsersForEmployees() {
  console.log("👥 Personeller için kullanıcı hesapları oluşturuluyor...\n");
  
  try {
    // Tüm personelleri getir (user_id olmayanlar)
    const { data: employees, error: fetchError } = await adminClient
      .from("employees")
      .select("id, first_name, last_name, email, phone, employee_number, tc_identity_number, user_id")
      .order("first_name", { ascending: true });
    
    if (fetchError) {
      console.error("❌ Personeller getirilirken hata:", fetchError.message);
      return;
    }
    
    if (!employees || employees.length === 0) {
      console.log("⚠️  Hiç personel bulunamadı!");
      return;
    }
    
    console.log(`📄 Toplam ${employees.length} personel bulundu\n`);
    
    const userCredentials: Array<{
      employeeNumber: string | null;
      name: string;
      email: string;
      password: string;
      phone: string | null;
    }> = [];
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    
    for (const employee of employees as Employee[]) {
      try {
        // Zaten kullanıcı hesabı varsa atla
        if (employee.user_id) {
          console.log(`⏭️  ${employee.first_name} ${employee.last_name} zaten kullanıcı hesabına sahip, atlanıyor...`);
          skippedCount++;
          continue;
        }
        
        // Email oluştur veya mevcut email'i kullan
        let email = employee.email;
        
        // Email yoksa veya geçersizse oluştur
        if (!email || !email.includes("@")) {
          email = generateEmail(employee.first_name, employee.last_name);
          
          // Email'in unique olup olmadığını kontrol et
          let counter = 1;
          let finalEmail = email;
          while (true) {
            const { data: existing } = await adminClient
              .from("profiles")
              .select("id")
              .eq("email", finalEmail)
              .single();
            
            if (!existing) break;
            
            finalEmail = `${cleanFirstName}.${cleanLastName}${counter}@aemakgun.com.tr`;
            counter++;
          }
          
          email = finalEmail;
        }
        
        // Email'in unique olduğunu kontrol et
        const { data: existingProfile } = await adminClient
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();
        
        if (existingProfile) {
          console.log(`⚠️  ${employee.first_name} ${employee.last_name} için email ${email} zaten kullanılıyor, atlanıyor...`);
          skippedCount++;
          continue;
        }
        
        // Şifre oluştur
        const password = generatePassword(
          employee.first_name,
          employee.last_name,
          employee.employee_number
        );
        
        // Auth kullanıcısı oluştur
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        
        if (authError || !authData.user) {
          errors.push(`${employee.first_name} ${employee.last_name}: ${authError?.message || "Kullanıcı oluşturulamadı"}`);
          errorCount++;
          continue;
        }
        
        // Profile oluştur
        const { error: profileError } = await adminClient
          .from("profiles")
          .insert({
            id: authData.user.id,
            email,
            full_name: `${employee.first_name} ${employee.last_name}`,
            phone: employee.phone,
            role: "user", // Varsayılan rol
          });
        
        if (profileError) {
          // Auth kullanıcısını sil
          await adminClient.auth.admin.deleteUser(authData.user.id);
          errors.push(`${employee.first_name} ${employee.last_name}: ${profileError.message}`);
          errorCount++;
          continue;
        }
        
        // Employee'ye user_id ekle
        const { error: updateError } = await adminClient
          .from("employees")
          .update({ user_id: authData.user.id })
          .eq("id", employee.id);
        
        if (updateError) {
          console.warn(`⚠️  ${employee.first_name} ${employee.last_name} için user_id güncellenemedi: ${updateError.message}`);
        }
        
        userCredentials.push({
          employeeNumber: employee.employee_number || null,
          name: `${employee.first_name} ${employee.last_name}`,
          email,
          password,
          phone: employee.phone,
        });
        
        console.log(`✅ ${employee.first_name} ${employee.last_name} - ${email} oluşturuldu`);
        successCount++;
      } catch (err: any) {
        errors.push(`${employee.first_name} ${employee.last_name}: ${err.message}`);
        errorCount++;
      }
    }
    
    // Not defteri dosyası oluştur
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const filename = `personel-kullanicilar-${timestamp}.txt`;
    
    let content = "=".repeat(80) + "\n";
    content += "PERSONEL KULLANICI HESAPLARI\n";
    content += "=".repeat(80) + "\n\n";
    content += `Oluşturma Tarihi: ${new Date().toLocaleString("tr-TR")}\n`;
    content += `Toplam Kullanıcı: ${successCount}\n\n`;
    content += "=".repeat(80) + "\n\n";
    
    userCredentials.forEach((cred, index) => {
      content += `${index + 1}. ${cred.name}\n`;
      content += `   Personel No: ${cred.employeeNumber || "Yok"}\n`;
      content += `   E-posta: ${cred.email}\n`;
      content += `   Şifre: ${cred.password}\n`;
      if (cred.phone) {
        content += `   Telefon: ${cred.phone}\n`;
      }
      content += "\n" + "-".repeat(80) + "\n\n";
    });
    
    content += "\n" + "=".repeat(80) + "\n";
    content += "ÖNEMLİ NOTLAR:\n";
    content += "=".repeat(80) + "\n";
    content += "1. Bu dosyayı güvenli bir yerde saklayın.\n";
    content += "2. İlk girişte kullanıcıların şifrelerini değiştirmeleri önerilir.\n";
    content += "3. Şifre formatı: İlkAdİlkSoyad4Rakam! (örn: AA1234!)\n";
    content += "4. Tüm kullanıcılar 'user' rolü ile oluşturulmuştur.\n";
    content += "=".repeat(80) + "\n";
    
    fs.writeFileSync(filename, content, "utf-8");
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 İşlem Sonucu:");
    console.log("=".repeat(80));
    console.log(`   ✅ Başarılı: ${successCount}`);
    console.log(`   ⏭️  Atlandı: ${skippedCount}`);
    console.log(`   ❌ Hatalı: ${errorCount}`);
    console.log(`\n📝 Kullanıcı bilgileri '${filename}' dosyasına kaydedildi.\n`);
    
    if (errors.length > 0) {
      console.log("❌ Hatalar:");
      errors.forEach(err => console.log(`   - ${err}`));
      console.log();
    }
    
  } catch (err: any) {
    console.error("❌ Genel hata:", err.message);
  }
}

// Email temizleme fonksiyonunu dışarıda tanımla
function cleanFirstName(firstName: string): string {
  return firstName
    .toLowerCase()
    .replace(/[^a-zçğıöşü]/g, '')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

function cleanLastName(lastName: string): string {
  return lastName
    .toLowerCase()
    .replace(/[^a-zçğıöşü]/g, '')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

createUsersForEmployees().catch(console.error);

