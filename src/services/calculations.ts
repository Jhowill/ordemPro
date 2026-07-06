import { Payment, ServiceOrderItem } from '@/types';

export function calculateItemTotal(quantity: number, unitPriceCents: number, discountCents = 0) {
  return Math.max(0, Math.round(quantity * unitPriceCents) - discountCents);
}

export function calculateOrderTotals(items: ServiceOrderItem[], payments: Payment[], discountCents = 0) {
  const activeItems = items.filter((item) => !item.deletedAt);
  const laborTotalCents = activeItems
    .filter((item) => item.type === 'service')
    .reduce((sum, item) => sum + item.totalCents, 0);
  const partsTotalCents = activeItems
    .filter((item) => item.type === 'part')
    .reduce((sum, item) => sum + item.totalCents, 0);
  const otherCostsCents = activeItems
    .filter((item) => item.type === 'other_cost')
    .reduce((sum, item) => sum + item.totalCents, 0);
  const subtotalCents = laborTotalCents + partsTotalCents + otherCostsCents;
  const totalCents = Math.max(0, subtotalCents - discountCents);
  const paidCents = payments.filter((payment) => !payment.deletedAt).reduce((sum, payment) => sum + payment.amountCents, 0);
  const pendingCents = Math.max(0, totalCents - paidCents);

  return {
    laborTotalCents,
    partsTotalCents,
    otherCostsCents,
    discountCents,
    subtotalCents,
    totalCents,
    paidCents,
    pendingCents,
  };
}

