import { useState, useEffect } from 'react';
import { CATEGORIES } from '../utils/format';
import styles from './ExpenseForm.module.css';

const EMPTY_FORM = {
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  note: '',
};

export default function ExpenseForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        amount: initialData.amount,
        category: initialData.category,
        date: initialData.date,
        note: initialData.note || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Enter a positive amount';
    if (!form.category) errs.category = 'Select a category';
    if (!form.date) errs.date = 'Pick a date';
    else if (new Date(form.date) > new Date()) errs.date = 'Date cannot be in the future';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label>Amount (₹) *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={set('amount')}
            className={errors.amount ? styles.invalid : ''}
          />
          {errors.amount && <span className={styles.error}>{errors.amount}</span>}
        </div>
        <div className={styles.field}>
          <label>Category *</label>
          <select value={form.category} onChange={set('category')} className={errors.category ? styles.invalid : ''}>
            <option value="">Select…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <span className={styles.error}>{errors.category}</span>}
        </div>
        <div className={styles.field}>
          <label>Date *</label>
          <input
            type="date"
            value={form.date}
            max={new Date().toISOString().split('T')[0]}
            onChange={set('date')}
            className={errors.date ? styles.invalid : ''}
          />
          {errors.date && <span className={styles.error}>{errors.date}</span>}
        </div>
      </div>
      <div className={styles.field}>
        <label>Note (optional)</label>
        <input type="text" placeholder="What was this for?" value={form.note} onChange={set('note')} maxLength={200} />
      </div>
      {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}
      <div className={styles.actions}>
        {onCancel && <button type="button" className={styles.cancel} onClick={onCancel}>Cancel</button>}
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Saving…' : initialData ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
