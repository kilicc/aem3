# 🚀 AEM3 - Saha İş Takip Sistemi

Depo, Envanter ve İş Emri Yönetim Sistemi

## ✨ Özellikler

- 📦 **Depo Yönetimi**: Ürün, malzeme ve araç-gereç takibi
- 📋 **İş Emri Yönetimi**: Tam kapsamlı iş emri oluşturma ve takibi
- 👥 **Müşteri Yönetimi**: Müşteri ve cihaz bilgileri
- 🚗 **Araç Takibi**: Araç kullanım ve kilometre takibi
- 🔔 **Bildirim Sistemi**: Rol bazlı bildirimler
- 👤 **Rol Bazlı Erişim**: 8 farklı rol (Admin, Yönetici, Saha Personeli, vb.)
- 📱 **Responsive Tasarım**: Mobil uyumlu arayüz

## 🛠️ Teknolojiler

- **Framework**: Next.js 16 (App Router)
- **Dil**: TypeScript
- **Stil**: TailwindCSS + shadcn/ui
- **Veritabanı**: Supabase (PostgreSQL)
- **ORM**: Prisma (Sadece tip üretimi için)

## 🚀 Hızlı Başlangıç

### Yerel Geliştirme

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Ortam değişkenlerini ayarlayın:**
`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tcxzejixpbswryublptx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. **Supabase veritabanı şemasını oluşturun:**
- Supabase Dashboard → SQL Editor
- `supabase-schema.sql` dosyasının içeriğini çalıştırın
- `migrations/` klasöründeki migration dosyalarını çalıştırın

4. **Prisma ile tip üretimi:**
```bash
npm run db:pull
npm run db:generate
```

5. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

### Vercel Deployment

Proje Vercel'e deploy edilmek için hazırdır! Detaylı rehber için:

📖 **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** dosyasına bakın.

**Hızlı Adımlar:**
1. https://vercel.com → GitHub ile giriş yapın
2. **Add New Project** → `kilicc/aem3` repository'sini seçin
3. Environment Variables otomatik algılanacak (veya manuel ekleyin)
4. **Deploy** → 2-3 dakika içinde hazır!

### cPanel Deployment

cPanel'e deploy için detaylı rehber:

📖 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** dosyasına bakın.

## 📁 Proje Yapısı

```
/app                    # Next.js App Router
  /auth                # Auth sayfaları
  /admin               # Admin sayfaları
  /dashboard           # Kullanıcı dashboard
  /is-emri             # İş Emri sayfaları
  /depo                # Depo sayfaları
  /musteri             # Müşteri sayfaları
  /arac-bakim          # Araç bakım sayfaları
  /notifications       # Bildirim sayfaları
/modules               # Modüller
  /auth                # Auth modülü
  /admin               # Admin modülü
  /depo                # Depo modülü
  /is-emri             # İş Emri modülü
  /musteri             # Müşteri modülü
  /arac-bakim          # Araç bakım modülü
  /bildirim            # Bildirim modülü
/components            # Paylaşılan bileşenler
/lib                   # Yardımcı fonksiyonlar
/migrations            # Veritabanı migration'ları
/prisma                # Prisma şema dosyaları
```

## 🔐 Roller

Sistem 8 farklı rolü destekler:

- **admin**: Tam yetki
- **yonetici**: Yönetim yetkileri
- **depo_sorunlusu**: Depo yönetimi
- **saha_personeli**: Saha işlemleri
- **saha_sefi**: Saha yönetimi
- **ofis_personeli**: Ofis işlemleri
- **ofis_sefi**: Ofis yönetimi
- **muhasebe_personeli**: Muhasebe işlemleri

## 📝 Önemli Dosyalar

- `DEPLOYMENT_GUIDE.md` - Detaylı deployment rehberi
- `VERCEL_DEPLOY.md` - Vercel deployment rehberi
- `DEPLOY_QUICK_START.md` - Hızlı başlangıç rehberi
- `supabase-schema.sql` - Veritabanı şeması
- `migrations/` - Veritabanı migration dosyaları
- `server.js` - cPanel için Node.js server dosyası

## 🔧 Scripts

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run start        # Production sunucu (server.js)
npm run lint         # ESLint kontrolü
npm run db:pull      # Prisma db pull
npm run db:generate  # Prisma tip üretimi
```

## 📦 Bağımlılıklar

Ana bağımlılıklar:
- `next@^16.0.0`
- `react@^18.3.1`
- `@supabase/supabase-js@^2.39.3`
- `@supabase/ssr@^0.5.1`
- `tailwindcss@^3.4.1`
- `typescript@^5.3.3`

## 🐛 Sorun Giderme

### Build Hatası
```bash
rm -rf node_modules .next
npm install
npm run build
```

### Supabase Bağlantı Hatası
- Environment variables'ların doğru olduğundan emin olun
- Supabase dashboard'da API keys'i kontrol edin

### Prisma Hataları
```bash
npm run db:pull
npm run db:generate
```

## 📄 Lisans

Bu proje özel bir projedir.

## 👥 Katkıda Bulunanlar

- Geliştirme: AEM3 Ekibi

---

**Not**: Production ortamında environment variables'ları mutlaka ayarlayın!
