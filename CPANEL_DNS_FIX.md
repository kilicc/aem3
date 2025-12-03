# 🔧 cPanel DNS Düzeltme - Adım Adım Rehber

## 📊 Mevcut Durum

Zone Editor'da görünen:
- `planlama.aemakgun.com.tr.` → A Record → `213.238.190.244` (cPanel sunucusu)
- Bu kayıt cPanel sunucusuna yönlendiriyor ❌

## ✅ Yapılacaklar

### YÖNTEM 1: CNAME Kullan (ÖNERİLEN) ⭐

#### Adım 1: Vercel'de Domain Ekle
1. Vercel Dashboard → Projenizi seçin
2. **Settings** → **Domains**
3. **Add Domain** → `planlama.aemakgun.com.tr` yazın
4. Vercel size CNAME değerini verecek (örn: `cname.vercel-dns.com`)

#### Adım 2: cPanel'de Mevcut A Record'u Sil
1. Zone Editor'da `planlama.aemakgun.com.tr.` satırını bulun
2. **Sil** (kırmızı çöp kutusu) butonuna tıklayın
3. Onaylayın

#### Adım 3: Yeni CNAME Kaydı Ekle
1. **"+ Kayıt Ekle"** (Add Record) butonuna tıklayın
2. Açılan menüden **"CNAME"** seçin
3. Formu doldurun:
   - **Ad (Name)**: `planlama` (sadece subdomain, nokta ve domain olmadan)
   - **TTL**: `3600` (veya varsayılan)
   - **CNAME**: Vercel'in verdiği değer (örn: `cname.vercel-dns.com`)
4. **Kaydet** butonuna tıklayın

**Örnek:**
```
Ad: planlama
TTL: 3600
Tür: CNAME
Kayıt: cname.vercel-dns.com
```

#### Adım 4: Kaydet
1. Üstteki **"Save All Records"** (floppy disk ikonu) butonuna tıklayın
2. Değişiklikler kaydedilecek

---

### YÖNTEM 2: A Record'u Güncelle (Alternatif)

Eğer CNAME kullanamıyorsanız:

#### Adım 1: Vercel'den IP Adresini Al
1. Vercel Dashboard → Settings → Domains
2. `planlama.aemakgun.com.tr` ekleyin
3. Vercel size IP adresini verecek (örn: `76.76.21.21`)

#### Adım 2: Mevcut A Record'u Düzenle
1. Zone Editor'da `planlama.aemakgun.com.tr.` satırını bulun
2. **Düzenle** (mavi kalem ikonu) butonuna tıklayın
3. **Kayıt (Record)** alanını Vercel IP'si ile değiştirin
4. **Kaydet** butonuna tıklayın

#### Adım 3: Kaydet
1. **"Save All Records"** butonuna tıklayın

---

## 🎯 Hangi Yöntemi Seçmeliyim?

| Özellik | CNAME | A Record |
|---------|-------|----------|
| **Önerilen** | ✅ Evet | ❌ Hayır |
| **Otomatik IP Güncelleme** | ✅ Evet | ❌ Hayır |
| **Kolaylık** | ✅ Kolay | ⚠️ Orta |
| **Vercel Önerisi** | ✅ Evet | ❌ Hayır |

**ÖNERİ: CNAME kullanın!** Vercel IP değişse bile otomatik çalışır.

---

## 📋 Adım Adım Görsel Rehber

### 1. Mevcut Kaydı Bul
- Zone Editor'da `planlama.aemakgun.com.tr.` satırını bulun
- Şu anda: `A` → `213.238.190.244`

### 2. Kaydı Sil
- **Sil** (kırmızı çöp kutusu) butonuna tıklayın
- Onaylayın

### 3. Yeni CNAME Ekle
- **"+ Kayıt Ekle"** → **"CNAME"** seçin
- **Ad**: `planlama` (nokta ve domain OLMADAN)
- **CNAME**: Vercel'in verdiği değer
- **Kaydet**

### 4. Tüm Kayıtları Kaydet
- **"Save All Records"** (floppy disk) butonuna tıklayın

---

## ⏱️ Bekleme Süresi

DNS değişiklikleri:
- **Minimum**: 5-10 dakika
- **Ortalama**: 1-2 saat
- **Maksimum**: 24-48 saat

---

## ✅ Kontrol

### DNS Kontrolü
```bash
# Terminal'de
nslookup planlama.aemakgun.com.tr

# Beklenen sonuç (CNAME kullanıyorsanız):
# planlama.aemakgun.com.tr canonical name = cname.vercel-dns.com
```

### Online Kontrol
- https://dnschecker.org/#CNAME/planlama.aemakgun.com.tr
- https://www.whatsmydns.net/#CNAME/planlama.aemakgun.com.tr

### Vercel Dashboard Kontrolü
- Vercel → Settings → Domains
- `planlama.aemakgun.com.tr` yanında **"Valid Configuration"** yazmalı

---

## 🐛 Sorun Giderme

### "Invalid Configuration" Hatası
- DNS kaydının doğru olduğundan emin olun
- TTL değerini düşürün (300-600)
- Vercel dashboard'da **"Refresh"** butonuna tıklayın

### Site Hala Eski Görünüyor
- DNS cache temizleyin
- Farklı tarayıcı/cihaz deneyin
- 1-2 saat bekleyin

### CNAME Çalışmıyor
- Ad alanında sadece `planlama` yazdığınızdan emin olun (nokta yok)
- Vercel'in verdiği CNAME değerini doğru yazdığınızdan emin olun

---

## 🎯 Özet

1. ✅ Vercel'de domain ekle
2. ✅ cPanel'de mevcut A Record'u sil
3. ✅ Yeni CNAME kaydı ekle (`planlama` → Vercel CNAME)
4. ✅ "Save All Records" butonuna tıkla
5. ⏱️ 1-2 saat bekle
6. ✅ Kontrol et

**ÖNEMLİ:** Ad alanına sadece `planlama` yazın, `planlama.aemakgun.com.tr` YAZMAYIN!

