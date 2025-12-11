# 🚀 AEM3 Proje Kurulum Rehberi

Bu rehber, projeyi macOS ve Windows üzerinde kurmak için gerekli tüm adımları içerir.

## 📋 Gereksinimler

### Her İki Platform İçin:
- **Node.js** (v18.17.0 veya üzeri) - [İndir](https://nodejs.org/)
- **npm** (Node.js ile birlikte gelir)
- **Git** - [İndir](https://git-scm.com/)
- **Supabase Hesabı** ve proje bilgileri

### macOS İçin Ek:
- Terminal (varsayılan olarak yüklü)
- Homebrew (önerilir) - [Kurulum](https://brew.sh/)

### Windows İçin Ek:
- PowerShell veya Git Bash
- Visual Studio Code (önerilir) - [İndir](https://code.visualstudio.com/)

---

## 🔧 Adım 1: Node.js Kurulumu

### macOS:
```bash
# Homebrew ile (önerilen)
brew install node

# Veya resmi installer ile
# https://nodejs.org/ adresinden indirin
```

### Windows:
1. https://nodejs.org/ adresinden LTS sürümünü indirin
2. Installer'ı çalıştırın ve "Add to PATH" seçeneğini işaretleyin
3. Kurulumu tamamlayın

**Kontrol:**
```bash
node --version
npm --version
```

---

## 📥 Adım 2: Projeyi İndirin

### GitHub'dan Clone:
```bash
git clone https://github.com/kilicc/aem3.git
cd aem3
```

### Veya ZIP Olarak İndirin:
1. https://github.com/kilicc/aem3 adresine gidin
2. "Code" → "Download ZIP" tıklayın
3. ZIP'i açın ve klasöre gidin

---

## 📦 Adım 3: Bağımlılıkları Yükleyin

### macOS / Windows (Aynı):
```bash
npm install
```

**Not:** İlk kurulum 2-5 dakika sürebilir.

---

## 🔐 Adım 4: Environment Variables (Ortam Değişkenleri)

### 4.1 `.env.local` Dosyası Oluşturun

Proje kök dizininde `.env.local` adında bir dosya oluşturun:

**macOS:**
```bash
touch .env.local
```

**Windows (PowerShell):**
```powershell
New-Item .env.local -ItemType File
```

**Windows (CMD):**
```cmd
type nul > .env.local
```

### 4.2 Environment Variables'ı Ekleyin

`.env.local` dosyasını bir metin editörü ile açın ve şu içeriği ekleyin:

```env
# Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://tcxzejixpbswryublptx.supabase.co

# Supabase Anon Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHplaml4cGJzd3J5dWJscHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTMzMzUsImV4cCI6MjA3OTE2OTMzNX0.vlQsWmcmJXD9ggiOyekZxIs29o0lPyvMkEKTHL1bUL0

# Supabase Service Role Key (SADECE SERVER-SIDE)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHplaml4cGJzd3J5dWJscHR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU5MzMzNSwiZXhwIjoyMDc5MTY5MzM1fQ.-23n0Ieu8uIk0i9heft9bjQMRXaStPfWJLkeNRPZBiU
```

**⚠️ ÖNEMLİ:** Bu dosya `.gitignore` içinde olduğu için Git'e commit edilmez. Her geliştirici kendi `.env.local` dosyasını oluşturmalıdır.

---

## 🗄️ Adım 5: Veritabanı Şemasını Kontrol Edin

Proje Supabase kullanıyor. Veritabanı şeması Supabase Dashboard'da zaten mevcut olmalıdır.

Eğer şema yoksa, `vehicles-schema.sql` ve `employees-schema.sql` dosyalarını Supabase SQL Editor'de çalıştırın.

---

## 🚀 Adım 6: Development Server'ı Başlatın

### macOS / Windows (Aynı):
```bash
npm run dev
```

Tarayıcınızda şu adrese gidin:
```
http://localhost:3000
```

**✅ Başarılı!** Proje çalışıyor demektir.

---

## 👤 Adım 7: Admin Kullanıcısı Oluşturun

### Yöntem 1: Supabase Dashboard (Önerilen)

1. https://supabase.com/dashboard adresine gidin
2. Projenizi seçin
3. **Authentication** → **Users** → **Add User**
4. Bilgileri girin:
   - **Email:** `admin@aem.com.tr`
   - **Password:** `123` (veya güvenli bir şifre)
   - **Auto Confirm User:** ✅ İşaretleyin
5. **Create User** tıklayın
6. **SQL Editor**'ü açın ve şu komutu çalıştırın:

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

### Yöntem 2: Script ile (Opsiyonel)

```bash
node scripts/create-admin.js
```

---

## 📊 Adım 8: Demo Verileri (Opsiyonel)

### Excel Dosyalarından Veri İçe Aktarma:

1. `ARAÇLAR.xlsx` ve `PERSONEL.xlsx` dosyalarını proje kök dizinine koyun
2. Şu komutu çalıştırın:

```bash
npm run import:excel
```

### Personel İçin Kullanıcı Hesapları Oluşturma:

```bash
npm run create:employee-users
```

Bu komut, her personel için bir kullanıcı hesabı oluşturur ve `personel-kullanicilar-*.txt` dosyasına kaydeder.

---

## 🛠️ Kullanılabilir Komutlar

```bash
# Development server başlat
npm run dev

# Production build
npm run build

# Production server başlat
npm run start

# Linting
npm run lint

# Veritabanı şemasını çek (Prisma)
npm run db:pull

# TypeScript tiplerini oluştur (Prisma)
npm run db:generate

# Excel'den veri içe aktar
npm run import:excel

# Personel için kullanıcı hesapları oluştur
npm run create:employee-users

# Demo bildirimler ekle
npm run demo:notifications
```

---

## 🐛 Sorun Giderme

### Port 3000 Zaten Kullanılıyor

**macOS:**
```bash
# Port'u kullanan process'i bul
lsof -ti:3000

# Process'i sonlandır
kill -9 $(lsof -ti:3000)
```

**Windows:**
```powershell
# Port'u kullanan process'i bul
netstat -ano | findstr :3000

# Process ID'yi not edin ve sonlandırın
taskkill /PID <PID> /F
```

### Node Modules Hataları

```bash
# node_modules ve package-lock.json'ı sil
rm -rf node_modules package-lock.json  # macOS/Linux
rmdir /s node_modules & del package-lock.json  # Windows

# Yeniden yükle
npm install
```

### Environment Variables Çalışmıyor

1. `.env.local` dosyasının proje kök dizininde olduğundan emin olun
2. Dosya adının tam olarak `.env.local` olduğunu kontrol edin (`.env.local.txt` değil)
3. Development server'ı yeniden başlatın

### Supabase Bağlantı Hatası

1. `.env.local` dosyasındaki değerlerin doğru olduğundan emin olun
2. Supabase Dashboard'da projenizin aktif olduğunu kontrol edin
3. API anahtarlarının güncel olduğunu kontrol edin

### TypeScript Hataları

```bash
# Prisma tiplerini yeniden oluştur
npm run db:generate
```

---

## 📁 Proje Yapısı

```
aem3/
├── app/                    # Next.js 16 App Router sayfaları
├── components/             # React bileşenleri
├── modules/                # Modül bazlı kodlar
│   ├── admin/             # Admin modülü
│   ├── auth/              # Authentication
│   ├── calisanlar/        # Çalışanlar modülü
│   ├── depo/              # Depo modülü
│   ├── is-emri/           # İş emri modülü
│   └── musteri/           # Müşteri modülü
├── lib/                    # Yardımcı fonksiyonlar
├── scripts/                # Utility script'leri
├── public/                 # Statik dosyalar
├── .env.local             # Environment variables (oluşturulmalı)
├── package.json           # Proje bağımlılıkları
└── README.md              # Proje dokümantasyonu
```

---

## 🔒 Güvenlik Notları

1. **`.env.local` dosyasını ASLA Git'e commit etmeyin**
2. **Service Role Key'i sadece server-side kodda kullanın**
3. **Production'da güçlü şifreler kullanın**
4. **Supabase RLS (Row Level Security) kurallarını kontrol edin**

---

## 📞 Destek

Sorun yaşarsanız:
1. Bu rehberi tekrar okuyun
2. Sorun Giderme bölümüne bakın
3. GitHub Issues'da arama yapın
4. Yeni bir issue oluşturun

---

## ✅ Kurulum Kontrol Listesi

- [ ] Node.js kurulu (v18+)
- [ ] Git kurulu
- [ ] Proje klonlandı/indirildi
- [ ] `npm install` çalıştırıldı
- [ ] `.env.local` dosyası oluşturuldu
- [ ] Environment variables eklendi
- [ ] `npm run dev` başarıyla çalıştı
- [ ] Admin kullanıcısı oluşturuldu
- [ ] http://localhost:3000 açılıyor

---

**🎉 Kurulum tamamlandı! İyi çalışmalar!**
