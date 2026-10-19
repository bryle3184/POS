-- Supabase Database Schema for POS Dashboard
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE DEFINITIONS
-- ============================================================

-- Customers table (user-owned)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (shared reference inventory — no user_id)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table (user-owned)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale Items table (user-owned)
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_user_id ON sale_items(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Only user-owned tables get RLS. Products are shared.

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can view their own customers"
  ON customers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own customers"
  ON customers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own customers"
  ON customers FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own customers"
  ON customers FOR DELETE
  USING (user_id = auth.uid());

-- Sales policies
CREATE POLICY "Users can view their own sales"
  ON sales FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sales"
  ON sales FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sales"
  ON sales FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own sales"
  ON sales FOR DELETE
  USING (user_id = auth.uid());

-- Sale Items policies
CREATE POLICY "Users can view their own sale_items"
  ON sale_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sale_items"
  ON sale_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sale_items"
  ON sale_items FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own sale_items"
  ON sale_items FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- SAMPLE DATA (shared products)
-- ============================================================

INSERT INTO products (name, sku, category, price, cost, stock, min_stock, description) VALUES
('Wireless Headphones', 'WH-001', 'Electronics', 99.99, 45.00, 45, 50, 'Premium wireless headphones with noise cancellation'),
('USB-C Cable 6ft', 'USB-002', 'Accessories', 14.99, 3.50, 234, 100, 'High-speed USB-C charging cable'),
('Phone Case - iPhone 15', 'PC-003', 'Accessories', 24.99, 8.00, 156, 50, 'Protective phone case'),
('Screen Protector', 'SP-004', 'Accessories', 9.99, 2.00, 89, 75, 'Tempered glass screen protector'),
('Bluetooth Speaker', 'BS-005', 'Electronics', 49.99, 22.00, 34, 30, 'Portable Bluetooth speaker'),
('Laptop Stand', 'LS-006', 'Accessories', 39.99, 15.00, 12, 25, 'Adjustable aluminum laptop stand'),
('Webcam HD 1080p', 'WC-007', 'Electronics', 69.99, 35.00, 8, 20, 'Full HD webcam with microphone'),
('Wireless Mouse', 'WM-008', 'Electronics', 29.99, 12.00, 67, 40, 'Ergonomic wireless mouse');

-- ============================================================
-- DEMO DATA (per-user — requires demo@pos.com to exist in Auth)
-- ============================================================
-- Run this AFTER creating the demo auth user.
-- Replace 'DEMO_USER_UUID' with the actual UUID from auth.users:
--   SELECT id FROM auth.users WHERE email = 'demo@pos.com';
--
-- Then run:
--
-- Run this section AFTER applying the schema + RLS migration AND creating the demo auth user.
-- The demo user UUID discovered via the app: 3e023ff7-751b-4da0-8443-51668c1556f1

DO $$
DECLARE
  demo_user_id UUID := '3e023ff7-751b-4da0-8443-51668c1556f1';
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = demo_user_id) THEN
    -- Demo customers
    INSERT INTO customers (user_id, name, email, phone, address, total_orders, total_spent) VALUES
      (demo_user_id, 'John Doe', 'john@example.com', '+1 555-0101', '123 Main St, City', 12, 1250.50),
      (demo_user_id, 'Jane Smith', 'jane@example.com', '+1 555-0102', '456 Oak Ave, Town', 8, 890.25),
      (demo_user_id, 'Bob Johnson', 'bob@example.com', '+1 555-0103', '789 Pine Rd, Village', 15, 2100.00),
      (demo_user_id, 'Alice Brown', 'alice@example.com', '+1 555-0104', '321 Elm St, County', 5, 450.75),
      (demo_user_id, 'Charlie Wilson', 'charlie@example.com', '+1 555-0105', '654 Maple Dr, State', 20, 3450.00);

    -- Demo sales (need customer IDs — insert after customers)
    INSERT INTO sales (user_id, customer_name, subtotal, tax, total, payment_method, status, created_at) VALUES
      (demo_user_id, 'John Doe', 125.00, 10.00, 135.00, 'cash', 'completed', NOW() - INTERVAL '2 minutes'),
      (demo_user_id, 'Jane Smith', 89.50, 7.16, 96.66, 'card', 'completed', NOW() - INTERVAL '15 minutes'),
      (demo_user_id, 'Bob Johnson', 245.00, 19.60, 264.60, 'card', 'pending', NOW() - INTERVAL '32 minutes'),
      (demo_user_id, 'Alice Brown', 67.25, 5.38, 72.63, 'cash', 'completed', NOW() - INTERVAL '45 minutes'),
      (demo_user_id, 'Charlie Wilson', 198.00, 15.84, 213.84, 'card', 'completed', NOW() - INTERVAL '1 hour');

    -- Link sale_items to sales using the sale IDs we just inserted
    INSERT INTO sale_items (user_id, sale_id, product_id, product_name, sku, quantity, unit_price, total_price)
    SELECT
      demo_user_id,
      s.id,
      p.id,
      p.name,
      p.sku,
      1,
      p.price,
      p.price
    FROM sales s
    JOIN products p ON p.sku IN ('WH-001', 'USB-002', 'WH-001', 'SP-004', 'BS-005')
    WHERE s.user_id = demo_user_id
    LIMIT 5;

    RAISE NOTICE 'Demo data inserted for user %', demo_user_id;
  ELSE
    RAISE NOTICE 'Demo user (demo@pos.com) not found in auth.users. Create the user first.';
  END IF;
END $$;