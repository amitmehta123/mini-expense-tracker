const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.join(', ') || data.error || 'Request failed');
  return data;
}

export const api = {
  getExpenses: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== 'All'))
    ).toString();
    return request(`/expenses${qs ? `?${qs}` : ''}`);
  },
  getSummary: () => request('/expenses/summary'),
  createExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  exportCsv: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== 'All'))
    ).toString();
    return `${BASE_URL}/expenses/export${qs ? `?${qs}` : ''}`;
  },
  getBudgets: () => request('/budgets'),
  setBudget: (category, amount) =>
    request(`/budgets/${category}`, { method: 'PUT', body: JSON.stringify({ amount }) }),
};
