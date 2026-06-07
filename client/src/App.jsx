import { useState } from 'react';
import { useExpenses } from './hooks/useExpenses';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import SummaryPanel from './components/SummaryPanel';
import Filters from './components/Filters';
import BudgetModal from './components/BudgetModal';
import { api } from './utils/api';
import { getDateRange } from './utils/format';
import styles from './App.module.css';

export default function App() {
  const {
    expenses, summary, budgets, loading, error,
    filters, setFilters,
    createExpense, updateExpense, deleteExpense, updateBudget,
  } = useExpenses();

  const [showBudgets, setShowBudgets] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const handleCreate = async (data) => {
    await createExpense(data);
    setAddOpen(false);
  };

  const exportParams = filters.dateRange === 'custom'
    ? { category: filters.category, startDate: filters.startDate, endDate: filters.endDate }
    : { category: filters.category, ...getDateRange(filters.dateRange) };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>₹</span>
          <div>
            <h1>Spend<em>Less</em></h1>
            <span className={styles.tagline}>Personal Expense Tracker</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.budgetBtn} onClick={() => setShowBudgets(true)}>
            Set Budgets
          </button>
          <button className={styles.addBtn} onClick={() => setAddOpen((v) => !v)}>
            {addOpen ? '✕ Cancel' : '+ Add Expense'}
          </button>
        </div>
      </header>

      {addOpen && (
        <section className={styles.formSection}>
          <ExpenseForm onSubmit={handleCreate} onCancel={() => setAddOpen(false)} />
        </section>
      )}

      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.card}>
            <Filters filters={filters} setFilters={setFilters} exportUrl={api.exportCsv(exportParams)} />
          </div>

          <div className={styles.card}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>Loading expenses…</span>
              </div>
            ) : error ? (
              <div className={styles.errorMsg}>
                <strong>Error:</strong> {error}
              </div>
            ) : (
              <ExpenseTable expenses={expenses} onUpdate={updateExpense} onDelete={deleteExpense} />
            )}
          </div>
        </main>

        <aside className={styles.aside}>
          {loading ? (
            <div className={`${styles.card} ${styles.loading}`}>
              <div className={styles.spinner} />
            </div>
          ) : (
            <SummaryPanel summary={summary} budgets={budgets} />
          )}
        </aside>
      </div>

      {showBudgets && (
        <BudgetModal
          budgets={budgets}
          onSave={updateBudget}
          onClose={() => setShowBudgets(false)}
        />
      )}
    </div>
  );
}
