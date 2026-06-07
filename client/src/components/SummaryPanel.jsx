import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, CATEGORY_COLORS } from '../utils/format';
import styles from './SummaryPanel.module.css';

export default function SummaryPanel({ summary, budgets }) {
  if (!summary) return null;

  const { totalThisMonth, byCategory, highestExpense } = summary;

  const budgetMap = Object.fromEntries(budgets.map((b) => [b.category, b.amount]));

  const pieData = byCategory.map((c) => ({
    name: c.category,
    value: c.total,
  }));

  return (
    <div className={styles.panel}>
      <div className={styles.stat}>
        <span className={styles.label}>This Month</span>
        <span className={styles.bigNumber}>{formatCurrency(totalThisMonth)}</span>
      </div>

      {highestExpense && (
        <div className={styles.stat}>
          <span className={styles.label}>Highest Expense</span>
          <span className={styles.value}>{formatCurrency(highestExpense.amount)}</span>
          <span className={styles.sub}>{highestExpense.category} · {highestExpense.date}</span>
        </div>
      )}

      {pieData.length > 0 && (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#888'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => formatCurrency(v)}
                contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className={styles.categories}>
        {byCategory.map((c) => {
          const budget = budgetMap[c.category];
          const pct = budget ? Math.min((c.total / budget) * 100, 100) : null;
          const over = budget && c.total > budget;
          return (
            <div key={c.category} className={styles.catRow}>
              <div className={styles.catTop}>
                <span className={styles.dot} style={{ background: CATEGORY_COLORS[c.category] }} />
                <span className={styles.catName}>{c.category}</span>
                <span className={`${styles.catAmount} ${over ? styles.over : ''}`}>{formatCurrency(c.total)}</span>
              </div>
              {budget && (
                <div className={styles.budgetBar}>
                  <div
                    className={`${styles.budgetFill} ${over ? styles.overFill : ''}`}
                    style={{ width: `${pct}%`, background: over ? 'var(--accent2)' : CATEGORY_COLORS[c.category] }}
                  />
                </div>
              )}
              {budget && (
                <span className={styles.budgetLabel}>
                  {over ? `${formatCurrency(c.total - budget)} over budget` : `${formatCurrency(budget - c.total)} left`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
