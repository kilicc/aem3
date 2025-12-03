-- Tüm Tabloların RLS (Row Level Security) Özelliklerini Devre Dışı Bırakma
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- Profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Warehouses (Depolar)
ALTER TABLE warehouses DISABLE ROW LEVEL SECURITY;

-- Units (Birimler)
ALTER TABLE units DISABLE ROW LEVEL SECURITY;

-- Product Categories (Ürün Kategorileri)
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;

-- Products/Materials (Ürünler/Malzemeler)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Tools (Araçlar/Gereçler)
ALTER TABLE tools DISABLE ROW LEVEL SECURITY;

-- Warehouse Stock (Depo Stok)
ALTER TABLE warehouse_stock DISABLE ROW LEVEL SECURITY;

-- Tool Assignments (Araç Atamaları)
ALTER TABLE tool_assignments DISABLE ROW LEVEL SECURITY;

-- Customers (Müşteriler)
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Customer Devices (Müşteri Cihazları)
ALTER TABLE customer_devices DISABLE ROW LEVEL SECURITY;

-- Services (Hizmetler)
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Work Orders (İş Emirleri)
ALTER TABLE work_orders DISABLE ROW LEVEL SECURITY;

-- Work Order Materials (İş Emri Malzemeleri)
ALTER TABLE work_order_materials DISABLE ROW LEVEL SECURITY;

-- Invoices (Faturalar)
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- Invoice Items (Fatura Kalemleri)
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;

-- Notifications (Bildirimler)
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Activity Logs (Aktivite Logları)
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- Tüm tabloların RLS durumunu kontrol etmek için:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;

