import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { initialData } from '@/data/seed';
import { normalizeAppData } from '@/data/normalizeAppData';
import { createSchemaSql, CURRENT_SCHEMA_VERSION } from '@/database/schema';
import { AppData, AppLocale, CatalogPart, CatalogService, CompanyProfile, Customer, DefaultTerms, Equipment, Payment, PdfSettings, PhotoAttachment, SecuritySettings, ServiceOrder, ServiceOrderItem, ServiceOrderPdf, ServiceOrderStatusHistory, SignatureRecord, TechnicianProfile } from '@/types';
import { nowIso } from '@/utils/formatters';

const DATABASE_NAME = 'ordempro.db';
const BACKUP_ID = 'backup_metadata';
const WEB_STORAGE_KEY = '@ordempro/app-data';

type DbRow = Record<string, string | number | null>;

let databasePromise: Promise<SQLiteDatabase> | null = null;

const toNullable = (value?: string | null) => (value && value.trim() ? value : null);
const toBoolean = (value: unknown) => Number(value) === 1;
const toInteger = (value: unknown) => Number(value ?? 0);
const themeModes = new Set<AppData['themeMode']>(['system', 'light', 'dark']);
const locales = new Set<AppLocale>(['pt', 'en', 'fr', 'es']);
const toStringArray = (value: unknown): string[] | undefined => {
  if (!value || typeof value !== 'string') return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

function parseSecuritySettings(value?: string | null): SecuritySettings {
  if (!value) return initialData.security;
  try {
    const parsed = JSON.parse(value) as Partial<SecuritySettings>;
    const hasPin = Boolean(parsed.pinHash && parsed.pinSalt);
    const usesSecureStore = parsed.pinStorage === 'secure_store';
    return {
      isPinEnabled: Boolean(parsed.isPinEnabled && (usesSecureStore || hasPin)),
      pinStorage: usesSecureStore ? 'secure_store' : hasPin ? 'database' : undefined,
      pinHash: hasPin ? parsed.pinHash : undefined,
      pinSalt: hasPin ? parsed.pinSalt : undefined,
      updatedAt: parsed.updatedAt ?? initialData.security.updatedAt,
    };
  } catch {
    return initialData.security;
  }
}

function rowBase<T extends DbRow>(row: T) {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null,
  };
}

async function setMeta(db: SQLiteDatabase, key: string, value: string) {
  await db.runAsync(
    `INSERT OR REPLACE INTO app_meta (key, value, updated_at) VALUES (?, ?, ?)`,
    key,
    value,
    nowIso(),
  );
}

async function isDatabaseEmpty(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ total: number }>(`
    SELECT
      (SELECT COUNT(*) FROM company_profile) +
      (SELECT COUNT(*) FROM customers) +
      (SELECT COUNT(*) FROM equipments) +
      (SELECT COUNT(*) FROM service_orders) AS total
  `);
  return !row || row.total === 0;
}

export async function getDatabase() {
  if (Platform.OS === 'web') throw new Error('SQLite nativo nao e usado no web.');
  databasePromise ??= openDatabaseAsync(DATABASE_NAME);
  const db = await databasePromise;
  await runMigrations(db);
  return db;
}

export async function checkDatabaseIntegrity() {
  if (Platform.OS === 'web') return { ok: true, details: ['Web usa AsyncStorage.'] };
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ integrity_check: string }>('PRAGMA integrity_check');
  const details = rows.map((row) => String(row.integrity_check));
  return {
    ok: details.length > 0 && details.every((detail) => detail.toLowerCase() === 'ok'),
    details: details.length ? details : ['Sem resposta do SQLite.'],
  };
}

async function openDatabaseAsync(name: string) {
  const sqlite = await import('expo-sqlite');
  return sqlite.openDatabaseAsync(name);
}

export async function runMigrations(db: SQLiteDatabase) {
  await db.execAsync(createSchemaSql);
  const versionRow = await db.getFirstAsync<{ value: string }>("SELECT value FROM app_meta WHERE key = 'schema_version'");
  const version = Number(versionRow?.value ?? 0);
  await migrateExistingDatabase(db);
  if (version < CURRENT_SCHEMA_VERSION) {
    await setMeta(db, 'schema_version', String(CURRENT_SCHEMA_VERSION));
  }
  if (version === 0 && await isDatabaseEmpty(db)) {
    await replaceAppData(initialData);
  }
}

async function migrateExistingDatabase(db: SQLiteDatabase) {
  await addColumnIfMissing(db, 'service_orders', 'technician_id', 'TEXT');
  await addColumnIfMissing(db, 'signature_records', 'kind', "TEXT NOT NULL DEFAULT 'customer'");
  await addColumnIfMissing(db, 'service_order_pdfs', 'snapshot_json', 'TEXT');
  await db.execAsync(`
    UPDATE backup_metadata SET last_backup_json = NULL WHERE last_backup_json IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_orders_technician ON service_orders(technician_id);
    CREATE INDEX IF NOT EXISTS idx_signatures_kind ON signature_records(kind);
  `);
}

async function addColumnIfMissing(db: SQLiteDatabase, table: string, column: string, definition: string) {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (columns.some((item) => item.name === column)) return;
  await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

export async function loadAppData(): Promise<AppData> {
  if (Platform.OS === 'web') {
    const stored = await AsyncStorage.getItem(WEB_STORAGE_KEY);
    if (!stored) {
      await AsyncStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    try {
      return normalizeAppData(JSON.parse(stored) as Partial<AppData>, 'demo');
    } catch {
      await AsyncStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
  }

  const db = await getDatabase();
  const [companyRows, pdfRows, termRows, customerRows, equipmentRows, technicianRows, serviceRows, partRows, orderRows, itemRows, paymentRows, photoRows, signatureRows, pdfRecordRows, statusHistoryRows, backupRows, lastOrderRow, themeRow, localeRow, securityRow] = await Promise.all([
    db.getAllAsync<DbRow>('SELECT * FROM company_profile WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 1'),
    db.getAllAsync<DbRow>('SELECT * FROM pdf_settings WHERE deleted_at IS NULL LIMIT 1'),
    db.getAllAsync<DbRow>('SELECT * FROM default_terms WHERE deleted_at IS NULL LIMIT 1'),
    db.getAllAsync<DbRow>('SELECT * FROM customers WHERE deleted_at IS NULL ORDER BY updated_at DESC'),
    db.getAllAsync<DbRow>('SELECT * FROM equipments WHERE deleted_at IS NULL ORDER BY updated_at DESC'),
    db.getAllAsync<DbRow>('SELECT * FROM technician_profiles WHERE deleted_at IS NULL ORDER BY is_default DESC, updated_at DESC'),
    db.getAllAsync<DbRow>('SELECT * FROM service_catalog_items WHERE deleted_at IS NULL ORDER BY updated_at DESC'),
    db.getAllAsync<DbRow>('SELECT * FROM part_catalog_items WHERE deleted_at IS NULL ORDER BY updated_at DESC'),
    db.getAllAsync<DbRow>('SELECT * FROM service_orders WHERE deleted_at IS NULL ORDER BY number DESC'),
    db.getAllAsync<DbRow>('SELECT * FROM service_order_items WHERE deleted_at IS NULL ORDER BY created_at ASC'),
    db.getAllAsync<DbRow>('SELECT * FROM payments WHERE deleted_at IS NULL ORDER BY paid_at DESC'),
    db.getAllAsync<DbRow>('SELECT * FROM photo_attachments WHERE deleted_at IS NULL ORDER BY created_at DESC'),
    db.getAllAsync<DbRow>('SELECT * FROM signature_records WHERE deleted_at IS NULL ORDER BY signed_at DESC'),
    db.getAllAsync<DbRow>('SELECT * FROM service_order_pdfs WHERE deleted_at IS NULL ORDER BY generated_at DESC'),
    db.getAllAsync<DbRow>('SELECT * FROM service_order_status_history WHERE deleted_at IS NULL ORDER BY changed_at DESC'),
    db.getAllAsync<DbRow>('SELECT * FROM backup_metadata LIMIT 1'),
    db.getFirstAsync<{ value: string }>("SELECT value FROM app_meta WHERE key = 'last_order_number'"),
    db.getFirstAsync<{ value: string }>("SELECT value FROM app_meta WHERE key = 'theme_mode'"),
    db.getFirstAsync<{ value: string }>("SELECT value FROM app_meta WHERE key = 'locale'"),
    db.getFirstAsync<{ value: string }>("SELECT value FROM app_meta WHERE key = 'security_settings'"),
  ]);

  return {
    company: companyRows[0] ? mapCompany(companyRows[0]) : null,
    pdfSettings: pdfRows[0] ? mapPdfSettings(pdfRows[0]) : initialData.pdfSettings,
    terms: termRows[0] ? mapTerms(termRows[0]) : initialData.terms,
    customers: customerRows.map(mapCustomer),
    equipments: equipmentRows.map(mapEquipment),
    technicians: technicianRows.map(mapTechnician),
    services: serviceRows.map(mapCatalogService),
    parts: partRows.map(mapCatalogPart),
    orders: orderRows.map(mapOrder),
    items: itemRows.map(mapItem),
    payments: paymentRows.map(mapPayment),
    photos: photoRows.map(mapPhoto),
    signatures: signatureRows.map(mapSignature),
    pdfs: pdfRecordRows.map(mapPdfRecord),
    statusHistory: statusHistoryRows.map(mapStatusHistory),
    backup: {
      lastBackupAt: backupRows[0]?.last_backup_at ? String(backupRows[0].last_backup_at) : null,
      lastBackupJson: null,
    },
    security: parseSecuritySettings(securityRow?.value),
    themeMode: themeModes.has(themeRow?.value as AppData['themeMode']) ? (themeRow?.value as AppData['themeMode']) : initialData.themeMode,
    locale: locales.has(localeRow?.value as AppLocale) ? (localeRow?.value as AppLocale) : initialData.locale,
    lastOrderNumber: Number(lastOrderRow?.value ?? Math.max(0, ...orderRows.map((order) => Number(order.number)))),
  };
}

export async function replaceAppData(data: AppData) {
  const normalizedData = normalizeAppData(data);
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(normalizedData));
    return;
  }

  const db = databasePromise ? await databasePromise : await openDatabaseAsync(DATABASE_NAME);
  databasePromise ??= Promise.resolve(db);
  await db.execAsync(createSchemaSql);
  await migrateExistingDatabase(db);
  await db.withTransactionAsync(async () => {
    await clearWritableTables(db);
    if (normalizedData.company) await insertCompany(db, normalizedData.company);
    await insertPdfSettings(db, normalizedData.pdfSettings);
    await insertTerms(db, normalizedData.terms);
    for (const customer of normalizedData.customers) await insertCustomer(db, customer);
    for (const equipment of normalizedData.equipments) await insertEquipment(db, equipment);
    for (const technician of normalizedData.technicians) await insertTechnician(db, technician);
    for (const service of normalizedData.services) await insertCatalogService(db, service);
    for (const part of normalizedData.parts) await insertCatalogPart(db, part);
    for (const order of normalizedData.orders) await insertOrder(db, order);
    for (const item of normalizedData.items) await insertItem(db, item);
    for (const payment of normalizedData.payments) await insertPayment(db, payment);
    for (const photo of normalizedData.photos) await insertPhoto(db, photo);
    for (const signature of normalizedData.signatures) await insertSignature(db, signature);
    for (const pdf of normalizedData.pdfs) await insertPdfRecord(db, pdf);
    for (const history of normalizedData.statusHistory) await insertStatusHistory(db, history);
    await insertBackup(db, normalizedData.backup.lastBackupAt ?? null, normalizedData.backup.lastBackupJson ?? null);
    await setMeta(db, 'schema_version', String(CURRENT_SCHEMA_VERSION));
    await setMeta(db, 'last_order_number', String(normalizedData.lastOrderNumber));
    await setMeta(db, 'theme_mode', normalizedData.themeMode);
    await setMeta(db, 'locale', normalizedData.locale);
    await setMeta(db, 'security_settings', JSON.stringify(normalizedData.security));
  });
}

async function clearWritableTables(db: SQLiteDatabase) {
  await db.execAsync(`
    DELETE FROM service_order_status_history;
    DELETE FROM service_order_pdfs;
    DELETE FROM signature_records;
    DELETE FROM photo_attachments;
    DELETE FROM payments;
    DELETE FROM service_order_items;
    DELETE FROM service_orders;
    DELETE FROM technician_profiles;
    DELETE FROM part_catalog_items;
    DELETE FROM service_catalog_items;
    DELETE FROM equipments;
    DELETE FROM customers;
    DELETE FROM default_terms;
    DELETE FROM pdf_settings;
    DELETE FROM company_profile;
    DELETE FROM backup_metadata;
  `);
}

async function insertCompany(db: SQLiteDatabase, company: CompanyProfile) {
  await db.runAsync(
    `INSERT INTO company_profile VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    company.id,
    company.name,
    toNullable(company.tradeName),
    toNullable(company.document),
    toNullable(company.responsibleName),
    toNullable(company.phone),
    toNullable(company.whatsapp),
    toNullable(company.email),
    toNullable(company.addressLine),
    toNullable(company.number),
    toNullable(company.neighborhood),
    toNullable(company.city),
    toNullable(company.state),
    toNullable(company.zipCode),
    toNullable(company.logoUri),
    company.isOnboardingCompleted ? 1 : 0,
    company.createdAt,
    company.updatedAt,
    company.deletedAt ?? null,
  );
}

async function insertPdfSettings(db: SQLiteDatabase, settings: PdfSettings) {
  await db.runAsync(
    `INSERT INTO pdf_settings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    settings.id,
    settings.primaryColor,
    settings.documentModel,
    settings.showPhotos ? 1 : 0,
    settings.showSignatures ? 1 : 0,
    settings.showValues ? 1 : 0,
    settings.showAppBranding ? 1 : 0,
    toNullable(settings.footerText),
    settings.createdAt,
    settings.updatedAt,
    settings.deletedAt ?? null,
  );
}

async function insertTerms(db: SQLiteDatabase, terms: DefaultTerms) {
  await db.runAsync(
    `INSERT INTO default_terms VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    terms.id,
    terms.warrantyText,
    terms.serviceAuthorizationText,
    terms.withdrawalText,
    terms.dataResponsibilityText,
    terms.unclaimedEquipmentText,
    terms.createdAt,
    terms.updatedAt,
    terms.deletedAt ?? null,
  );
}

async function insertCustomer(db: SQLiteDatabase, customer: Customer) {
  await db.runAsync(
    `INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    customer.id,
    customer.kind,
    customer.name,
    toNullable(customer.tradeName),
    toNullable(customer.document),
    toNullable(customer.phone),
    toNullable(customer.whatsapp),
    toNullable(customer.email),
    toNullable(customer.addressLine),
    toNullable(customer.city),
    toNullable(customer.state),
    toNullable(customer.notes),
    customer.status,
    customer.createdAt,
    customer.updatedAt,
    customer.deletedAt ?? null,
  );
}

async function insertEquipment(db: SQLiteDatabase, equipment: Equipment) {
  await db.runAsync(
    `INSERT INTO equipments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    equipment.id,
    equipment.customerId,
    equipment.category,
    toNullable(equipment.type),
    toNullable(equipment.description),
    toNullable(equipment.brand),
    toNullable(equipment.model),
    toNullable(equipment.serialNumber),
    toNullable(equipment.patrimonyCode),
    equipment.accessories?.length ? JSON.stringify(equipment.accessories) : null,
    toNullable(equipment.physicalState),
    toNullable(equipment.technicalNotes),
    equipment.status,
    equipment.createdAt,
    equipment.updatedAt,
    equipment.deletedAt ?? null,
  );
}

async function insertTechnician(db: SQLiteDatabase, technician: TechnicianProfile) {
  await db.runAsync(
    `INSERT INTO technician_profiles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    technician.id,
    technician.name,
    toNullable(technician.document),
    toNullable(technician.phone),
    toNullable(technician.email),
    toNullable(technician.role),
    toNullable(technician.signatureUri),
    technician.isDefault ? 1 : 0,
    technician.status,
    technician.createdAt,
    technician.updatedAt,
    technician.deletedAt ?? null,
  );
}

async function insertCatalogService(db: SQLiteDatabase, service: CatalogService) {
  await db.runAsync(
    `INSERT INTO service_catalog_items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    service.id,
    service.name,
    toNullable(service.category),
    service.defaultPriceCents,
    service.defaultWarrantyDays ?? null,
    service.status,
    service.createdAt,
    service.updatedAt,
    service.deletedAt ?? null,
  );
}

async function insertCatalogPart(db: SQLiteDatabase, part: CatalogPart) {
  await db.runAsync(
    `INSERT INTO part_catalog_items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    part.id,
    part.name,
    toNullable(part.category),
    part.salePriceCents,
    part.unit,
    part.status,
    part.createdAt,
    part.updatedAt,
    part.deletedAt ?? null,
  );
}

async function insertOrder(db: SQLiteDatabase, order: ServiceOrder) {
  await db.runAsync(
    `INSERT INTO service_orders (
      id,
      number,
      short_code,
      customer_id,
      equipment_id,
      technician_id,
      is_service_without_equipment,
      opened_at,
      expected_completion_at,
      status,
      priority,
      reported_issue,
      diagnosis,
      performed_service,
      labor_total_cents,
      parts_total_cents,
      other_costs_cents,
      discount_cents,
      subtotal_cents,
      total_cents,
      paid_cents,
      pending_cents,
      warranty_days,
      is_approved_by_customer,
      is_pdf_outdated,
      created_at,
      updated_at,
      deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    order.id,
    order.number,
    order.shortCode,
    order.customerId,
    order.equipmentId ?? null,
    order.technicianId ?? null,
    order.isServiceWithoutEquipment ? 1 : 0,
    order.openedAt,
    order.expectedCompletionAt ?? null,
    order.status,
    order.priority,
    order.reportedIssue,
    toNullable(order.diagnosis),
    toNullable(order.performedService),
    order.laborTotalCents,
    order.partsTotalCents,
    order.otherCostsCents,
    order.discountCents,
    order.subtotalCents,
    order.totalCents,
    order.paidCents,
    order.pendingCents,
    order.warrantyDays ?? null,
    order.isApprovedByCustomer ? 1 : 0,
    order.isPdfOutdated ? 1 : 0,
    order.createdAt,
    order.updatedAt,
    order.deletedAt ?? null,
  );
}

async function insertItem(db: SQLiteDatabase, item: ServiceOrderItem) {
  await db.runAsync(
    `INSERT INTO service_order_items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    item.id,
    item.orderId,
    item.type,
    item.description,
    item.quantity,
    item.unitPriceCents,
    item.discountCents,
    item.totalCents,
    item.createdAt,
    item.updatedAt,
    item.deletedAt ?? null,
  );
}

async function insertPayment(db: SQLiteDatabase, payment: Payment) {
  await db.runAsync(
    `INSERT INTO payments VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    payment.id,
    payment.orderId,
    payment.amountCents,
    payment.method,
    payment.paidAt ?? null,
    payment.createdAt,
    payment.updatedAt,
    payment.deletedAt ?? null,
  );
}

async function insertPhoto(db: SQLiteDatabase, photo: PhotoAttachment) {
  await db.runAsync(
    `INSERT INTO photo_attachments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    photo.id,
    photo.orderId ?? null,
    photo.equipmentId ?? null,
    photo.localUri,
    toNullable(photo.caption),
    photo.includeInPdf ? 1 : 0,
    photo.createdAt,
    photo.updatedAt,
    photo.deletedAt ?? null,
  );
}

async function insertSignature(db: SQLiteDatabase, signature: SignatureRecord) {
  await db.runAsync(
    `INSERT INTO signature_records (
      id,
      order_id,
      kind,
      local_uri,
      signer_name,
      signer_document,
      signed_at,
      created_at,
      updated_at,
      deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    signature.id,
    signature.orderId,
    signature.kind,
    signature.localUri,
    signature.signerName,
    toNullable(signature.signerDocument),
    signature.signedAt,
    signature.createdAt,
    signature.updatedAt,
    signature.deletedAt ?? null,
  );
}

async function insertPdfRecord(db: SQLiteDatabase, pdf: ServiceOrderPdf) {
  await db.runAsync(
    `INSERT INTO service_order_pdfs (
      id,
      order_id,
      version,
      local_uri,
      generated_at,
      total_cents,
      snapshot_json,
      created_at,
      updated_at,
      deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    pdf.id,
    pdf.orderId,
    pdf.version,
    pdf.localUri,
    pdf.generatedAt,
    pdf.totalCents,
    toNullable(pdf.snapshotJson),
    pdf.createdAt,
    pdf.updatedAt,
    pdf.deletedAt ?? null,
  );
}

async function insertStatusHistory(db: SQLiteDatabase, history: ServiceOrderStatusHistory) {
  await db.runAsync(
    `INSERT INTO service_order_status_history VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    history.id,
    history.orderId,
    history.fromStatus ?? null,
    history.toStatus,
    history.changedAt,
    toNullable(history.reason),
    toNullable(history.notes),
    history.createdAt,
    history.updatedAt,
    history.deletedAt ?? null,
  );
}

async function insertBackup(db: SQLiteDatabase, lastBackupAt: string | null, lastBackupJson: string | null) {
  const date = nowIso();
  await db.runAsync(
    `INSERT INTO backup_metadata VALUES (?, ?, ?, ?, ?)`,
    BACKUP_ID,
    lastBackupAt,
    lastBackupJson,
    date,
    date,
  );
}

function mapCompany(row: DbRow): CompanyProfile {
  return {
    ...rowBase(row),
    name: String(row.name),
    tradeName: row.trade_name ? String(row.trade_name) : undefined,
    document: row.document ? String(row.document) : undefined,
    responsibleName: row.responsible_name ? String(row.responsible_name) : undefined,
    phone: row.phone ? String(row.phone) : undefined,
    whatsapp: row.whatsapp ? String(row.whatsapp) : undefined,
    email: row.email ? String(row.email) : undefined,
    addressLine: row.address_line ? String(row.address_line) : undefined,
    number: row.number ? String(row.number) : undefined,
    neighborhood: row.neighborhood ? String(row.neighborhood) : undefined,
    city: row.city ? String(row.city) : undefined,
    state: row.state ? String(row.state) : undefined,
    zipCode: row.zip_code ? String(row.zip_code) : undefined,
    logoUri: row.logo_uri ? String(row.logo_uri) : undefined,
    isOnboardingCompleted: toBoolean(row.is_onboarding_completed),
  };
}

function mapPdfSettings(row: DbRow): PdfSettings {
  return {
    ...rowBase(row),
    primaryColor: String(row.primary_color),
    documentModel: row.document_model as PdfSettings['documentModel'],
    showPhotos: toBoolean(row.show_photos),
    showSignatures: toBoolean(row.show_signatures),
    showValues: toBoolean(row.show_values),
    showAppBranding: toBoolean(row.show_app_branding),
    footerText: row.footer_text ? String(row.footer_text) : undefined,
  };
}

function mapTerms(row: DbRow): DefaultTerms {
  return {
    ...rowBase(row),
    warrantyText: String(row.warranty_text),
    serviceAuthorizationText: String(row.service_authorization_text),
    withdrawalText: String(row.withdrawal_text),
    dataResponsibilityText: String(row.data_responsibility_text),
    unclaimedEquipmentText: String(row.unclaimed_equipment_text),
  };
}

function mapCustomer(row: DbRow): Customer {
  return {
    ...rowBase(row),
    kind: row.kind as Customer['kind'],
    name: String(row.name),
    tradeName: row.trade_name ? String(row.trade_name) : undefined,
    document: row.document ? String(row.document) : undefined,
    phone: row.phone ? String(row.phone) : undefined,
    whatsapp: row.whatsapp ? String(row.whatsapp) : undefined,
    email: row.email ? String(row.email) : undefined,
    addressLine: row.address_line ? String(row.address_line) : undefined,
    city: row.city ? String(row.city) : undefined,
    state: row.state ? String(row.state) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    status: row.status as Customer['status'],
  };
}

function mapEquipment(row: DbRow): Equipment {
  return {
    ...rowBase(row),
    customerId: String(row.customer_id),
    category: row.category as Equipment['category'],
    type: row.type ? String(row.type) : undefined,
    description: row.description ? String(row.description) : undefined,
    brand: row.brand ? String(row.brand) : undefined,
    model: row.model ? String(row.model) : undefined,
    serialNumber: row.serial_number ? String(row.serial_number) : undefined,
    patrimonyCode: row.patrimony_code ? String(row.patrimony_code) : undefined,
    accessories: toStringArray(row.accessories_json),
    physicalState: row.physical_state ? String(row.physical_state) : undefined,
    technicalNotes: row.technical_notes ? String(row.technical_notes) : undefined,
    status: row.status as Equipment['status'],
  };
}

function mapCatalogService(row: DbRow): CatalogService {
  return {
    ...rowBase(row),
    name: String(row.name),
    category: row.category ? String(row.category) : undefined,
    defaultPriceCents: toInteger(row.default_price_cents),
    defaultWarrantyDays: row.default_warranty_days === null ? undefined : toInteger(row.default_warranty_days),
    status: row.status as CatalogService['status'],
  };
}

function mapTechnician(row: DbRow): TechnicianProfile {
  return {
    ...rowBase(row),
    name: String(row.name),
    document: row.document ? String(row.document) : undefined,
    phone: row.phone ? String(row.phone) : undefined,
    email: row.email ? String(row.email) : undefined,
    role: row.role ? String(row.role) : undefined,
    signatureUri: row.signature_uri ? String(row.signature_uri) : undefined,
    isDefault: toBoolean(row.is_default),
    status: row.status as TechnicianProfile['status'],
  };
}

function mapCatalogPart(row: DbRow): CatalogPart {
  return {
    ...rowBase(row),
    name: String(row.name),
    category: row.category ? String(row.category) : undefined,
    salePriceCents: toInteger(row.sale_price_cents),
    unit: row.unit as CatalogPart['unit'],
    status: row.status as CatalogPart['status'],
  };
}

function mapOrder(row: DbRow): ServiceOrder {
  return {
    ...rowBase(row),
    number: toInteger(row.number),
    shortCode: String(row.short_code),
    customerId: String(row.customer_id),
    equipmentId: row.equipment_id ? String(row.equipment_id) : null,
    technicianId: row.technician_id ? String(row.technician_id) : null,
    isServiceWithoutEquipment: toBoolean(row.is_service_without_equipment),
    openedAt: String(row.opened_at),
    expectedCompletionAt: row.expected_completion_at ? String(row.expected_completion_at) : undefined,
    status: row.status as ServiceOrder['status'],
    priority: row.priority as ServiceOrder['priority'],
    reportedIssue: String(row.reported_issue),
    diagnosis: row.diagnosis ? String(row.diagnosis) : undefined,
    performedService: row.performed_service ? String(row.performed_service) : undefined,
    laborTotalCents: toInteger(row.labor_total_cents),
    partsTotalCents: toInteger(row.parts_total_cents),
    otherCostsCents: toInteger(row.other_costs_cents),
    discountCents: toInteger(row.discount_cents),
    subtotalCents: toInteger(row.subtotal_cents),
    totalCents: toInteger(row.total_cents),
    paidCents: toInteger(row.paid_cents),
    pendingCents: toInteger(row.pending_cents),
    warrantyDays: row.warranty_days === null ? undefined : toInteger(row.warranty_days),
    isApprovedByCustomer: toBoolean(row.is_approved_by_customer),
    isPdfOutdated: toBoolean(row.is_pdf_outdated),
  };
}

function mapItem(row: DbRow): ServiceOrderItem {
  return {
    ...rowBase(row),
    orderId: String(row.order_id),
    type: row.type as ServiceOrderItem['type'],
    description: String(row.description),
    quantity: Number(row.quantity),
    unitPriceCents: toInteger(row.unit_price_cents),
    discountCents: toInteger(row.discount_cents),
    totalCents: toInteger(row.total_cents),
  };
}

function mapPayment(row: DbRow): Payment {
  return {
    ...rowBase(row),
    orderId: String(row.order_id),
    amountCents: toInteger(row.amount_cents),
    method: row.method as Payment['method'],
    paidAt: row.paid_at ? String(row.paid_at) : undefined,
  };
}

function mapPhoto(row: DbRow): PhotoAttachment {
  return {
    ...rowBase(row),
    orderId: row.order_id ? String(row.order_id) : undefined,
    equipmentId: row.equipment_id ? String(row.equipment_id) : undefined,
    localUri: String(row.local_uri),
    caption: row.caption ? String(row.caption) : undefined,
    includeInPdf: toBoolean(row.include_in_pdf),
  };
}

function mapSignature(row: DbRow): SignatureRecord {
  return {
    ...rowBase(row),
    orderId: String(row.order_id),
    kind: (row.kind ? String(row.kind) : 'customer') as SignatureRecord['kind'],
    localUri: String(row.local_uri),
    signerName: String(row.signer_name),
    signerDocument: row.signer_document ? String(row.signer_document) : undefined,
    signedAt: String(row.signed_at),
  };
}

function mapPdfRecord(row: DbRow): ServiceOrderPdf {
  return {
    ...rowBase(row),
    orderId: String(row.order_id),
    version: toInteger(row.version),
    localUri: String(row.local_uri),
    generatedAt: String(row.generated_at),
    totalCents: toInteger(row.total_cents),
    snapshotJson: row.snapshot_json ? String(row.snapshot_json) : undefined,
  };
}

function mapStatusHistory(row: DbRow): ServiceOrderStatusHistory {
  return {
    ...rowBase(row),
    orderId: String(row.order_id),
    fromStatus: row.from_status ? (String(row.from_status) as ServiceOrderStatusHistory['fromStatus']) : null,
    toStatus: row.to_status as ServiceOrderStatusHistory['toStatus'],
    changedAt: String(row.changed_at),
    reason: row.reason ? String(row.reason) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
  };
}
