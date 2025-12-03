-- Supabase Veritabanı Şeması
-- Bu dosya Supabase SQL Editor'de çalıştırılmalıdır

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (auth.users ile eşleşir)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Warehouses (Depolar)
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  manager_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Units (Birimler)
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- adet, metre, kilogram, litre, metrekare, metrekup
  symbol TEXT NOT NULL, -- ad, m, kg, L, m², m³
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default units
INSERT INTO units (name, symbol) VALUES 
  ('adet', 'ad'),
  ('metre', 'm'),
  ('kilogram', 'kg'),
  ('litre', 'L'),
  ('metrekare', 'm²'),
  ('metrekup', 'm³')
ON CONFLICT (name) DO NOTHING;

-- Product Categories (Ürün Kategorileri)
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Products/Materials (Ürünler/Malzemeler)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES product_categories(id),
  unit_id UUID REFERENCES units(id) NOT NULL,
  unit_price DECIMAL(10, 2) DEFAULT 0,
  description TEXT,
  barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tools/Equipment (Araçlar/Gereçler)
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  serial_number TEXT UNIQUE,
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Warehouse Stock (Depo Stokları)
CREATE TABLE IF NOT EXISTS warehouse_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_stock_level DECIMAL(10, 2) DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CHECK ((product_id IS NOT NULL AND tool_id IS NULL) OR (product_id IS NULL AND tool_id IS NOT NULL))
);

-- Tool Assignments (Araç Zimmetleri)
CREATE TABLE IF NOT EXISTS tool_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES profiles(id) NOT NULL,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'returned')) DEFAULT 'assigned'
);

-- Customers (Müşteriler)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tax_id TEXT,
  tax_office TEXT,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  district TEXT,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Customer Devices (Müşteri Cihazları)
CREATE TABLE IF NOT EXISTS customer_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  device_type TEXT NOT NULL, -- trafo, pano, ups, vb.
  device_name TEXT NOT NULL,
  serial_number TEXT,
  model TEXT,
  installation_date DATE,
  last_service_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Services (Hizmetler)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  service_form_template JSONB, -- Teknik servis form şablonu
  price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Work Orders (İş Emirleri)
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  customer_device_id UUID REFERENCES customer_devices(id),
  service_id UUID REFERENCES services(id) NOT NULL,
  assigned_to UUID[] DEFAULT ARRAY[]::UUID[], -- Çoklu kullanıcı atama
  priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_address TEXT,
  scheduled_date DATE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  service_form_data JSONB, -- Doldurulmuş teknik servis formu
  work_description TEXT,
  before_photos TEXT[], -- Fotoğraf URL'leri
  after_photos TEXT[],
  employee_signature TEXT, -- Base64 imza
  customer_signature TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Work Order Materials (İş Emri Malzemeleri)
CREATE TABLE IF NOT EXISTS work_order_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Invoices (Faturalar)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  work_order_id UUID REFERENCES work_orders(id),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')) DEFAULT 'draft',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 20.00,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  pdf_url TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Invoice Items (Fatura Kalemleri)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Notifications (Bildirimler)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- whatsapp, email, push
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_type TEXT, -- work_order, invoice, etc.
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Activity Logs (Aktivite Logları)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS (Row Level Security) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Warehouses Policies
CREATE POLICY "Admins can manage warehouses" ON warehouses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view active warehouses" ON warehouses
  FOR SELECT USING (is_active = true);

-- Products Policies
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view products" ON products
  FOR SELECT USING (true);

-- Tools Policies
CREATE POLICY "Admins can manage tools" ON tools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view tools" ON tools
  FOR SELECT USING (true);

-- Work Orders Policies
CREATE POLICY "Users can view assigned work orders" ON work_orders
  FOR SELECT USING (
    auth.uid() = ANY(assigned_to) OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage work orders" ON work_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update assigned work orders" ON work_orders
  FOR UPDATE USING (auth.uid() = ANY(assigned_to));

-- Customers Policies
CREATE POLICY "Admins can manage customers" ON customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view customers" ON customers
  FOR SELECT USING (true);

-- Services Policies
CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view active services" ON services
  FOR SELECT USING (is_active = true);

-- Invoices Policies
CREATE POLICY "Admins can manage invoices" ON invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view invoices" ON invoices
  FOR SELECT USING (true);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions
-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_devices_updated_at BEFORE UPDATE ON customer_devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate work order number
CREATE OR REPLACE FUNCTION generate_work_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  SELECT 'WO-' || year_prefix || '-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1::TEXT, 6, '0')
  INTO new_number
  FROM work_orders
  WHERE order_number LIKE 'WO-' || year_prefix || '-%';
  
  RETURN COALESCE(new_number, 'WO-' || year_prefix || '-000001');
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  SELECT 'INV-' || year_prefix || '-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 9) AS INTEGER)), 0) + 1::TEXT, 6, '0')
  INTO new_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_prefix || '-%';
  
  RETURN COALESCE(new_number, 'INV-' || year_prefix || '-000001');
END;
$$ LANGUAGE plpgsql;
