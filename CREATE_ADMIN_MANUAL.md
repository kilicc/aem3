# Admin Kullanıcı Oluşturma - Manuel Yöntem

## Supabase Dashboard Üzerinden

1. **Supabase Dashboard'a giriş yapın:**
   - https://supabase.com/dashboard
   - Projenize giriş yapın

2. **Authentication → Users bölümüne gidin**

3. **"Add User" butonuna tıklayın**

4. **Kullanıcı bilgilerini girin:**
   - **Email:** `admin@aem.com.tr`
   - **Password:** `123`
   - **Auto Confirm User:** ✅ (İşaretleyin)

5. **"Create User" butonuna tıklayın**

6. **SQL Editor'ü açın ve şu komutu çalıştırın:**

```sql
-- Admin rolünü atayın
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@aem.com.tr';

-- Eğer profile yoksa oluşturun
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  'Admin Kullanıcı',
  'admin'
FROM auth.users
WHERE email = 'admin@aem.com.tr'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

## Alternatif: Script ile (İnternet Bağlantısı Gerektirir)

Eğer Supabase bağlantısı çalışıyorsa:

```bash
node scripts/create-admin.js
```

**Not:** Script şu bilgileri kullanır:
- Email: `admin@aem.com.tr`
- Password: `123`

