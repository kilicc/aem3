-- Ofis / İdari İşleri için İş Emri Desteği
-- Bu dosya Supabase SQL Editor'de çalıştırılmalıdır

-- 1. customer_id'yi nullable yap (Ofis işleri için müşteri gerekmez)
ALTER TABLE work_orders 
  ALTER COLUMN customer_id DROP NOT NULL;

-- 2. İş tipi ekle (müşteri işi mi, ofis işi mi)
ALTER TABLE work_orders 
  ADD COLUMN IF NOT EXISTS work_type TEXT CHECK (work_type IN ('customer', 'office')) DEFAULT 'customer';

-- 3. Ofis işleri için yapılacak iş açıklaması
ALTER TABLE work_orders 
  ADD COLUMN IF NOT EXISTS office_work_description TEXT;

-- 4. Index ekle
CREATE INDEX IF NOT EXISTS idx_work_orders_work_type ON work_orders(work_type);

-- 5. Constraint: Eğer work_type = 'customer' ise customer_id zorunlu olmalı
-- Bu kontrolü uygulama katmanında yapacağız, veritabanı constraint'i çok karmaşık olur

-- 6. RLS politikaları güncelle (gerekirse)
-- Mevcut RLS politikaları zaten customer_id'yi kontrol ediyor olabilir, kontrol edilmeli

