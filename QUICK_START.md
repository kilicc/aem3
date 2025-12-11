# ⚡ Hızlı Başlangıç

Projeyi hızlıca kurmak için bu adımları takip edin.

## 🚀 5 Dakikada Kurulum

### 1. Gereksinimleri Kontrol Edin
```bash
node --version  # v18+ olmalı
npm --version   # Herhangi bir sürüm
```

### 2. Projeyi İndirin
```bash
git clone https://github.com/kilicc/aem3.git
cd aem3
```

### 3. Bağımlılıkları Yükleyin
```bash
npm install
```

### 4. Environment Variables Oluşturun

**macOS/Linux:**
```bash
cp .env.example .env.local
```

**Windows:**
```powershell
Copy-Item .env.example .env.local
```

`.env.local` dosyasındaki değerler zaten dolu, değiştirmenize gerek yok.

### 5. Server'ı Başlatın
```bash
npm run dev
```

### 6. Tarayıcıda Açın
```
http://localhost:3000
```

### 7. Admin Kullanıcısı Oluşturun

Supabase Dashboard → Authentication → Users → Add User
- Email: `admin@aem.com.tr`
- Password: `123`
- Auto Confirm: ✅

SQL Editor'de çalıştırın:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@aem.com.tr';
```

**✅ Hazırsınız!**

---

## 📚 Detaylı Kurulum

Daha detaylı bilgi için [SETUP.md](./SETUP.md) dosyasına bakın.

---

## 🆘 Sorun mu Yaşıyorsunuz?

1. [SETUP.md](./SETUP.md) → Sorun Giderme bölümüne bakın
2. Port 3000 kullanılıyorsa farklı bir port kullanın: `PORT=3001 npm run dev`
3. `node_modules` silip yeniden yükleyin: `rm -rf node_modules && npm install`

