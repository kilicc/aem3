-- Bakım Tarihi Alanları Ekleme
-- Bu dosya Supabase SQL Editor'de çalıştırılmalıdır

-- 1. Tools (Araç-Gereç) Tablosuna Bakım Tarihi Alanları
ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS last_maintenance_date DATE,
  ADD COLUMN IF NOT EXISTS next_maintenance_date DATE,
  ADD COLUMN IF NOT EXISTS maintenance_interval_months INTEGER DEFAULT 12;

-- 2. Equipment (Ekipman) Tablosuna Bakım Tarihi Alanları
ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS last_maintenance_date DATE,
  ADD COLUMN IF NOT EXISTS next_maintenance_date DATE,
  ADD COLUMN IF NOT EXISTS maintenance_interval_months INTEGER DEFAULT 12;

-- 3. Fixed Assets (Demirbaş) Tablosuna Bakım Tarihi Alanları
ALTER TABLE fixed_assets
  ADD COLUMN IF NOT EXISTS last_maintenance_date DATE,
  ADD COLUMN IF NOT EXISTS next_maintenance_date DATE,
  ADD COLUMN IF NOT EXISTS maintenance_interval_months INTEGER DEFAULT 12;

-- Index'ler: Bakım tarihine göre arama için
CREATE INDEX IF NOT EXISTS idx_tools_next_maintenance_date ON tools(next_maintenance_date) WHERE next_maintenance_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_equipment_next_maintenance_date ON equipment(next_maintenance_date) WHERE next_maintenance_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fixed_assets_next_maintenance_date ON fixed_assets(next_maintenance_date) WHERE next_maintenance_date IS NOT NULL;

-- Function: next_maintenance_date otomatik hesaplama
CREATE OR REPLACE FUNCTION calculate_next_maintenance_date(last_date DATE, interval_months INTEGER)
RETURNS DATE AS $$
BEGIN
  IF last_date IS NULL OR interval_months IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN last_date + (interval_months || ' months')::INTERVAL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: Tools için next_maintenance_date otomatik hesaplama
CREATE OR REPLACE FUNCTION update_tools_next_maintenance_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_maintenance_date IS NOT NULL AND NEW.maintenance_interval_months IS NOT NULL THEN
    NEW.next_maintenance_date := calculate_next_maintenance_date(NEW.last_maintenance_date, NEW.maintenance_interval_months);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tools_next_maintenance_date ON tools;
CREATE TRIGGER trigger_update_tools_next_maintenance_date
  BEFORE INSERT OR UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION update_tools_next_maintenance_date();

-- Trigger: Equipment için next_maintenance_date otomatik hesaplama
CREATE OR REPLACE FUNCTION update_equipment_next_maintenance_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_maintenance_date IS NOT NULL AND NEW.maintenance_interval_months IS NOT NULL THEN
    NEW.next_maintenance_date := calculate_next_maintenance_date(NEW.last_maintenance_date, NEW.maintenance_interval_months);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_equipment_next_maintenance_date ON equipment;
CREATE TRIGGER trigger_update_equipment_next_maintenance_date
  BEFORE INSERT OR UPDATE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_equipment_next_maintenance_date();

-- Trigger: Fixed Assets için next_maintenance_date otomatik hesaplama
CREATE OR REPLACE FUNCTION update_fixed_assets_next_maintenance_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_maintenance_date IS NOT NULL AND NEW.maintenance_interval_months IS NOT NULL THEN
    NEW.next_maintenance_date := calculate_next_maintenance_date(NEW.last_maintenance_date, NEW.maintenance_interval_months);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_fixed_assets_next_maintenance_date ON fixed_assets;
CREATE TRIGGER trigger_update_fixed_assets_next_maintenance_date
  BEFORE INSERT OR UPDATE ON fixed_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_fixed_assets_next_maintenance_date();

