# 🚀 cPanel Deployment Rehberi

Bu proje Next.js 16 ve Server Actions kullanıyor. cPanel'e deploy etmek için aşağıdaki adımları izleyin.

## ⚠️ ÖNEMLİ NOTLAR

1. **cPanel'de Node.js desteği olmalı** - Eğer yoksa, alternatif yöntemler kullanmanız gerekir
2. **Supabase bağlantısı** - Environment değişkenlerini doğru ayarlamanız gerekir
3. **Port yönetimi** - cPanel genellikle belirli portlar kullanır

---

## 📋 YÖNTEM 1: cPanel Node.js Selector (Önerilen)

### Adım 1: cPanel'e Giriş
1. `https://planlama.aemakgun.com.tr:2083` adresine gidin
2. Kullanıcı adı: `planlamaaemakgun`
3. Şifre: `1fM2PX+Ltfo@l6Tv?i`

### Adım 2: Node.js Selector Kontrolü
1. cPanel ana sayfasında **"Node.js Selector"** veya **"Node.js Selector (Select Node.js Version)"** arayın
2. Eğer yoksa → **YÖNTEM 2** veya **YÖNTEM 3**'e geçin

### Adım 3: Projeyi Hazırlama (Yerel Bilgisayarınızda)

```bash
# 1. Projeyi build edin
npm run build

# 2. .env.production dosyası oluşturun
cat > .env.production << EOF
NEXT_PUBLIC_SUPABASE_URL=https://tcxzejixpbswryublptx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHplaml4cGJzd3J5dWJscHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTMzMzUsImV4cCI6MjA3OTE2OTMzNX0.vlQsWmcmJXD9ggiOyekZxIs29o0lPyvMkEKTHL1bUL0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHplaml4cGJzd3J5dWJscHR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU5MzMzNSwiZXhwIjoyMDc5MTY5MzM1fQ.-23n0Ieu8uIk0i9heft9bjQMRXaStPfWJLkeNRPZBiU
NODE_ENV=production
EOF

# 3. .gitignore'u kontrol edin (node_modules ve .next klasörleri ignore edilmeli)
```

### Adım 4: Dosyaları cPanel'e Yükleme

#### Seçenek A: File Manager ile
1. cPanel → **File Manager**
2. `public_html` klasörüne gidin (veya alt domain kullanıyorsanız ilgili klasöre)
3. Tüm proje dosyalarını ZIP olarak sıkıştırın
4. File Manager'da **Upload** butonuna tıklayın
5. ZIP dosyasını yükleyin
6. ZIP dosyasına sağ tıklayın → **Extract**

#### Seçenek B: FTP ile (FileZilla, WinSCP vb.)
1. FTP bilgilerinizi cPanel'den alın (cPanel → FTP Accounts)
2. FTP client ile bağlanın
3. `public_html` klasörüne tüm dosyaları yükleyin

### Adım 5: Node.js Selector'da Uygulama Oluşturma

1. cPanel → **Node.js Selector**
2. **Create Application** butonuna tıklayın
3. Ayarlar:
   - **Node.js Version**: `18.x` veya `20.x` (mümkünse en yeni)
   - **Application Mode**: `Production`
   - **Application Root**: `/home/planlamaaemakgun/public_html` (veya projenizin olduğu klasör)
   - **Application URL**: `/` (veya alt domain kullanıyorsanız `/subdomain`)
   - **Application Startup File**: `server.js` (oluşturacağız)
   - **Passenger Base URI**: `/` (veya alt domain için `/subdomain`)

### Adım 6: server.js Dosyası Oluşturma

cPanel'de proje klasörünüzde `server.js` dosyası oluşturun:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

### Adım 7: package.json Script Güncelleme

`package.json` dosyasına ekleyin:

```json
{
  "scripts": {
    "start": "node server.js",
    "postinstall": "npm run build"
  }
}
```

### Adım 8: Dependencies Yükleme

cPanel Terminal'den veya SSH ile:

```bash
cd ~/public_html  # veya projenizin olduğu klasör
npm install --production
npm run build
```

### Adım 9: Environment Variables Ayarlama

Node.js Selector'da uygulamanızı seçin ve **Environment Variables** bölümüne gidin:

```
NEXT_PUBLIC_SUPABASE_URL=https://tcxzejixpbswryublptx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHplaml4cGJzd3J5dWJscHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTMzMzUsImV4cCI6MjA3OTE2OTMzNX0.vlQsWmcmJXD9ggiOyekZxIs29o0lPyvMkEKTHL1bUL0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHplaml4cGJzd3J5dWJscHR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU5MzMzNSwiZXhwIjoyMDc5MTY5MzM1fQ.-23n0Ieu8uIk0i9heft9bjQMRXaStPfWJLkeNRPZBiU
NODE_ENV=production
```

### Adım 10: Uygulamayı Başlatma

Node.js Selector'da **Restart** butonuna tıklayın.

---

## 📋 YÖNTEM 2: Vercel (Önerilen - En Kolay)

cPanel'de Node.js desteği yoksa, Vercel kullanın (ücretsiz):

### Adım 1: GitHub'a Push
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/kilicc/aem2.git
git push -u origin main
```

### Adım 2: Vercel'e Deploy
1. https://vercel.com adresine gidin
2. GitHub hesabınızla giriş yapın
3. **New Project** → Repository seçin
4. Environment Variables ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. **Deploy** butonuna tıklayın

### Adım 3: Custom Domain (Opsiyonel)
Vercel'de projenizi seçin → Settings → Domains → `planlama.aemakgun.com.tr` ekleyin
DNS ayarlarını cPanel'den yapın.

---

## 📋 YÖNTEM 3: VPS + PM2 (Gelişmiş)

Eğer VPS erişiminiz varsa:

### Adım 1: VPS'e Bağlanma
```bash
ssh root@your-vps-ip
```

### Adım 2: Node.js ve PM2 Kurulumu
```bash
# Node.js kurulumu (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kurulumu
sudo npm install -g pm2
```

### Adım 3: Projeyi Yükleme
```bash
cd /var/www
git clone https://github.com/kilicc/aem2.git aem3
cd aem3
npm install
npm run build
```

### Adım 4: Environment Variables
```bash
nano .env.production
# Yukarıdaki environment variables'ları ekleyin
```

### Adım 5: PM2 ile Başlatma
```bash
pm2 start npm --name "aem3" -- start
pm2 save
pm2 startup
```

### Adım 6: Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/aem3
```

```nginx
server {
    listen 80;
    server_name planlama.aemakgun.com.tr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/aem3 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📋 YÖNTEM 4: cPanel + Static Export (Server Actions ÇALIŞMAZ)

⚠️ **UYARI**: Bu yöntem Server Actions'ı desteklemez, sadece statik sayfalar çalışır.

### Adım 1: next.config.js Oluşturma
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

### Adım 2: Build ve Deploy
```bash
npm run build
# out/ klasöründeki dosyaları public_html'e yükleyin
```

---

## 🔧 TROUBLESHOOTING

### Port Hatası
cPanel genellikle port 3000'i kullanmaz. Node.js Selector'da port ayarını kontrol edin.

### Environment Variables Çalışmıyor
- `.env.production` dosyasını kontrol edin
- Node.js Selector'da Environment Variables'ları tekrar ekleyin
- Uygulamayı restart edin

### Build Hatası
```bash
# Node.js versiyonunu kontrol edin
node --version  # 18.x veya 20.x olmalı

# Dependencies'i temizleyin
rm -rf node_modules package-lock.json
npm install
```

### Supabase Bağlantı Hatası
- Environment variables'ların doğru olduğundan emin olun
- Supabase dashboard'da API keys'i kontrol edin
- CORS ayarlarını kontrol edin

---

## 📞 DESTEK

Sorun yaşarsanız:
1. cPanel error loglarını kontrol edin
2. Node.js Selector'da application loglarını inceleyin
3. Browser console'da hataları kontrol edin

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Node.js Selector mevcut mu? (Yoksa Vercel kullanın)
- [ ] Environment variables ayarlandı mı?
- [ ] `npm run build` başarılı mı?
- [ ] `server.js` dosyası oluşturuldu mu?
- [ ] Uygulama başlatıldı mı?
- [ ] Domain ayarları yapıldı mı?
- [ ] SSL sertifikası aktif mi?

---

**ÖNERİ**: Eğer cPanel'de Node.js desteği yoksa, **Vercel** kullanmanızı şiddetle tavsiye ederim. Ücretsiz, kolay ve Next.js için optimize edilmiş.

