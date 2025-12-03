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

async function createAdmin() {
  const email = "admin@aem.com.tr";
  const password = "123";
  const fullName = "Admin Kullanıcı";

  console.log("\n🔧 Admin kullanıcısı oluşturuluyor...\n");

  try {
    // Mevcut kullanıcıyı kontrol et
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers.users.find((u) => u.email === email);

    if (existingUser) {
      console.log("⚠️  Bu email ile bir kullanıcı zaten mevcut.");
      
      // Profile kontrolü
      const { data: profile } = await adminClient
        .from("profiles")
        .select("*")
        .eq("id", existingUser.id)
        .single();

      if (profile) {
        // Role'ü admin yap
        const { error: updateError } = await adminClient
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", existingUser.id);

        if (updateError) {
          console.error("❌ Profile güncellenirken hata:", updateError.message);
          return;
        }

        console.log("✅ Mevcut kullanıcı admin rolüne güncellendi!");
        console.log("Email:", email);
        console.log("Şifre: (Mevcut şifrenizi kullanın veya Supabase Dashboard'dan sıfırlayın)");
        return;
      } else {
        // Profile oluştur
        const { error: profileError } = await adminClient
          .from("profiles")
          .insert({
            id: existingUser.id,
            email,
            full_name: fullName,
            role: "admin",
          });

        if (profileError) {
          console.error("❌ Profile oluşturulurken hata:", profileError.message);
          return;
        }

        console.log("✅ Mevcut kullanıcı için profile oluşturuldu ve admin rolü verildi!");
        console.log("Email:", email);
        console.log("Şifre: (Mevcut şifrenizi kullanın veya Supabase Dashboard'dan sıfırlayın)");
        return;
      }
    }

    // Yeni kullanıcı oluştur
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error("❌ Auth kullanıcısı oluşturulurken hata:", authError?.message);
      return;
    }

    console.log("✅ Auth kullanıcısı oluşturuldu:", authData.user.id);

    // Profile oluştur
    const { data: profileData, error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: "admin",
      })
      .select()
      .single();

    if (profileError) {
      console.error("❌ Profile oluşturulurken hata:", profileError.message);
      
      // Auth kullanıcısını sil
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log("\n✅ Admin kullanıcısı başarıyla oluşturuldu!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", email);
    console.log("🔑 Şifre:", password);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  GÜVENLİK: İlk girişten sonra şifreyi değiştirmeyi unutmayın!\n");
  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error("Detay:", error);
    if (error.cause) {
      console.error("Neden:", error.cause.message);
    }
  }
}

createAdmin();
