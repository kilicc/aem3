# 🔍 DNS ve Deployment Durum Kontrolü

## 📊 Mevcut Durum Analizi

### ✅ DNS Durumu
- **Domain**: `planlama.aemakgun.com.tr` ✅ Aktif
- **SSL**: HTTPS çalışıyor ✅
- **Server**: LiteSpeed Web Server ✅

### ⚠️ Sorun
Site şu anda **boş bir dizin** gösteriyor. Bu şu anlama geliyor:
1. DNS ayarları yapılmış ✅
2. Domain aktif ✅
3. **AMA** henüz Vercel'e yönlendirilmemiş veya Vercel'de deploy edilmemiş ❌

---

## 🔧 Yapılması Gerekenler

### 1. Vercel'de Deploy Kontrolü

Vercel Dashboard'a gidin ve kontrol edin:
- Proje deploy edildi mi?
- Domain eklendi mi?
- Build başarılı mı?

### 2. DNS Kayıt Kontrolü

cPanel → Zone Editor'da kontrol edin:

**Beklenen CNAME Kaydı:**
```
Type: CNAME
Name: planlama
CNAME: cname.vercel-dns.com (veya Vercel'in verdiği değer)
```

**Eğer A Record varsa:**
```
Type: A
Name: planlama
Address: Vercel IP adresi
```

### 3. Vercel'de Domain Ekleme

Eğer henüz Vercel'de domain eklemediyseniz:

1. Vercel Dashboard → Projenizi seçin
2. **Settings** → **Domains**
3. **Add Domain** → `planlama.aemakgun.com.tr`
4. Vercel size DNS ayarlarını gösterecek
5. Bu ayarları cPanel'de uygulayın

---

## 🚀 Hızlı Çözüm Adımları

### Adım 1: Vercel'de Proje Oluşturun
1. https://vercel.com → GitHub ile giriş
2. **Add New Project** → `kilicc/aem3` seçin
3. **Deploy** butonuna tıklayın

### Adım 2: Domain Ekleyin
1. Deploy tamamlandıktan sonra
2. **Settings** → **Domains**
3. `planlama.aemakgun.com.tr` ekleyin

### Adım 3: DNS Ayarlarını Yapın
1. Vercel size CNAME değerini verecek
2. cPanel → Zone Editor
3. CNAME kaydı ekleyin (yukarıdaki gibi)

### Adım 4: Bekleyin
- DNS propagasyon: 1-2 saat
- SSL sertifikası: Otomatik (1-2 saat)

---

## 🔍 Kontrol Komutları

### DNS Kontrolü
```bash
# Terminal'de
nslookup planlama.aemakgun.com.tr

# Veya online
https://dnschecker.org/#CNAME/planlama.aemakgun.com.tr
```

### Vercel Kontrolü
- Vercel Dashboard → Deployments
- Son deployment'ın başarılı olduğundan emin olun
- Domain'in "Valid Configuration" olduğunu kontrol edin

---

## 📋 Checklist

- [ ] Vercel'de proje oluşturuldu mu?
- [ ] Build başarılı mı?
- [ ] Domain Vercel'e eklendi mi?
- [ ] cPanel'de CNAME kaydı var mı?
- [ ] DNS propagasyon tamamlandı mı? (1-2 saat)
- [ ] SSL sertifikası aktif mi?

---

## 🐛 Olası Sorunlar

### 1. "Invalid Configuration" Hatası
- DNS kaydının doğru olduğundan emin olun
- Vercel dashboard'da "Refresh" butonuna tıklayın

### 2. Site Hala Boş Görünüyor
- DNS propagasyon bekleyin (1-48 saat)
- Vercel'de domain'in doğrulandığını kontrol edin

### 3. SSL Çalışmıyor
- DNS tamamen yayıldıktan sonra SSL otomatik aktif olur
- 24 saat bekleyin

---

## ✅ Başarı Kriterleri

Site başarıyla yönlendirildiğinde:
- ✅ Vercel'in default sayfası görünmeli
- ✅ Veya Next.js uygulamanız çalışmalı
- ✅ HTTPS aktif olmalı
- ✅ Vercel dashboard'da "Valid Configuration" yazmalı

---

**Şu anki durum**: DNS aktif ama Vercel'e yönlendirilmemiş. Vercel'de deploy edip domain eklemeniz gerekiyor.

