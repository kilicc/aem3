-- Çalışanlar Modülü - Employees Tablosu
-- Bu dosya Supabase SQL Editor'de çalıştırılmalıdır
-- NOT: Bu dosya birden fazla kez çalıştırılabilir (idempotent)

-- Employees (Çalışanlar) tablosu - Özlük Dosyası
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL UNIQUE, -- Her çalışanın bir kullanıcısı
  employee_number TEXT UNIQUE, -- Personel numarası
  first_name TEXT NOT NULL, -- Ad
  last_name TEXT NOT NULL, -- Soyad
  tc_identity_number TEXT UNIQUE, -- T.C. Kimlik No
  birth_date DATE, -- Doğum tarihi
  birth_place TEXT, -- Doğum yeri
  gender TEXT CHECK (gender IN ('erkek', 'kadın', 'belirtmek_istemiyorum')), -- Cinsiyet
  marital_status TEXT CHECK (marital_status IN ('bekar', 'evli', 'boşanmış', 'dul')), -- Medeni durum
  phone TEXT, -- Telefon
  email TEXT, -- E-posta
  address TEXT, -- Adres
  city TEXT, -- Şehir
  district TEXT, -- İlçe
  postal_code TEXT, -- Posta kodu
  emergency_contact_name TEXT, -- Acil durum iletişim adı
  emergency_contact_phone TEXT, -- Acil durum iletişim telefonu
  emergency_contact_relation TEXT, -- Acil durum iletişim ilişkisi
  hire_date DATE, -- İşe başlama tarihi
  termination_date DATE, -- İşten ayrılma tarihi
  department TEXT, -- Departman
  position TEXT, -- Pozisyon/Ünvan
  salary DECIMAL(10, 2), -- Maaş
  bank_name TEXT, -- Banka adı
  bank_account_number TEXT, -- IBAN veya hesap numarası
  iban TEXT, -- IBAN
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-')), -- Kan grubu
  driving_license_number TEXT, -- Ehliyet numarası
  driving_license_class TEXT, -- Ehliyet sınıfı
  education_level TEXT, -- Eğitim seviyesi (ilkokul, ortaokul, lise, üniversite, yüksek lisans, doktora)
  school_name TEXT, -- Okul adı
  graduation_year INTEGER, -- Mezuniyet yılı
  notes TEXT, -- Notlar
  is_active BOOLEAN DEFAULT true, -- Aktif mi
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_tc_identity_number ON employees(tc_identity_number);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);

-- Update trigger
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Employees RLS Policies
DROP POLICY IF EXISTS "Admin can view all employees" ON employees;
CREATE POLICY "Admin can view all employees" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can insert employees" ON employees;
CREATE POLICY "Admin can insert employees" ON employees
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update employees" ON employees;
CREATE POLICY "Admin can update employees" ON employees
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can delete employees" ON employees;
CREATE POLICY "Admin can delete employees" ON employees
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can view their own employee record
DROP POLICY IF EXISTS "Users can view their own employee record" ON employees;
CREATE POLICY "Users can view their own employee record" ON employees
  FOR SELECT USING (
    user_id = auth.uid()
  );

