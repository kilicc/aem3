-- İş Emirlerine Araç Takibi Ekleme
-- Bu dosya Supabase SQL Editor'de çalıştırılmalıdır

-- 1. work_orders tablosuna araç takip alanları ekle
ALTER TABLE work_orders 
  ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles(id),
  ADD COLUMN IF NOT EXISTS vehicle_start_km INTEGER,
  ADD COLUMN IF NOT EXISTS vehicle_end_km INTEGER,
  ADD COLUMN IF NOT EXISTS vehicle_assigned_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS vehicle_assigned_at TIMESTAMP WITH TIME ZONE;

-- 2. Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle_id ON work_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle_assigned_at ON work_orders(vehicle_assigned_at);

-- 3. Araç kullanım geçmişi tablosu (detaylı raporlama için)
CREATE TABLE IF NOT EXISTS vehicle_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES profiles(id) NOT NULL,
  start_km INTEGER NOT NULL,
  end_km INTEGER,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  distance_km INTEGER GENERATED ALWAYS AS (end_km - start_km) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Index'ler
CREATE INDEX IF NOT EXISTS idx_vehicle_usage_logs_vehicle_id ON vehicle_usage_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_usage_logs_work_order_id ON vehicle_usage_logs(work_order_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_usage_logs_start_time ON vehicle_usage_logs(start_time);

-- 5. RLS politikaları
ALTER TABLE vehicle_usage_logs ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi atadıkları araç kullanımlarını görebilir
CREATE POLICY "Users can view own vehicle usage logs" ON vehicle_usage_logs
  FOR SELECT USING (
    assigned_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('yonetici', 'admin', 'saha_sefi', 'ofis_sefi')
    )
  );

-- Saha şefi, ofis şefi, yönetici ve admin tüm kayıtları görebilir
CREATE POLICY "Managers can view all vehicle usage logs" ON vehicle_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('yonetici', 'admin', 'saha_sefi', 'ofis_sefi')
    )
  );

-- Kullanıcılar araç kullanım kaydı oluşturabilir
CREATE POLICY "Users can create vehicle usage logs" ON vehicle_usage_logs
  FOR INSERT WITH CHECK (assigned_by = auth.uid());

-- Kullanıcılar kendi kayıtlarını güncelleyebilir
CREATE POLICY "Users can update own vehicle usage logs" ON vehicle_usage_logs
  FOR UPDATE USING (assigned_by = auth.uid());

-- 6. Trigger: İş emri tamamlandığında vehicles tablosundaki kilometreyi güncelle
CREATE OR REPLACE FUNCTION update_vehicle_mileage_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer iş emri tamamlandıysa ve araç bilgisi varsa
  IF NEW.status = 'completed' AND NEW.vehicle_id IS NOT NULL AND NEW.vehicle_end_km IS NOT NULL THEN
    -- Vehicles tablosundaki kilometreyi güncelle
    UPDATE vehicles
    SET mileage = NEW.vehicle_end_km,
        updated_at = NOW()
    WHERE id = NEW.vehicle_id;
    
    -- Vehicle usage log'u güncelle
    UPDATE vehicle_usage_logs
    SET end_km = NEW.vehicle_end_km,
        end_time = NEW.completed_at,
        updated_at = NOW()
    WHERE work_order_id = NEW.id AND vehicle_id = NEW.vehicle_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı oluştur
DROP TRIGGER IF EXISTS trigger_update_vehicle_mileage ON work_orders;
CREATE TRIGGER trigger_update_vehicle_mileage
  AFTER UPDATE ON work_orders
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND NEW.vehicle_id IS NOT NULL)
  EXECUTE FUNCTION update_vehicle_mileage_on_completion();

