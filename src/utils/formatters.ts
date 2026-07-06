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

