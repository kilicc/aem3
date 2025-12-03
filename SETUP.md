# AEM3 Kurulum Rehberi

## 1. Supabase Veritabanı Kurulumu

1. Supabase Dashboard'a giriş yapın: https://tcxzejixpbswryublptx.supabase.co
2. SQL Editor'ü açın
3. `supabase-schema.sql` dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın
4. Execute (Çalıştır) butonuna tıklayın
5. Tüm tablolar, RLS politikaları ve trigger'lar oluşturulacak

## 2. Supabase Storage Bucket'ları Oluşturma

Supabase Dashboard → Storage → Create Bucket:

1. **work-order-photos** bucket'ını oluşturun
   - Public: ✅ (Evet)
   - File size limit: 5MB
   - Allowed MIME types: image/*

2. Storage Policies:
   - Authenticated users can upload files
   - Authenticated users can read files

## 3. Prisma Tip Üretimi

```bash
# DATABASE_URL'i .env.local dosyasına ekleyin
# Supabase Dashboard → Settings → Database → Connection String (URI)
# Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

npm run db:pull
npm run db:generate
```

## 4. Ortam Değişkenleri

`.env.local` dosyası zaten oluşturulmuş durumda. Kontrol edin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tcxzejixpbswryublptx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. İlk Admin Kullanıcısı Oluşturma

Supabase Dashboard → Authentication → Users → Add User

- Email: admin@example.com
- Password: (güçlü bir şifre)
- Email Confirm: ✅

Ardından SQL Editor'de:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

## 6. WhatsApp ve Email API Entegrasyonu

`modules/bildirim/actions/messaging.ts` dosyasındaki TODO'ları tamamlayın:

- WhatsApp Business API entegrasyonu
- Email servisi entegrasyonu (Resend, SendGrid, vb.)

## 7. Geliştirme Sunucusunu Başlatma

```bash
npm run dev
```

http://localhost:3000 adresinden erişebilirsiniz.

## 8. Production Build

```bash
npm run build
npm start
```

## Önemli Notlar

- Service role key ASLA client-side kodda kullanılmamalı
- Tüm veritabanı işlemleri Supabase JS client üzerinden yapılmalı
- Prisma SADECE tip üretimi için kullanılmalı (runtime ORM değil)
- RLS (Row Level Security) politikaları aktif - güvenliği koruyun
