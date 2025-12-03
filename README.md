# AEM3 - Saha İş Takip Sistemi

Depo, Envanter ve İş Emri Yönetim Sistemi

## Teknolojiler

- **Framework**: Next.js 16 (App Router)
- **Dil**: TypeScript
- **Stil**: TailwindCSS
- **Veritabanı**: Supabase (PostgreSQL)
- **ORM**: Prisma (Sadece tip üretimi için)

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Ortam değişkenlerini ayarlayın:
`.env.local` dosyası zaten oluşturulmuş durumda.

3. Supabase veritabanı şemasını oluşturun:
- Supabase Dashboard → SQL Editor
- `supabase-schema.sql` dosyasının içeriğini çalıştırın

4. Prisma ile tip üretimi:
```bash
npm run db:pull
npm run db:generate
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Proje Yapısı

```
/app                    # Next.js App Router
  /auth                # Auth sayfaları
  /admin               # Admin sayfaları
  /dashboard           # Kullanıcı dashboard
/modules               # Modüller
  /auth                # Auth modülü
  /admin               # Admin modülü
  /depo                # Depo modülü
  /is-emri             # İş Emri modülü
  /musteri             # Müşteri modülü
  /fatura              # Fatura modülü
/lib                   # Yardımcı fonksiyonlar
  /supabase            # Supabase client'ları
/components            # Paylaşılan bileşenler
  /ui                  # UI bileşenleri
/prisma                # Prisma şema (tip üretimi için)
```

## Özellikler

- ✅ Kimlik Doğrulama ve Yetkilendirme
- ✅ Depo/Envanter Yönetimi
- ✅ Müşteri Yönetimi
- ✅ İş Emri Yönetimi
- ✅ Fatura Yönetimi
- ✅ Bildirim Sistemi (WhatsApp + Email)
- ✅ Raporlama ve Analitik

## Geliştirme

### Veritabanı Değişiklikleri

1. Supabase Dashboard'da şema değişikliği yapın
2. Prisma ile şemayı çekin:
```bash
npm run db:pull
npm run db:generate
```

### Build

```bash
npm run build
```

## Lisans

Özel
