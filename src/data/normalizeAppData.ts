import { createEmptyAppData, initialData } from '@/data/seed';
import { AppData, SecuritySettings, ThemeMode } from '@/types';

const themeModes: ThemeMode[] = ['system', 'light', 'dark'];

function arrayOrEmpty<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeSecurity(value: unknown, fallback: SecuritySettings): SecuritySettings {
  if (!value || typeof value !== 'object') return fallback;
  const source = value as Partial<SecuritySettings>;
  const hasPin = Boolean(source.pinHash && source.pinSalt);
  return {
    isPinEnabled: Boolean(source.isPinEnabled && hasPin),
    pinHash: hasPin ? source.pinHash : undefined,
    pinSalt: hasPin ? source.pinSalt : undefined,
    updatedAt: source.updatedAt ?? fallback.updatedAt,
  };
}

export function normalizeAppData(input?: Partial<AppData> | null, fallback: 'empty' | 'demo' = 'empty'): AppData {
  const base = fallback === 'demo' ? initialData : createEmptyAppData();
  const source = input ?? {};
  const orders = arrayOrEmpty<AppData['orders'][number]>(source.orders);
  const highestOrderNumber = Math.max(0, ...orders.map((order) => safeNumber(order?.number)));
  const themeMode = themeModes.includes(source.themeMode as ThemeMode) ? (source.themeMode as ThemeMode) : base.themeMode;

  return {
    ...base,
    ...source,
    company: source.company ?? base.company,
    pdfSettings: source.pdfSettings ?? base.pdfSettings,
    terms: source.terms ?? base.terms,
    customers: arrayOrEmpty(source.customers),
    equipments: arrayOrEmpty(source.equipments),
    technicians: arrayOrEmpty(source.technicians),
    orders,
    items: arrayOrEmpty(source.items),
    payments: arrayOrEmpty(source.payments),
    photos: arrayOrEmpty(source.photos),
    signatures: arrayOrEmpty(source.signatures),
    pdfs: arrayOrEmpty(source.pdfs),
    statusHistory: arrayOrEmpty(source.statusHistory),
    services: arrayOrEmpty(source.services),
    parts: arrayOrEmpty(source.parts),
    backup: source.backup ?? base.backup,
    security: normalizeSecurity(source.security, base.security),
    themeMode,
    lastOrderNumber: Math.max(safeNumber(source.lastOrderNumber), highestOrderNumber),
  };
}
