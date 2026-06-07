export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

export const CATEGORY_COLORS = {
  Food: 'var(--food)',
  Transport: 'var(--transport)',
  Bills: 'var(--bills)',
  Entertainment: 'var(--entertainment)',
  Other: 'var(--other)',
};

export function getDateRange(range) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  if (range === 'this_month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    return { startDate: start, endDate: todayStr };
  }
  if (range === 'last_month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
    const end = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
    return { startDate: start, endDate: end };
  }
  if (range === 'last_7') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { startDate: start.toISOString().split('T')[0], endDate: todayStr };
  }
  return {};
}
