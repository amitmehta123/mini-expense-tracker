import { useState } from 'react';
import { CATEGORIES, formatCurrency } from '../utils/format';
import styles from './BudgetModal.module.css';

export default function BudgetModal({ budgets, onSave, onClose }) {
  const budgetMap = Object.fromEntries(budgets.map((b) => [b.category, b.amount]));
  const [values, setValues] = useState(
    Object.fromEntries(CATEGORIES.map((c) => [c, budgetMap[c] ?? '']))
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const cat of CATEGORIES) {
        const val = values[cat];
        if (val !== '' && !isNaN(Number(val)) && Number(val) >= 0) {
          await onSave(cat, Number(val));
        }
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Monthly Budgets</h2>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>
        <p className={styles.hint}>Set spending limits per category. Leave blank to remove.</p>
        <div className={styles.fields}>
          {CATEGORIES.map((cat) => (
            <div key={cat} className={styles.row}>
              <label>{cat}</label>
              <div className={styles.inputWrap}>
                <span className={styles.prefix}>₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="No limit"
                  value={values[cat]}
                  onChange={(e) => setValues((v) => ({ ...v, [cat]: e.target.value }))}
                />
              </div>
            </div>
          ))}
        </div>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button className={styles.save} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Budgets'}
          </button>
        </div>
      </div>
    </div>
  );
}
