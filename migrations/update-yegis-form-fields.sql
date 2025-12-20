-- YEGİS Formu için ek alanlar ekleme
-- PDF formundaki tüm alanları içerir

ALTER TABLE yegis_forms
  -- Header bilgileri
  ADD COLUMN IF NOT EXISTS tm_number TEXT, -- T.M. NO
  ADD COLUMN IF NOT EXISTS installation_number TEXT, -- TESİSAT NO
  ADD COLUMN IF NOT EXISTS meter_multiplier TEXT, -- SAYAÇ ÇARPAN
  ADD COLUMN IF NOT EXISTS transformer_voltage TEXT, -- TRAFO GERİLİM (örn: 34,5kv)
  
  -- Tesis bilgileri ek alanlar
  ADD COLUMN IF NOT EXISTS center_type TEXT, -- MERKEZ TİPİ (Bina, vb.)
  
  -- Endeks/Sayaç okumaları (JSONB - esnek yapı)
  ADD COLUMN IF NOT EXISTS meter_readings JSONB, -- ENDEKS tablosu (İLK ENDEKS, SON ENDEKS, AYA AİT KONT.TÜKETİM)
  
  -- Kontrol oranları
  ADD COLUMN IF NOT EXISTS cos_q_value TEXT, -- COS Q değeri
  ADD COLUMN IF NOT EXISTS cos_q_suitable BOOLEAN, -- COS Q uygun mu?
  ADD COLUMN IF NOT EXISTS inductive_active_ratio TEXT, -- ENDÜKTİF / AKTİF ORAN
  ADD COLUMN IF NOT EXISTS inductive_active_suitable BOOLEAN, -- ENDÜKTİF / AKTİF ORAN uygun mu?
  ADD COLUMN IF NOT EXISTS capacitive_active_ratio TEXT, -- KAPASİTİF / AKTİF ORAN
  ADD COLUMN IF NOT EXISTS capacitive_active_suitable BOOLEAN, -- KAPASİTİF / AKTİF ORAN uygun mu?
  ADD COLUMN IF NOT EXISTS demant_value TEXT, -- DEMANT(1.6.0) değeri
  
  -- Kontrol ve tespitler (JSONB - checklist)
  ADD COLUMN IF NOT EXISTS control_checklist JSONB, -- KONTROL VE TESPİTLER checklist (UYGUN, UYGUN DEĞİL, İLGİLİ DEĞİL, AÇIKLAMA)
  
  -- Topraklama ölçümleri (JSONB)
  ADD COLUMN IF NOT EXISTS grounding_measurements JSONB; -- TOPRAKLAMA ölçümleri (KORUMA, İŞLETME, UYGUN, UYGUN DEĞİL)

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_yegis_forms_installation_number ON yegis_forms(installation_number);
CREATE INDEX IF NOT EXISTS idx_yegis_forms_tm_number ON yegis_forms(tm_number);

