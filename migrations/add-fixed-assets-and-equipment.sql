-- Demirbaş ve Ekipman Modülü
-- Bu dosya Supabase SQL Editor'de çalıştırılmalıdır

-- 1. Demirbaş Tablosu (Fixed Assets)
CREATE TABLE IF NOT EXISTS fixed_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  asset_code TEXT UNIQUE, -- Demirbaş kodu
  category TEXT, -- Kategori (bilgisayar, mobilya, makine, vb.)
  brand TEXT, -- Marka
  model TEXT, -- Model
  serial_number TEXT, -- Seri numarası
  purchase_date DATE, -- Satın alma tarihi
  purchase_price DECIMAL(10, 2), -- Satın alma fiyatı
  location TEXT, -- Konum (ofis, depo, sahada, vb.)
  warehouse_id UUID REFERENCES warehouses(id), -- Depo ID (opsiyonel)
  status TEXT NOT NULL CHECK (status IN ('active', 'maintenance', 'disposed', 'lost')) DEFAULT 'active',
  notes TEXT,
  assigned_to UUID REFERENCES profiles(id), -- Atanan kişi (opsiyonel)
  assigned_at TIMESTAMP WITH TIME ZONE, -- Atanma tarihi
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Ekipman Tablosu (Equipment)
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  equipment_code TEXT UNIQUE, -- Ekipman kodu
  category TEXT NOT NULL, -- Kategori (yelek, çeket, iş_ayakkabısı, baret, vb.)
  brand TEXT, -- Marka
  model TEXT, -- Model
  size TEXT, -- Beden/Boyut (S, M, L, XL, 42, 43, vb.)
  color TEXT, -- Renk
  warehouse_id UUID REFERENCES warehouses(id), -- Depo ID
  quantity INTEGER NOT NULL DEFAULT 0, -- Stok miktarı
  min_stock_level INTEGER DEFAULT 0, -- Minimum stok seviyesi
  unit_price DECIMAL(10, 2), -- Birim fiyat
  purchase_date DATE, -- Satın alma tarihi
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Periyodik Ürün Dağıtımı Tablosu (Periodic Product Distribution)
CREATE TABLE IF NOT EXISTS periodic_product_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  distribution_date DATE NOT NULL, -- Dağıtım tarihi
  quantity INTEGER NOT NULL DEFAULT 1, -- Dağıtılan miktar
  period_months INTEGER NOT NULL DEFAULT 12, -- Periyot (ay cinsinden)
  next_renewal_date DATE, -- Bir sonraki yenileme tarihi (otomatik hesaplanır)
  notes TEXT,
  distributed_by UUID REFERENCES profiles(id) NOT NULL, -- Dağıtan kişi
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Periyodik Ürün Takibi Tablosu (Periodic Product Tracking)
-- Bu tablo cron job ile güncellenecek
CREATE TABLE IF NOT EXISTS periodic_product_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  distribution_id UUID REFERENCES periodic_product_distributions(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  next_renewal_date DATE NOT NULL,
  days_until_renewal INTEGER, -- Yenilemeye kalan gün sayısı
  status TEXT NOT NULL CHECK (status IN ('active', 'due_soon', 'overdue', 'renewed')) DEFAULT 'active',
  last_notification_sent_at TIMESTAMP WITH TIME ZONE, -- Son bildirim gönderilme tarihi
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(distribution_id)
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_assigned_to ON fixed_assets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_warehouse_id ON fixed_assets(warehouse_id);

CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_warehouse_id ON equipment(warehouse_id);

CREATE INDEX IF NOT EXISTS idx_periodic_distributions_employee_id ON periodic_product_distributions(employee_id);
CREATE INDEX IF NOT EXISTS idx_periodic_distributions_equipment_id ON periodic_product_distributions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_periodic_distributions_next_renewal_date ON periodic_product_distributions(next_renewal_date);

CREATE INDEX IF NOT EXISTS idx_periodic_tracking_next_renewal_date ON periodic_product_tracking(next_renewal_date);
CREATE INDEX IF NOT EXISTS idx_periodic_tracking_status ON periodic_product_tracking(status);
CREATE INDEX IF NOT EXISTS idx_periodic_tracking_employee_id ON periodic_product_tracking(employee_id);

-- RLS Politikaları
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodic_product_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodic_product_tracking ENABLE ROW LEVEL SECURITY;

-- Fixed Assets Policies
CREATE POLICY "Admins can view all fixed assets" ON fixed_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert fixed assets" ON fixed_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update fixed assets" ON fixed_assets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete fixed assets" ON fixed_assets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Equipment Policies
CREATE POLICY "Admins can view all equipment" ON equipment
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert equipment" ON equipment
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update equipment" ON equipment
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete equipment" ON equipment
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Periodic Product Distributions Policies
CREATE POLICY "Admins can view all periodic distributions" ON periodic_product_distributions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view own periodic distributions" ON periodic_product_distributions
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Admins can insert periodic distributions" ON periodic_product_distributions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update periodic distributions" ON periodic_product_distributions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete periodic distributions" ON periodic_product_distributions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Periodic Product Tracking Policies
CREATE POLICY "Admins can view all periodic tracking" ON periodic_product_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view own periodic tracking" ON periodic_product_tracking
  FOR SELECT USING (employee_id = auth.uid());

-- Function: next_renewal_date hesaplama
CREATE OR REPLACE FUNCTION calculate_next_renewal_date(dist_date DATE, period_months INTEGER)
RETURNS DATE AS $$
BEGIN
  RETURN dist_date + (period_months || ' months')::INTERVAL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: next_renewal_date otomatik hesaplama
CREATE OR REPLACE FUNCTION update_periodic_distribution_renewal_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.next_renewal_date IS NULL AND NEW.distribution_date IS NOT NULL AND NEW.period_months IS NOT NULL THEN
    NEW.next_renewal_date := calculate_next_renewal_date(NEW.distribution_date, NEW.period_months);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_periodic_distribution_renewal_date
  BEFORE INSERT OR UPDATE ON periodic_product_distributions
  FOR EACH ROW
  EXECUTE FUNCTION update_periodic_distribution_renewal_date();

-- Function: periodic_product_tracking güncelleme
CREATE OR REPLACE FUNCTION update_periodic_product_tracking()
RETURNS void AS $$
BEGIN
  -- Mevcut dağıtımları takip tablosuna ekle/güncelle
  INSERT INTO periodic_product_tracking (
    distribution_id,
    equipment_id,
    employee_id,
    next_renewal_date,
    days_until_renewal,
    status
  )
  SELECT 
    pd.id,
    pd.equipment_id,
    pd.employee_id,
    pd.next_renewal_date,
    (pd.next_renewal_date - CURRENT_DATE)::INTEGER,
    CASE
      WHEN (pd.next_renewal_date - CURRENT_DATE) < 0 THEN 'overdue'
      WHEN (pd.next_renewal_date - CURRENT_DATE) <= 30 THEN 'due_soon'
      ELSE 'active'
    END
  FROM periodic_product_distributions pd
  WHERE pd.next_renewal_date IS NOT NULL
  ON CONFLICT (distribution_id) 
  DO UPDATE SET
    next_renewal_date = EXCLUDED.next_renewal_date,
    days_until_renewal = EXCLUDED.days_until_renewal,
    status = EXCLUDED.status,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

