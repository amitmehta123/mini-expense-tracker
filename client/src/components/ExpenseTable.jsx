import { useState } from 'react';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/format';
import ExpenseForm from './ExpenseForm';
import styles from './ExpenseTable.module.css';

export default function ExpenseTable({ expenses, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    await onDelete(id);
    setDeletingId(null);
  };

  if (expenses.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>₹</div>
        <p>No expenses found</p>
        <span>Add your first expense above</span>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {deletingId && (
        <div className={styles.overlay} onClick={() => setDeletingId(null)}>
          <div className={styles.confirm} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Expense?</h3>
            <p>This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeletingId(null)}>Cancel</button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(deletingId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Note</th>
            <th className={styles.right}>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) =>
            editingId === expense.id ? (
              <tr key={expense.id} className={styles.editRow}>
                <td colSpan={5}>
                  <ExpenseForm
                    initialData={expense}
                    onSubmit={async (data) => { await onUpdate(expense.id, data); setEditingId(null); }}
                    onCancel={() => setEditingId(null)}
                  />
                </td>
              </tr>
            ) : (
              <tr key={expense.id} className={styles.row}>
                <td className={styles.date}>{formatDate(expense.date)}</td>
                <td>
                  <span className={styles.badge} style={{ '--cat-color': CATEGORY_COLORS[expense.category] }}>
                    {expense.category}
                  </span>
                </td>
                <td className={styles.note}>{expense.note || <span className={styles.empty2}>—</span>}</td>
                <td className={`${styles.amount} ${styles.right}`}>{formatCurrency(expense.amount)}</td>
                <td className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => setEditingId(expense.id)} title="Edit">✎</button>
                  <button className={styles.delBtn} onClick={() => setDeletingId(expense.id)} title="Delete">✕</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
