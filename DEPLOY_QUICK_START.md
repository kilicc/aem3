# 🚀 Hızlı Deployment Rehberi

## ⚡ En Hızlı Yöntem: Vercel (5 Dakika)

### 1. GitHub'a Push
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Vercel'e Deploy
1. https://vercel.com → Sign in with GitHub
2. **Add New Project** → `aem2` repository seç
3. **Environment Variables** ekle:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tcxzejixpbswryublptx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHplaml4cGJzd3J5dWJscHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTMzMzUsImV4cCI6MjA3OTE2OTMzNX0.vlQsWmcmJXD9ggiOyekZxIs29o0lPyvMkEKTHL1bUL0
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHplaml4cGJzd3J5dWJscHR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU5MzMzNSwiZXhwIjoyMDc5MTY5MzM1fQ.-23n0Ieu8uIk0i9heft9bjQMRXaStPfWJLkeNRPZBiU
   ```
4. **Deploy** → 2-3 dakika içinde hazır!

### 3. Custom Domain (Opsiyonel)
- Vercel Dashboard → Project → Settings → Domains
- `planlama.aemakgun.com.tr` ekle
- cPanel'de DNS ayarlarını yap:
  - A Record: `planlama` → Vercel IP (Vercel size söyleyecek)
  - veya CNAME: `planlama` → `cname.vercel-dns.com`

---

## 🖥️ cPanel'e Deploy (Node.js Selector Varsa)

### 1. Dosyaları Hazırla
```bash
npm run build
```

### 2. cPanel'e Yükle
- File Manager veya FTP ile `public_html` klasörüne yükle
- `server.js` dosyasının olduğundan emin ol

### 3. Node.js Selector
1. cPanel → Node.js Selector
2. Create Application:
   - Node Version: 20.x
   - Application Root: `/home/planlamaaemakgun/public_html`
   - Application URL: `/`
   - Startup File: `server.js`
3. Environment Variables ekle (yukarıdaki 3 değişken)
4. Restart

### 4. Domain Ayarları
- cPanel → Domains → Addon Domain veya Subdomain
- `planlama.aemakgun.com.tr` ekle

---

## ⚠️ ÖNEMLİ NOTLAR

1. **cPanel'de Node.js yoksa** → Vercel kullan (ücretsiz ve kolay)
2. **Environment Variables** mutlaka ayarlanmalı
3. **Build** işlemi başarılı olmalı
4. **SSL sertifikası** aktif olmalı (Let's Encrypt ücretsiz)

---

## 🔍 Kontrol Listesi

- [ ] `npm run build` başarılı mı?
- [ ] Environment variables ayarlandı mı?
- [ ] `server.js` dosyası var mı?
- [ ] Node.js versiyonu 18+ mı?
- [ ] Domain ayarları yapıldı mı?
- [ ] SSL aktif mi?

---

**Sorun mu var?** `DEPLOYMENT_GUIDE.md` dosyasına bakın.

