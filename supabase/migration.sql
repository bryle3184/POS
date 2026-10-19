-- ============================================================
-- MIGRATION: Add user_id, RLS, and policies to existing POS tables
-- ============================================================
-- Run this if you ALREADY applied the original schema.sql (without user_id)
-- and need to add user-specific data isolation.
--
-- This script is idempotent — safe to run multiple times.

-- Step 1: Add user_id columns to user-owned tables
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Step 2: Add indexes for query performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_user_id ON sale_items(user_id);

-- Step 3: Enable RLS on user-owned tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies (DROP IF EXISTS first to avoid duplicate policy errors)
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
CREATE POLICY "Users can view their own customers"
  ON customers FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
CREATE POLICY "Users can insert their own customers"
  ON customers FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
CREATE POLICY "Users can update their own customers"
  ON customers FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;
CREATE POLICY "Users can delete their own customers"
  ON customers FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
CREATE POLICY "Users can view their own sales"
  ON sales FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own sales" ON sales;
CREATE POLICY "Users can insert their own sales"
  ON sales FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own sales" ON sales;
CREATE POLICY "Users can update their own sales"
  ON sales FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;
CREATE POLICY "Users can delete their own sales"
  ON sales FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own sale_items" ON sale_items;
CREATE POLICY "Users can view their own sale_items"
  ON sale_items FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own sale_items" ON sale_items;
CREATE POLICY "Users can insert their own sale_items"
  ON sale_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own sale_items" ON sale_items;
CREATE POLICY "Users can update their own sale_items"
  ON sale_items FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own sale_items" ON sale_items;
CREATE POLICY "Users can delete their own sale_items"
  ON sale_items FOR DELETE
  USING (user_id = auth.uid());

-- Step 5: Assign existing records to the demo user (demo@pos.com)
-- Only run this if you want to preserve existing data and assign it to the demo account.
-- Otherwise, leave the records unassigned (user_id = NULL) — they'll be invisible.
--
-- UPDATE customers SET user_id = '3e023ff7-751b-4da0-8443-51668c1556f1' WHERE user_id IS NULL;
-- UPDATE sales SET user_id = '3e023ff7-751b-4da0-8443-51668c1556f1' WHERE user_id IS NULL;
-- UPDATE sale_items SET user_id = '3e023ff7-751b-4da0-8443-51668c1556f1' WHERE user_id IS NULL;
