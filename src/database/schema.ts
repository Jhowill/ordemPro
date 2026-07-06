export const CURRENT_SCHEMA_VERSION = 1;

export const createSchemaSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS company_profile (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  trade_name TEXT,
  document TEXT,
  responsible_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address_line TEXT,
  number TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  logo_uri TEXT,
  is_onboarding_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS pdf_settings (
  id TEXT PRIMARY KEY NOT NULL,
  primary_color TEXT NOT NULL,
  document_model TEXT NOT NULL,
  show_photos INTEGER NOT NULL,
  show_signatures INTEGER NOT NULL,
  show_values INTEGER NOT NULL,
  show_app_branding INTEGER NOT NULL,
  footer_text TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS default_terms (
  id TEXT PRIMARY KEY NOT NULL,
  warranty_text TEXT NOT NULL,
  service_authorization_text TEXT NOT NULL,
  withdrawal_text TEXT NOT NULL,
  data_responsibility_text TEXT NOT NULL,
  unclaimed_equipment_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  trade_name TEXT,
  document TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address_line TEXT,
  city TEXT,
  state TEXT,
  notes TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS equipments (
  id TEXT PRIMARY KEY NOT NULL,
  customer_id TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT,
  description TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  patrimony_code TEXT,
  accessories_json TEXT,
  physical_state TEXT,
  technical_notes TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS service_catalog_items (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  default_price_cents INTEGER NOT NULL,
  default_warranty_days INTEGER,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS part_catalog_items (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  sale_price_cents INTEGER NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS service_orders (
  id TEXT PRIMARY KEY NOT NULL,
  number INTEGER NOT NULL UNIQUE,
  short_code TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  equipment_id TEXT,
  is_service_without_equipment INTEGER NOT NULL,
  opened_at TEXT NOT NULL,
  expected_completion_at TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  reported_issue TEXT NOT NULL,
  diagnosis TEXT,
  performed_service TEXT,
  labor_total_cents INTEGER NOT NULL,
  parts_total_cents INTEGER NOT NULL,
  other_costs_cents INTEGER NOT NULL,
  discount_cents INTEGER NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  paid_cents INTEGER NOT NULL,
  pending_cents INTEGER NOT NULL,
  warranty_days INTEGER,
  is_approved_by_customer INTEGER NOT NULL,
  is_pdf_outdated INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (equipment_id) REFERENCES equipments(id)
);

CREATE TABLE IF NOT EXISTS service_order_items (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  discount_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (order_id) REFERENCES service_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  method TEXT NOT NULL,
  paid_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (order_id) REFERENCES service_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS photo_attachments (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT,
  equipment_id TEXT,
  local_uri TEXT NOT NULL,
  caption TEXT,
  include_in_pdf INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS signature_records (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  local_uri TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signer_document TEXT,
  signed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (order_id) REFERENCES service_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_order_pdfs (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  local_uri TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  total_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (order_id) REFERENCES service_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_order_status_history (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_at TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (order_id) REFERENCES service_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS backup_metadata (
  id TEXT PRIMARY KEY NOT NULL,
  last_backup_at TEXT,
  last_backup_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_search ON customers(name, phone, whatsapp, document);
CREATE INDEX IF NOT EXISTS idx_equipments_customer ON equipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_equipments_search ON equipments(brand, model, serial_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON service_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_equipment ON service_orders(equipment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON service_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_pdfs_order ON service_order_pdfs(order_id);
`;
