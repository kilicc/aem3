import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdmin() {
  const email = "admin@aem3.com";
  const password = "Admin123!@#";
  const fullName = "Admin Kullanıcı";

  console.log("Admin kullanıcısı oluşturuluyor...");

  // Auth kullanıcısı oluştur
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    console.error("Auth kullanıcısı oluşturulurken hata:", authError?.message);
    return;
  }

  console.log("Auth kullanıcısı oluşturuldu:", authData.user.id);

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
    console.error("Profile oluşturulurken hata:", profileError.message);
    
    // Auth kullanıcısını sil
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return;
  }

  console.log("\n✅ Admin kullanıcısı başarıyla oluşturuldu!");
  console.log("Email:", email);
  console.log("Şifre:", password);
  console.log("\n⚠️  GÜVENLİK: İlk girişten sonra şifreyi değiştirmeyi unutmayın!");
}

createAdmin().catch(console.error);
