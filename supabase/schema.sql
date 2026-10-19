-- Supabase Database Schema for POS Dashboard
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
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

-- Sales table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale Items table
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for customers
INSERT INTO customers (name, email, phone, address, total_orders, total_spent) VALUES
('John Doe', 'john@example.com', '+1 555-0101', '123 Main St, City', 12, 1250.50),
('Jane Smith', 'jane@example.com', '+1 555-0102', '456 Oak Ave, Town', 8, 890.25),
('Bob Johnson', 'bob@example.com', '+1 555-0103', '789 Pine Rd, Village', 15, 2100.00),
('Alice Brown', 'alice@example.com', '+1 555-0104', '321 Elm St, County', 5, 450.75),
('Charlie Wilson', 'charlie@example.com', '+1 555-0105', '654 Maple Dr, State', 20, 3450.00),
('Diana Miller', 'diana@example.com', '+1 555-0106', '987 Cedar Ln, Region', 3, 225.50),
('Edward Lee', 'edward@example.com', '+1 555-0107', '147 Birch Way, District', 9, 1100.25);

-- Insert sample data for products
INSERT INTO products (name, sku, category, price, cost, stock, min_stock, description) VALUES
('Wireless Headphones', 'WH-001', 'Electronics', 99.99, 45.00, 45, 50, 'Premium wireless headphones with noise cancellation'),
('USB-C Cable 6ft', 'USB-002', 'Accessories', 14.99, 3.50, 234, 100, 'High-speed USB-C charging cable'),
('Phone Case - iPhone 15', 'PC-003', 'Accessories', 24.99, 8.00, 156, 50, 'Protective phone case'),
('Screen Protector', 'SP-004', 'Accessories', 9.99, 2.00, 89, 75, 'Tempered glass screen protector'),
('Bluetooth Speaker', 'BS-005', 'Electronics', 49.99, 22.00, 34, 30, 'Portable Bluetooth speaker'),
('Laptop Stand', 'LS-006', 'Accessories', 39.99, 15.00, 12, 25, 'Adjustable aluminum laptop stand'),
('Webcam HD 1080p', 'WC-007', 'Electronics', 69.99, 35.00, 8, 20, 'Full HD webcam with microphone'),
('Wireless Mouse', 'WM-008', 'Electronics', 29.99, 12.00, 67, 40, 'Ergonomic wireless mouse');

-- Insert sample sales data
INSERT INTO sales (customer_name, subtotal, tax, total, payment_method, status, created_at) VALUES
('John Doe', 125.00, 10.00, 135.00, 'cash', 'completed', NOW() - INTERVAL '2 minutes'),
('Jane Smith', 89.50, 7.16, 96.66, 'card', 'completed', NOW() - INTERVAL '15 minutes'),
('Bob Johnson', 245.00, 19.60, 264.60, 'card', 'pending', NOW() - INTERVAL '32 minutes'),
('Alice Brown', 67.25, 5.38, 72.63, 'cash', 'completed', NOW() - INTERVAL '45 minutes'),
('Charlie Wilson', 198.00, 15.84, 213.84, 'card', 'completed', NOW() - INTERVAL '1 hour'),
('Diana Miller', 156.80, 12.54, 169.34, 'cash', 'cancelled', NOW() - INTERVAL '1 hour'),
('Edward Lee', 78.50, 6.28, 84.78, 'card', 'completed', NOW() - INTERVAL '2 hours');

-- Enable Row Level Security (optional - can be configured based on needs)
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;