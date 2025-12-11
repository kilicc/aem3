# 🏢 AEM3 - İş Emri ve Depo Yönetim Sistemi

Modern, kapsamlı bir iş emri ve depo yönetim sistemi. Next.js 16, TypeScript, Supabase ve TailwindCSS ile geliştirilmiştir.

## ✨ Özellikler

- 📋 **İş Emri Yönetimi** - İş emirleri oluşturma, takip ve yönetim
- 📦 **Depo Yönetimi** - Stok takibi, ürün yönetimi, araç-gereç zimmetleme
- 👥 **Personel Yönetimi** - Çalışan kayıtları ve özlük dosyaları
- 🚗 **Araç Takibi** - Araç bakım takibi ve kullanım raporları
- 👤 **Müşteri Yönetimi** - Müşteri ve cihaz kayıtları
- 💰 **Fatura Yönetimi** - Fatura oluşturma ve takibi
- 🔔 **Bildirim Sistemi** - Rol bazlı bildirimler
- 📊 **Dashboard** - Kapsamlı istatistikler ve raporlar

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Git

### Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/kilicc/aem3.git
cd aem3

# Bağımlılıkları yükleyin
npm install

# Environment variables oluşturun
cp .env.example .env.local

# Development server'ı başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

**📖 Detaylı kurulum için:** [QUICK_START.md](./QUICK_START.md) veya [SETUP.md](./SETUP.md)

## 🛠️ Teknolojiler

- **Framework:** Next.js 16 (App Router)
- **Dil:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma (sadece type generation)
- **Authentication:** Supabase Auth

## 📁 Proje Yapısı

```
aem3/
├── app/              # Next.js 16 App Router
├── components/        # React bileşenleri
├── modules/          # Modül bazlı kodlar
│   ├── admin/        # Admin modülü
│   ├── auth/         # Authentication
│   ├── calisanlar/   # Çalışanlar
│   ├── depo/         # Depo yönetimi
│   ├── is-emri/      # İş emirleri
│   └── musteri/      # Müşteriler
├── lib/              # Yardımcı fonksiyonlar
└── scripts/          # Utility script'leri
```

## 📜 Kullanılabilir Komutlar

```bash
# Development
npm run dev          # Development server başlat

# Production
npm run build        # Production build
npm run start        # Production server

# Database
npm run db:pull      # Prisma schema çek
npm run db:generate  # TypeScript tipleri oluştur

# Utilities
npm run import:excel              # Excel'den veri içe aktar
npm run create:employee-users      # Personel için kullanıcı oluştur
npm run demo:notifications        # Demo bildirimler ekle
```

## 🔐 Environment Variables

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Örnek dosya için: [.env.example](./.env.example)

## 👥 Roller

Sistemde şu roller bulunur:
- **admin** - Tam yetki
- **yonetici** - Yönetim yetkileri
- **user** - Standart kullanıcı

## 📚 Dokümantasyon

- [Hızlı Başlangıç](./QUICK_START.md) - 5 dakikada kurulum
- [Detaylı Kurulum](./SETUP.md) - Kapsamlı kurulum rehberi
- [Deployment](./DEPLOYMENT_GUIDE.md) - Production deployment

## 🐛 Sorun Giderme

Yaygın sorunlar ve çözümleri için [SETUP.md](./SETUP.md) dosyasındaki "Sorun Giderme" bölümüne bakın.

## 📝 Lisans

Bu proje özel bir projedir.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Sorularınız için GitHub Issues kullanın.

---

**⭐ Beğendiyseniz yıldız vermeyi unutmayın!**
