import { createEmptyAppData, initialData } from '@/data/seed';
import { AppData, ThemeMode } from '@/types';

const themeModes: ThemeMode[] = ['system', 'light', 'dark'];

function arrayOrEmpty<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
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
    themeMode,
    lastOrderNumber: Math.max(safeNumber(source.lastOrderNumber), highestOrderNumber),
  };
}
