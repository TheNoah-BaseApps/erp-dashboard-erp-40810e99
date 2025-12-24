CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'viewer' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  product_name text NOT NULL,
  product_code text NOT NULL UNIQUE,
  product_category text NOT NULL,
  unit text NOT NULL,
  critical_stock_level numeric(15,2) NOT NULL,
  brand text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_code ON products (product_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (product_category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand);

CREATE TABLE IF NOT EXISTS customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  customer_name text NOT NULL,
  customer_code text NOT NULL UNIQUE,
  address text,
  city_or_district text,
  sales_rep text NOT NULL,
  country text,
  region_or_state text,
  telephone_number text,
  email text,
  contact_person text,
  payment_terms_limit numeric(15,2) DEFAULT 0 NOT NULL,
  balance_risk_limit numeric(15,2) DEFAULT 0 NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers (customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_sales_rep ON customers (sales_rep);
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers (city_or_district);
CREATE INDEX IF NOT EXISTS idx_customers_country ON customers (country);

CREATE TABLE IF NOT EXISTS stock_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  product_id uuid NOT NULL,
  part_number text NOT NULL,
  warehouse_location text NOT NULL,
  current_amount numeric(15,2) NOT NULL,
  unit text NOT NULL,
  first_sales_date date,
  expiry_date date,
  consumption_rate numeric(15,2),
  estimated_stock_days numeric(15,2),
  critical_level_days numeric(15,2),
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stock_records_product_id ON stock_records (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_records_warehouse ON stock_records (warehouse_location);
CREATE INDEX IF NOT EXISTS idx_stock_records_part_number_product ON stock_records (part_number, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_records_expiry_date ON stock_records (expiry_date);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  changes jsonb,
  timestamp timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp);