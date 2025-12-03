# 🔧 Site Erişim Sorunları - Sorun Giderme Rehberi

## 🚨 Site Görünmüyor - Hızlı Kontrol

### 1. Tarayıcı Kontrolü
- **Farklı tarayıcı deneyin**: Chrome, Firefox, Safari
- **Gizli mod deneyin**: Ctrl+Shift+N (Chrome) veya Ctrl+Shift+P (Firefox)
- **Cache temizleyin**: Ctrl+Shift+Delete → "Cached images and files" seçin

### 2. DNS Kontrolü
```bash
# Terminal'de
nslookup planlama.aemakgun.com.tr

# Veya online
https://dnschecker.org/#A/planlama.aemakgun.com.tr
```

### 3. Vercel Dashboard Kontrolü
1. Vercel Dashboard → Projenizi seçin
2. **Deployments** sekmesine gidin
3. Son deployment'ın durumunu kontrol edin:
   - ✅ **Ready**: Başarılı
   - ⏳ **Building**: Hala build alınıyor
   - ❌ **Error**: Hata var

### 4. Domain Kontrolü
1. Vercel Dashboard → Settings → Domains
2. `planlama.aemakgun.com.tr` durumunu kontrol edin:
   - ✅ **Valid Configuration**: DNS doğru
   - ⚠️ **Invalid Configuration**: DNS hatası var
   - ⏳ **Pending**: DNS propagasyon bekleniyor

---

## 🔍 Olası Sorunlar ve Çözümler

### Sorun 1: "Site can't be reached" veya "ERR_CONNECTION_REFUSED"

**Neden:**
- DNS henüz yayılmamış
- Vercel'de domain eklenmemiş
- Build başarısız olmuş

**Çözüm:**
1. Vercel Dashboard → Deployments kontrol edin
2. Eğer build hatası varsa, logları inceleyin
3. Domain eklenmemişse, Settings → Domains'den ekleyin

---

### Sorun 2: "404 Not Found" veya Boş Sayfa

**Neden:**
- Build başarısız
- Route yapılandırması hatası
- Environment variables eksik

**Çözüm:**
1. Vercel Dashboard → Deployments → Son deployment'ı kontrol edin
2. Build loglarını inceleyin
3. Environment variables'ları kontrol edin

---

### Sorun 3: "Invalid Configuration" (Vercel Dashboard'da)

**Neden:**
- DNS kaydı yanlış
- CNAME değeri hatalı
- DNS propagasyon tamamlanmamış

**Çözüm:**
1. cPanel → Zone Editor kontrol edin
2. CNAME kaydının doğru olduğundan emin olun
3. 1-2 saat bekleyin (DNS propagasyon)

---

### Sorun 4: SSL Sertifika Hatası

**Neden:**
- SSL sertifikası henüz oluşturulmamış
- DNS tam yayılmamış

**Çözüm:**
1. Vercel otomatik SSL sağlar
2. DNS tam yayıldıktan sonra 1-2 saat bekleyin
3. Vercel Dashboard → Settings → Domains → SSL durumunu kontrol edin

---

## 🛠️ Adım Adım Sorun Giderme

### Adım 1: Vercel Kontrolü
```
1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. Deployments → Son deployment'ı kontrol edin
4. Build başarılı mı? (Ready yazıyor mu?)
```

### Adım 2: Domain Kontrolü
```
1. Settings → Domains
2. planlama.aemakgun.com.tr ekli mi?
3. Durum ne? (Valid/Invalid/Pending)
```

### Adım 3: DNS Kontrolü
```
1. cPanel → Zone Editor
2. planlama için CNAME kaydı var mı?
3. CNAME değeri doğru mu? (cname.vercel-dns.com)
```

### Adım 4: Build Logları
```
1. Vercel → Deployments → Son deployment
2. "View Build Logs" butonuna tıklayın
3. Hata var mı kontrol edin
```

---

## 📋 Kontrol Listesi

- [ ] Vercel'de proje var mı?
- [ ] Son deployment başarılı mı? (Ready)
- [ ] Domain Vercel'e eklenmiş mi?
- [ ] Domain durumu "Valid Configuration" mı?
- [ ] cPanel'de CNAME kaydı var mı?
- [ ] CNAME değeri doğru mu?
- [ ] DNS propagasyon tamamlandı mı? (1-2 saat)
- [ ] Tarayıcı cache temizlendi mi?
- [ ] Farklı tarayıcı/cihaz denendi mi?

---

## 🔄 Hızlı Düzeltmeler

### DNS Yeniden Yapılandırma
1. cPanel → Zone Editor
2. Mevcut `planlama` kaydını silin
3. Yeni CNAME ekleyin:
   - Name: `planlama`
   - CNAME: Vercel'in verdiği değer
4. Save All Records

### Vercel'de Yeniden Deploy
1. Vercel Dashboard → Deployments
2. Son deployment'ın yanındaki "..." menüsü
3. "Redeploy" seçin

### Environment Variables Kontrolü
1. Vercel → Settings → Environment Variables
2. Şu değişkenler var mı kontrol edin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 📞 Destek

Sorun devam ederse:
1. Vercel Dashboard → Deployments → Logs
2. Browser Console (F12) → Console sekmesi
3. Network sekmesi → Hangi istekler başarısız?

---

## 🎯 En Sık Karşılaşılan Sorunlar

1. **DNS propagasyon**: 1-2 saat bekleyin
2. **Build hatası**: Logları kontrol edin
3. **Environment variables eksik**: Vercel'de ekleyin
4. **Cache sorunu**: Tarayıcı cache temizleyin
5. **Domain eklenmemiş**: Vercel'de domain ekleyin

---

**Hangi hata mesajını görüyorsunuz?** Bu bilgi sorunu çözmemize yardımcı olur.

