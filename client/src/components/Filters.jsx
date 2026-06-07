import { CATEGORIES } from '../utils/format';
import styles from './Filters.module.css';

const DATE_RANGES = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_7', label: 'Last 7 Days' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom' },
];

export default function Filters({ filters, setFilters, exportUrl }) {
  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <select value={filters.category} onChange={set('category')}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.dateRange} onChange={set('dateRange')}>
          {DATE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {filters.dateRange === 'custom' && (
        <div className={styles.customDates}>
          <input type="date" value={filters.startDate} onChange={set('startDate')} placeholder="From" />
          <span className={styles.sep}>→</span>
          <input type="date" value={filters.endDate} onChange={set('endDate')} placeholder="To" />
        </div>
      )}

      <a href={exportUrl} className={styles.exportBtn} download="expenses.csv">
        ↓ Export CSV
      </a>
    </div>
  );
}
