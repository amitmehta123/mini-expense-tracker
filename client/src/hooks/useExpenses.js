import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { getDateRange } from '../utils/format';

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    category: 'All',
    dateRange: 'this_month',
    startDate: '',
    endDate: '',
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } =
        filters.dateRange === 'custom'
          ? { startDate: filters.startDate, endDate: filters.endDate }
          : getDateRange(filters.dateRange);

      const [expData, sumData, budgetData] = await Promise.all([
        api.getExpenses({ category: filters.category, startDate, endDate }),
        api.getSummary(),
        api.getBudgets(),
      ]);
      setExpenses(expData);
      setSummary(sumData);
      setBudgets(budgetData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = async (data) => {
    const expense = await api.createExpense(data);
    await fetchExpenses();
    return expense;
  };

  const updateExpense = async (id, data) => {
    await api.updateExpense(id, data);
    await fetchExpenses();
  };

  const deleteExpense = async (id) => {
    await api.deleteExpense(id);
    await fetchExpenses();
  };

  const updateBudget = async (category, amount) => {
    await api.setBudget(category, amount);
    const budgetData = await api.getBudgets();
    setBudgets(budgetData);
  };

  return {
    expenses,
    summary,
    budgets,
    loading,
    error,
    filters,
    setFilters,
    createExpense,
    updateExpense,
    deleteExpense,
    updateBudget,
    refetch: fetchExpenses,
  };
}
