-- YEGİS (Yüksek Gerilim İşletme Sorumluluğu) Modülü
-- Periyodik Kontrol Formu Tablosu

CREATE TABLE IF NOT EXISTS yegis_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  form_number TEXT UNIQUE, -- Form numarası (otomatik oluşturulacak)
  
  -- Müşteri Bilgileri
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_city TEXT,
  customer_district TEXT,
  customer_phone TEXT,
  customer_tax_id TEXT,
  customer_tax_office TEXT,
  
  -- Tesis Bilgileri
  facility_name TEXT, -- Tesis adı
  facility_address TEXT, -- Tesis adresi
  facility_city TEXT,
  facility_district TEXT,
  facility_phone TEXT,
  
  -- Trafo/OG İşletme Bilgileri
  transformer_power TEXT, -- Trafo gücü (örn: 400KVA)
  transformer_brand TEXT, -- Marka
  transformer_model TEXT, -- Model
  transformer_serial_number TEXT, -- Seri no
  transformer_manufacturing_year INTEGER, -- İmalat yılı
  transformer_installation_date DATE, -- Tesis tarihi
  
  -- Kontrol Bilgileri
  control_date DATE NOT NULL, -- Kontrol tarihi
  control_type TEXT, -- Kontrol tipi (Periyodik, İlk, vb.)
  next_control_date DATE, -- Sonraki kontrol tarihi
  control_interval_months INTEGER, -- Kontrol aralığı (ay)
  
  -- Kontrol Sonuçları (JSONB - esnek yapı)
  control_results JSONB, -- Tüm kontrol sonuçları
  
  -- Ölçüm Değerleri
  measurements JSONB, -- Ölçüm değerleri (gerilim, akım, vb.)
  
  -- Bulgular ve Öneriler
  findings TEXT, -- Bulgular
  recommendations TEXT, -- Öneriler
  notes TEXT, -- Notlar
  
  -- İmzalar
  technician_signature TEXT, -- Teknisyen imzası (Base64)
  technician_name TEXT, -- Teknisyen adı
  technician_title TEXT, -- Teknisyen ünvanı
  technician_license_number TEXT, -- Teknisyen sertifika/ruhsat no
  
  customer_signature TEXT, -- Müşteri imzası (Base64)
  customer_representative_name TEXT, -- Müşteri temsilcisi adı
  customer_representative_title TEXT, -- Müşteri temsilcisi ünvanı
  
  -- Durum
  status TEXT CHECK (status IN ('draft', 'completed', 'approved', 'archived')) DEFAULT 'draft',
  
  -- Metadata
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_yegis_forms_customer_id ON yegis_forms(customer_id);
CREATE INDEX IF NOT EXISTS idx_yegis_forms_form_number ON yegis_forms(form_number);
CREATE INDEX IF NOT EXISTS idx_yegis_forms_control_date ON yegis_forms(control_date);
CREATE INDEX IF NOT EXISTS idx_yegis_forms_status ON yegis_forms(status);
CREATE INDEX IF NOT EXISTS idx_yegis_forms_created_by ON yegis_forms(created_by);

-- Update trigger
DROP TRIGGER IF EXISTS update_yegis_forms_updated_at ON yegis_forms;
CREATE TRIGGER update_yegis_forms_updated_at BEFORE UPDATE ON yegis_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE yegis_forms ENABLE ROW LEVEL SECURITY;

-- Admin can view all forms
DROP POLICY IF EXISTS "Admin can view all yegis forms" ON yegis_forms;
CREATE POLICY "Admin can view all yegis forms" ON yegis_forms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin can insert forms
DROP POLICY IF EXISTS "Admin can insert yegis forms" ON yegis_forms;
CREATE POLICY "Admin can insert yegis forms" ON yegis_forms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin can update forms
DROP POLICY IF EXISTS "Admin can update yegis forms" ON yegis_forms;
CREATE POLICY "Admin can update yegis forms" ON yegis_forms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin can delete forms
DROP POLICY IF EXISTS "Admin can delete yegis forms" ON yegis_forms;
CREATE POLICY "Admin can delete yegis forms" ON yegis_forms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can view forms they created
DROP POLICY IF EXISTS "Users can view their own yegis forms" ON yegis_forms;
CREATE POLICY "Users can view their own yegis forms" ON yegis_forms
  FOR SELECT USING (created_by = auth.uid());

-- Users can update forms they created
DROP POLICY IF EXISTS "Users can update their own yegis forms" ON yegis_forms;
CREATE POLICY "Users can update their own yegis forms" ON yegis_forms
  FOR UPDATE USING (created_by = auth.uid());

-- Form numarası oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_yegis_form_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  sequence_num INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Yıl ve sıra numarası ile form numarası oluştur
  SELECT COALESCE(MAX(CAST(SUBSTRING(form_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM yegis_forms
  WHERE form_number LIKE 'YEGIS-' || year_part || '-%';
  
  new_number := 'YEGIS-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

