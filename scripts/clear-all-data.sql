-- ⚠️ DİKKAT: Bu script tüm verileri siler, sadece admin@aem.com.tr kullanıcısı kalır
-- Önce admin kullanıcısının ID'sini bulalım
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Admin kullanıcısının ID'sini al
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@aem.com.tr';

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin kullanıcısı bulunamadı!';
  END IF;

  -- Tüm verileri sil (cascade delete'ler otomatik çalışacak)
  -- Önce child tabloları, sonra parent tabloları sil
  
  -- 1. Araç kullanım logları
  DELETE FROM vehicle_usage_logs;
  
  -- 2. Araç-gereç zimmetleri
  DELETE FROM tool_assignments;
  
  -- 3. Stok hareketleri
  DELETE FROM stock_movements;
  
  -- 4. İş emri malzemeleri
  DELETE FROM work_order_materials;
  
  -- 5. İş emirleri
  DELETE FROM work_orders;
  
  -- 6. Müşteri cihazları
  DELETE FROM customer_devices;
  
  -- 7. Müşteriler
  DELETE FROM customers;
  
  -- 8. Bildirimler
  DELETE FROM notifications;
  
  -- 9. Stok kayıtları
  DELETE FROM stock;
  
  -- 10. Araç-gereçler
  DELETE FROM tools;
  
  -- 11. Ürünler
  DELETE FROM products;
  
  -- 12. Depolar
  DELETE FROM warehouses;
  
  -- 13. Hizmetler (varsayılan hizmeti koruyabiliriz, ama şimdilik silelim)
  DELETE FROM services WHERE name != 'Arıza Bakım ve Malzeme Sipariş Fişi';
  
  -- 14. Kategoriler (varsayılan kategorileri koruyabiliriz)
  -- DELETE FROM product_categories;
  -- DELETE FROM tool_categories;
  
  -- 15. Birimler (varsayılan birimleri koruyabiliriz)
  -- DELETE FROM units;
  
  -- 16. Profiller (admin hariç)
  DELETE FROM profiles WHERE email != 'admin@aem.com.tr';
  
  -- 17. Auth users (admin hariç)
  DELETE FROM auth.users WHERE email != 'admin@aem.com.tr';

  RAISE NOTICE 'Tüm veriler silindi. Admin kullanıcısı korundu: %', admin_user_id;
END $$;

-- Kontrol: Sadece admin kullanıcısı kaldı mı?
SELECT 
  'Profiles' as tablo,
  COUNT(*) as kayit_sayisi
FROM profiles
WHERE email = 'admin@aem.com.tr'
UNION ALL
SELECT 
  'Auth Users' as tablo,
  COUNT(*) as kayit_sayisi
FROM auth.users
WHERE email = 'admin@aem.com.tr';

