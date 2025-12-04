
# 🌐 cPanel DNS Ayarları - Vercel Deployment

Vercel'e deploy ettikten sonra, custom domain'inizi (`planlama.aemakgun.com.tr`) Vercel'e yönlendirmek için cPanel'de DNS ayarları yapmanız gerekiyor.

## 📋 ÖNEMLİ NOTLAR

- **Dinamik DNS gerekmez** - Vercel statik bir CNAME veya A record kullanır
- **Vercel önce deploy edilmeli** - DNS ayarlarını yapmadan önce Vercel'de domain ekleyin
- **Propagasyon süresi** - DNS değişiklikleri 24-48 saat içinde yayılır (genellikle 1-2 saat)

---

## 🚀 ADIM ADIM DNS AYARLARI

### ADIM 1: Vercel'de Domain Ekleme (ÖNCE BUNU YAPIN!)

1. Vercel Dashboard → Projenizi seçin
2. **Settings** → **Domains** sekmesine gidin
3. **Add Domain** butonuna tıklayın
4. `planlama.aemakgun.com.tr` yazın
5. **Add** butonuna tıklayın

Vercel size şu bilgileri verecek:
- **CNAME Record** (Önerilen): `cname.vercel-dns.com` veya benzeri
- **A Record** (Alternatif): IP adresi (örn: `76.76.21.21`)

---

### ADIM 2: cPanel'de DNS Ayarları

#### Yöntem A: Zone Editor (Önerilen)

1. **cPanel'e giriş yapın:**
   - URL: `https://planlama.aemakgun.com.tr:2083`
   - Kullanıcı: `planlamaaemakgun`
   - Şifre: `1fM2PX+Ltfo@l6Tv?i`

2. **Zone Editor'ı bulun:**
   - cPanel ana sayfasında **"Zone Editor"** veya **"DNS Zone Editor"** arayın
   - Eğer yoksa: **"Advanced"** → **"Zone Editor"**

3. **Domain seçin:**
   - `aemakgun.com.tr` domain'ini seçin (ana domain)

4. **CNAME Record ekleyin (Önerilen):**

   **Add Record** butonuna tıklayın:
   - **Type**: `CNAME`
   - **Name**: `planlama` (sadece subdomain adı, domain olmadan)
   - **TTL**: `3600` (veya varsayılan)
   - **CNAME**: Vercel'in verdiği CNAME değeri (örn: `cname.vercel-dns.com`)
   - **Add Record** butonuna tıklayın

   **Örnek:**
   ```
   Type: CNAME
   Name: planlama
   TTL: 3600
   CNAME: cname.vercel-dns.com
   ```

5. **Kaydet ve Bekle:**
   - Değişiklikler genellikle 1-2 saat içinde aktif olur
   - Maksimum 48 saat sürebilir

---

#### Yöntem B: A Record (Alternatif)

Eğer CNAME kullanamıyorsanız (bazı durumlarda root domain için CNAME çalışmaz):

1. **Zone Editor** → **Add Record**
2. **Type**: `A`
3. **Name**: `planlama`
4. **TTL**: `3600`
5. **Address**: Vercel'in verdiği IP adresi (örn: `76.76.21.21`)
6. **Add Record**

**⚠️ NOT**: A Record kullanıyorsanız, Vercel IP'si değişirse manuel güncelleme yapmanız gerekir. CNAME daha esnektir.

---

### ADIM 3: Mevcut Kayıtları Kontrol Etme

Eğer `planlama.aemakgun.com.tr` için zaten bir DNS kaydı varsa:

1. **Zone Editor** → Domain seçin
2. Mevcut kayıtları kontrol edin:
   - `planlama` için A veya CNAME kaydı var mı?
   - Varsa, **Edit** ile güncelleyin veya **Delete** ile silip yenisini ekleyin

---

### ADIM 4: DNS Propagasyon Kontrolü

DNS değişikliklerinin yayıldığını kontrol etmek için:

**Terminal/Command Prompt:**
```bash
# CNAME kontrolü
nslookup planlama.aemakgun.com.tr

# Veya
dig planlama.aemakgun.com.tr

# Veya online araçlar:
# - https://dnschecker.org
# - https://www.whatsmydns.net
```

**Beklenen Sonuç:**
- CNAME kullanıyorsanız: `cname.vercel-dns.com` görmelisiniz
- A Record kullanıyorsanız: Vercel IP adresini görmelisiniz

---

## 🔧 DİNAMİK DNS HAKKINDA

### Dinamik DNS Nedir?
Dinamik DNS, IP adresi değiştiğinde otomatik olarak DNS kayıtlarını güncelleyen bir sistemdir.

### Vercel İçin Gerekli mi?
**HAYIR!** Vercel için dinamik DNS gerekmez çünkü:
- Vercel statik bir CNAME veya A record kullanır
- Vercel'in IP adresi değişmez (veya CNAME ile otomatik yönlendirilir)
- CNAME kullanırsanız, Vercel IP değişse bile otomatik çalışır

### Ne Zaman Dinamik DNS Kullanılır?
- Ev sunucunuz varsa ve IP adresiniz sürekli değişiyorsa
- Kendi VPS'inizi kullanıyorsanız ve IP değişken ise
- Vercel gibi managed platformlar için **GEREKSİZ**

---

## 📊 DNS KAYIT TİPLERİ KARŞILAŞTIRMASI

| Tip | Kullanım | Avantaj | Dezavantaj |
|-----|----------|---------|------------|
| **CNAME** | Subdomain için | Otomatik IP güncelleme | Root domain için çalışmaz |
| **A Record** | IP adresi | Hızlı | IP değişirse manuel güncelleme |
| **Dynamic DNS** | Değişken IP | Otomatik güncelleme | Vercel için gereksiz |

---

## ✅ DOĞRULAMA ADIMLARI

### 1. DNS Kontrolü
```bash
# Terminal'de
nslookup planlama.aemakgun.com.tr
```

### 2. Vercel Dashboard Kontrolü
- Vercel → Settings → Domains
- `planlama.aemakgun.com.tr` yanında **"Valid Configuration"** yazmalı
- Eğer hata varsa, Vercel size ne yapmanız gerektiğini söyler

### 3. SSL Sertifikası
- Vercel otomatik olarak SSL sertifikası sağlar (Let's Encrypt)
- DNS doğrulandıktan sonra 1-2 saat içinde SSL aktif olur
- Tarayıcıda `https://planlama.aemakgun.com.tr` açılmalı

---

## 🐛 SORUN GİDERME

### DNS Değişiklikleri Görünmüyor
1. **Bekleyin**: DNS propagasyon 1-48 saat sürebilir
2. **DNS Cache Temizleyin**: 
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac/Linux
   sudo dscacheutil -flushcache
   ```
3. **Farklı DNS Sunucusu Deneyin**: Google DNS (8.8.8.8) veya Cloudflare (1.1.1.1)

### Vercel "Invalid Configuration" Hatası
1. DNS kaydının doğru olduğundan emin olun
2. TTL değerini düşürün (300-600) ve tekrar deneyin
3. Vercel dashboard'da **"Refresh"** butonuna tıklayın

### SSL Sertifikası Çalışmıyor
1. DNS'in tamamen yayıldığından emin olun (24 saat bekleyin)
2. Vercel dashboard'da SSL durumunu kontrol edin
3. Vercel otomatik olarak SSL sağlar, manuel işlem gerekmez

---

## 📞 DESTEK

Sorun yaşarsanız:
1. Vercel Dashboard → Deployments → Logs
2. cPanel → Zone Editor → Mevcut kayıtları kontrol edin
3. DNS checker araçlarını kullanın: https://dnschecker.org

---

## 🎯 ÖZET

1. ✅ **Vercel'de domain ekleyin** (Settings → Domains)
2. ✅ **cPanel Zone Editor'a gidin**
3. ✅ **CNAME kaydı ekleyin** (`planlama` → `cname.vercel-dns.com`)
4. ✅ **1-2 saat bekleyin** (DNS propagasyon)
5. ✅ **Vercel dashboard'da doğrulayın**
6. ✅ **SSL otomatik aktif olacak**

**Dinamik DNS gerekmez!** CNAME kaydı yeterli. 🚀

