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

export function formatDate(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    open: 'Aberta',
    diagnosis: 'Em diagnostico',
    waiting_approval: 'Aguardando aprovacao',
    approved: 'Aprovada',
    in_progress: 'Em execucao',
    waiting_part: 'Aguardando peca',
    completed: 'Concluida',
    delivered: 'Entregue',
    cancelled: 'Cancelada',
  };
  return map[status] ?? status;
}

export function statusColors(status: string) {
  const map: Record<string, { color: string; backgroundColor: string; borderColor: string }> = {
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
  return map[status] ?? { color: '#2563EB', backgroundColor: '#DBEAFE', borderColor: '#93C5FD' };
}
