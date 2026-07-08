import { getLocaleIntl, getStatusLabel } from '@/i18n/translations';
import type { AppLocale, ServiceOrderStatus } from '@/types';

export function makeId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function moneyFromText(value: string) {
  const digits = value.replace(/\D/g, '');
  return Number(digits || 0);
}

export function formatMoneyInput(value: string) {
  const cents = moneyFromText(value);
  return formatMoney(cents);
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCpfCnpjInput(value: string) {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
}

export function formatPhoneInput(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d)/, '($1) $2');
  if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d)/, '($1) $2-$3');
  return digits.replace(/^(\d{2})(\d{5})(\d)/, '($1) $2-$3');
}

export function formatDate(value?: string, locale: AppLocale = 'pt') {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat(getLocaleIntl(locale)).format(date);
}

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function statusLabel(status: ServiceOrderStatus, locale: AppLocale = 'pt') {
  return getStatusLabel(status, locale);
}

export function statusColors(status: ServiceOrderStatus, isDarkTheme = false) {
  const lightMap: Record<ServiceOrderStatus, { color: string; backgroundColor: string; borderColor: string }> = {
    open: { color: '#2563EB', backgroundColor: '#DBEAFE', borderColor: '#93C5FD' },
    diagnosis: { color: '#7C3AED', backgroundColor: '#EDE9FE', borderColor: '#C4B5FD' },
    waiting_approval: { color: '#D97706', backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
    approved: { color: '#059669', backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' },
    in_progress: { color: '#0891B2', backgroundColor: '#CFFAFE', borderColor: '#67E8F9' },
    waiting_part: { color: '#C2410C', backgroundColor: '#FFEDD5', borderColor: '#FDBA74' },
    completed: { color: '#16A34A', backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
    delivered: { color: '#0F766E', backgroundColor: '#CCFBF1', borderColor: '#5EEAD4' },
    cancelled: { color: '#DC2626', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  };
  const darkMap: Record<ServiceOrderStatus, { color: string; backgroundColor: string; borderColor: string }> = {
    open: { color: '#93C5FD', backgroundColor: 'rgba(37, 99, 235, 0.18)', borderColor: 'rgba(147, 197, 253, 0.42)' },
    diagnosis: { color: '#C4B5FD', backgroundColor: 'rgba(124, 58, 237, 0.18)', borderColor: 'rgba(196, 181, 253, 0.42)' },
    waiting_approval: { color: '#FCD34D', backgroundColor: 'rgba(217, 119, 6, 0.18)', borderColor: 'rgba(252, 211, 77, 0.42)' },
    approved: { color: '#6EE7B7', backgroundColor: 'rgba(5, 150, 105, 0.18)', borderColor: 'rgba(110, 231, 183, 0.42)' },
    in_progress: { color: '#67E8F9', backgroundColor: 'rgba(8, 145, 178, 0.18)', borderColor: 'rgba(103, 232, 249, 0.42)' },
    waiting_part: { color: '#FDBA74', backgroundColor: 'rgba(194, 65, 12, 0.18)', borderColor: 'rgba(253, 186, 116, 0.42)' },
    completed: { color: '#86EFAC', backgroundColor: 'rgba(22, 163, 74, 0.18)', borderColor: 'rgba(134, 239, 172, 0.42)' },
    delivered: { color: '#5EEAD4', backgroundColor: 'rgba(15, 118, 110, 0.18)', borderColor: 'rgba(94, 234, 212, 0.42)' },
    cancelled: { color: '#FCA5A5', backgroundColor: 'rgba(220, 38, 38, 0.18)', borderColor: 'rgba(252, 165, 165, 0.42)' },
  };
  const map = isDarkTheme ? darkMap : lightMap;
  return map[status] ?? map.open;
}
