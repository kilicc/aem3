-- Roller ve Bildirim Sistemi Güncellemeleri
-- Bu dosya Supabase SQL Editor'de çalıştırılmalıdır

-- 1. Profiles tablosundaki role constraint'ini güncelle
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN (
    'depo_sorunlusu',
    'saha_personeli', 
    'saha_sefi',
    'ofis_personeli',
    'ofis_sefi',
    'yonetici',
    'muhasebe_personeli',
    'admin', -- Geriye dönük uyumluluk için
    'user'  -- Geriye dönük uyumluluk için
  ));

-- 2. Notifications tablosuna notification_type ekle (işlem türü için)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_type TEXT;
-- notification_type değerleri: work_order_created, work_order_status_changed, stock_in, stock_out, 
-- invoice_created, material_request, tool_assigned, tool_returned, etc.

-- 3. Notifications tablosuna target_roles ekle (hangi rollere gönderildiği bilgisi)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_roles TEXT[];

-- 4. Yönetici rolündeki kullanıcıların tüm bildirimleri görebilmesi için RLS politikası
DROP POLICY IF EXISTS "Yonetici can view all notifications" ON notifications;
CREATE POLICY "Yonetici can view all notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'yonetici'
    )
  );

-- 5. Mevcut bildirim politikasını güncelle (kullanıcılar kendi bildirimlerini görebilir)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'yonetici'
    )
  );

-- 6. Rollere göre iş emri yetkileri
-- Saha şefi ve yönetici tüm iş emirlerini görebilir
DROP POLICY IF EXISTS "Saha sefi and yonetici can view all work orders" ON work_orders;
CREATE POLICY "Saha sefi and yonetici can view all work orders" ON work_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('saha_sefi', 'yonetici', 'admin')
    )
  );

-- 7. Depo sorumlusu stok işlemlerini yönetebilir
DROP POLICY IF EXISTS "Depo sorunlusu can manage stock" ON warehouse_stock;
CREATE POLICY "Depo sorunlusu can manage stock" ON warehouse_stock
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('depo_sorunlusu', 'yonetici', 'admin')
    )
  );

-- 8. Muhasebe personeli faturaları görebilir ve yönetebilir
DROP POLICY IF EXISTS "Muhasebe personeli can manage invoices" ON invoices;
CREATE POLICY "Muhasebe personeli can manage invoices" ON invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('muhasebe_personeli', 'yonetici', 'admin')
    )
  );

-- 9. Ofis şefi ve yönetici müşterileri yönetebilir
DROP POLICY IF EXISTS "Ofis sefi can manage customers" ON customers;
CREATE POLICY "Ofis sefi can manage customers" ON customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ofis_sefi', 'yonetici', 'admin')
    )
  );

-- 10. Saha personeli kendisine atanan iş emirlerini görebilir ve güncelleyebilir
DROP POLICY IF EXISTS "Saha personeli can view assigned work orders" ON work_orders;
CREATE POLICY "Saha personeli can view assigned work orders" ON work_orders
  FOR SELECT USING (
    auth.uid() = ANY(assigned_to) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('saha_sefi', 'yonetici', 'admin')
    )
  );

DROP POLICY IF EXISTS "Saha personeli can update assigned work orders" ON work_orders;
CREATE POLICY "Saha personeli can update assigned work orders" ON work_orders
  FOR UPDATE USING (
    auth.uid() = ANY(assigned_to) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('saha_sefi', 'yonetici', 'admin')
    )
  );

-- 11. Ofis personeli iş emirlerini oluşturabilir (ofis şefi ve yönetici ile birlikte)
DROP POLICY IF EXISTS "Ofis personeli can create work orders" ON work_orders;
CREATE POLICY "Ofis personeli can create work orders" ON work_orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ofis_personeli', 'ofis_sefi', 'yonetici', 'admin')
    )
  );

