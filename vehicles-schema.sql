-- Araç Bakım Takip Modülü - Vehicles Tablosu
-- Bu dosya Supabase SQL Editor'de çalıştırılmalıdır
-- NOT: Bu dosya birden fazla kez çalıştırılabilir (idempotent)

-- Vehicles (Araçlar) tablosu
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate_number TEXT NOT NULL UNIQUE, -- Plaka numarası
  brand TEXT NOT NULL, -- Marka (örn: Ford, Mercedes)
  model TEXT NOT NULL, -- Model (örn: Transit, Sprinter)
  year INTEGER, -- Üretim yılı
  color TEXT, -- Renk
  chassis_number TEXT, -- Şasi numarası
  engine_number TEXT, -- Motor numarası
  fuel_type TEXT CHECK (fuel_type IN ('benzin', 'dizel', 'elektrik', 'hibrit', 'lpg')), -- Yakıt tipi
  license_plate_date DATE, -- Ruhsat tarihi
  license_expiry_date DATE, -- Ruhsat son geçerlilik tarihi
  insurance_company TEXT, -- Sigorta şirketi
  insurance_policy_number TEXT, -- Sigorta poliçe numarası
  insurance_expiry_date DATE, -- Sigorta bitiş tarihi
  kasko_company TEXT, -- Kasko şirketi
  kasko_policy_number TEXT, -- Kasko poliçe numarası
  kasko_start_date DATE, -- Kasko başlangıç tarihi
  kasko_expiry_date DATE, -- Kasko bitiş tarihi
  kasko_premium DECIMAL(10, 2), -- Kasko prim tutarı
  last_maintenance_date DATE, -- Son bakım tarihi
  next_maintenance_date DATE, -- Sonraki bakım tarihi
  maintenance_interval_days INTEGER DEFAULT 90, -- Bakım aralığı (gün)
  mileage INTEGER DEFAULT 0, -- Kilometre
  last_maintenance_mileage INTEGER DEFAULT 0, -- Son bakım kilometresi
  maintenance_interval_km INTEGER DEFAULT 10000, -- Bakım aralığı (km)
  status TEXT CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active', -- Durum
  notes TEXT, -- Notlar
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Eksik kolonları ekle (eğer tablo zaten varsa)
DO $$
BEGIN
  -- Kasko kolonlarını ekle (eğer yoksa)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'kasko_company') THEN
    ALTER TABLE vehicles ADD COLUMN kasko_company TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'kasko_policy_number') THEN
    ALTER TABLE vehicles ADD COLUMN kasko_policy_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'kasko_start_date') THEN
    ALTER TABLE vehicles ADD COLUMN kasko_start_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'kasko_expiry_date') THEN
    ALTER TABLE vehicles ADD COLUMN kasko_expiry_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'kasko_premium') THEN
    ALTER TABLE vehicles ADD COLUMN kasko_premium DECIMAL(10, 2);
  END IF;
END $$;

-- Vehicle Maintenance History (Araç Bakım Geçmişi) tablosu
CREATE TABLE IF NOT EXISTS vehicle_maintenance_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  maintenance_date DATE NOT NULL,
  maintenance_type TEXT NOT NULL, -- Bakım tipi (periyodik, onarım, yedek parça vb.)
  mileage INTEGER, -- Bakım yapıldığındaki kilometre
  cost DECIMAL(10, 2), -- Bakım maliyeti
  description TEXT, -- Açıklama
  service_provider TEXT, -- Servis sağlayıcı
  invoice_number TEXT, -- Fatura numarası
  performed_by UUID REFERENCES profiles(id), -- Bakımı yapan kişi
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_next_maintenance_date ON vehicles(next_maintenance_date);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_history_vehicle_id ON vehicle_maintenance_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_history_maintenance_date ON vehicle_maintenance_history(maintenance_date);

-- Update trigger for vehicles
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for vehicle_maintenance_history
DROP TRIGGER IF EXISTS update_vehicle_maintenance_history_updated_at ON vehicle_maintenance_history;
CREATE TRIGGER update_vehicle_maintenance_history_updated_at BEFORE UPDATE ON vehicle_maintenance_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_maintenance_history ENABLE ROW LEVEL SECURITY;

-- Vehicles RLS Policies (Önce varsa sil, sonra oluştur)
DROP POLICY IF EXISTS "Admin can view all vehicles" ON vehicles;
CREATE POLICY "Admin can view all vehicles" ON vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can insert vehicles" ON vehicles;
CREATE POLICY "Admin can insert vehicles" ON vehicles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update vehicles" ON vehicles;
CREATE POLICY "Admin can update vehicles" ON vehicles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can delete vehicles" ON vehicles;
CREATE POLICY "Admin can delete vehicles" ON vehicles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Vehicle Maintenance History RLS Policies
DROP POLICY IF EXISTS "Admin can view all maintenance history" ON vehicle_maintenance_history;
CREATE POLICY "Admin can view all maintenance history" ON vehicle_maintenance_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can insert maintenance history" ON vehicle_maintenance_history;
CREATE POLICY "Admin can insert maintenance history" ON vehicle_maintenance_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update maintenance history" ON vehicle_maintenance_history;
CREATE POLICY "Admin can update maintenance history" ON vehicle_maintenance_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can delete maintenance history" ON vehicle_maintenance_history;
CREATE POLICY "Admin can delete maintenance history" ON vehicle_maintenance_history
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
