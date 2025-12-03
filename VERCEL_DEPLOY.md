# 🚀 Vercel Deployment Rehberi

Bu proje Vercel'e deploy edilmek için hazırlanmıştır.

## ⚡ Hızlı Başlangıç (5 Dakika)

### 1. Vercel'e Giriş
1. https://vercel.com adresine gidin
2. **Sign Up** veya **Log In** yapın (GitHub hesabınızla giriş yapmanız önerilir)

### 2. Projeyi İçe Aktar
1. Vercel Dashboard'da **Add New Project** butonuna tıklayın
2. **Import Git Repository** seçeneğini seçin
3. GitHub hesabınızı bağlayın (eğer bağlı değilse)
4. `kilicc/aem3` repository'sini seçin
5. **Import** butonuna tıklayın

### 3. Proje Ayarları
Vercel otomatik olarak Next.js projesini algılayacaktır. Ayarlar şu şekilde olmalı:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (boş bırakın)
- **Build Command**: `npm run build` (otomatik)
- **Output Directory**: `.next` (otomatik)
- **Install Command**: `npm install` (otomatik)

### 4. Environment Variables
Vercel, `vercel.json` dosyasındaki environment variables'ları otomatik olarak algılayacaktır. Ancak manuel olarak da ekleyebilirsiniz:

**Settings → Environment Variables** bölümüne gidin ve şunları ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=https://tcxzejixpbswryublptx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHplaml4cGJzd3J5dWJscHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTMzMzUsImV4cCI6MjA3OTE2OTMzNX0.vlQsWmcmJXD9ggiOyekZxIs29o0lPyvMkEKTHL1bUL0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHplaml4cGJzd3J5dWJscHR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU5MzMzNSwiZXhwIjoyMDc5MTY5MzM1fQ.-23n0Ieu8uIk0i9heft9bjQMRXaStPfWJLkeNRPZBiU
```

**Önemli**: Her environment variable için **Production**, **Preview**, ve **Development** ortamlarını seçin.

### 5. Deploy
1. **Deploy** butonuna tıklayın
2. 2-3 dakika içinde build tamamlanacak
3. Projeniz canlıya alınacak!

### 6. Custom Domain (Opsiyonel)
1. Vercel Dashboard → Projenizi seçin
2. **Settings** → **Domains** sekmesine gidin
3. **Add Domain** butonuna tıklayın
4. `planlama.aemakgun.com.tr` yazın
5. Vercel size DNS ayarlarını gösterecek

#### DNS Ayarları (cPanel'de)
cPanel → **Zone Editor** veya **DNS Zone Editor**:
- **Type**: A Record veya CNAME
- **Name**: `planlama`
- **Value**: Vercel'in verdiği IP adresi veya CNAME (örn: `cname.vercel-dns.com`)
- **TTL**: 3600

---

## 🔧 Build Ayarları

Vercel otomatik olarak şu ayarları algılar:
- **Framework**: Next.js 16
- **Node Version**: 20.x (otomatik)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

---

## 📋 Deployment Checklist

- [x] Repository GitHub'da
- [x] `vercel.json` dosyası hazır
- [x] `.env.production` dosyası hazır
- [x] Environment variables tanımlı
- [ ] Vercel'de proje oluşturuldu
- [ ] Environment variables eklendi
- [ ] Build başarılı
- [ ] Domain ayarlandı (opsiyonel)
- [ ] SSL aktif (otomatik)

---

## 🐛 Troubleshooting

### Build Hatası
- Node.js versiyonunu kontrol edin (20.x olmalı)
- `npm install` komutunu çalıştırın
- Vercel loglarını kontrol edin

### Environment Variables Çalışmıyor
- Environment variables'ların tüm ortamlar için eklendiğinden emin olun
- Variable isimlerinin doğru olduğundan emin olun
- Projeyi yeniden deploy edin

### Supabase Bağlantı Hatası
- API keys'lerin doğru olduğundan emin olun
- Supabase dashboard'da CORS ayarlarını kontrol edin
- Vercel domain'ini Supabase'de allowed origins'a ekleyin

---

## 🔄 Otomatik Deploy

Vercel, GitHub repository'nize her push'ta otomatik olarak deploy yapar:
- `main` branch → Production
- Diğer branch'ler → Preview

---

## 📞 Destek

Sorun yaşarsanız:
1. Vercel Dashboard → Deployments → Logs'u kontrol edin
2. GitHub Actions'ı kontrol edin
3. Vercel Support'a başvurun

---

**Başarılar! 🎉**

