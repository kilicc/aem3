-- Services Tablosu için RLS Politikaları
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- Önce mevcut politikaları kontrol edin ve varsa silin
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Users can view active services" ON services;

-- Admin'ler tüm işlemleri yapabilir
CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tüm kullanıcılar aktif hizmetleri görebilir
CREATE POLICY "Users can view active services" ON services
  FOR SELECT USING (is_active = true);

