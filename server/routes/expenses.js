const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, save } = require('../db/database');

const router = express.Router();
const VALID_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

function validateExpense(body, isUpdate = false) {
  const errors = [];
  const { amount, category, date } = body;

  if (!isUpdate || amount !== undefined) {
    if (amount === undefined || amount === null || amount === '') errors.push('Amount is required');
    else if (isNaN(Number(amount)) || Number(amount) <= 0) errors.push('Amount must be a positive number');
  }
  if (!isUpdate || category !== undefined) {
    if (!category) errors.push('Category is required');
    else if (!VALID_CATEGORIES.includes(category)) errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (!isUpdate || date !== undefined) {
    if (!date) errors.push('Date is required');
    else {
      const d = new Date(date);
      const today = new Date(); today.setHours(23, 59, 59, 999);
      if (isNaN(d.getTime())) errors.push('Invalid date format');
      else if (d > today) errors.push('Date cannot be in the future');
    }
  }
  return errors;
}

function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(db, sql, params = []) {
  const rows = queryAll(db, sql, params);
  return rows[0] || null;
}

function run(db, sql, params = []) {
  db.run(sql, params);
}

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { category, startDate, endDate } = req.query;
    let sql = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];
    if (category && category !== 'All') { sql += ' AND category = ?'; params.push(category); }
    if (startDate) { sql += ' AND date >= ?'; params.push(startDate); }
    if (endDate) { sql += ' AND date <= ?'; params.push(endDate); }
    sql += ' ORDER BY date DESC, created_at DESC';
    res.json(queryAll(db, sql, params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/summary
router.get('/summary', async (req, res) => {
  try {
    const db = await getDb();
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const totalRow = queryOne(db, 'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ?', [firstOfMonth, lastOfMonth]);
    const byCategory = queryAll(db, 'SELECT category, COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ? GROUP BY category', [firstOfMonth, lastOfMonth]);
    const highestExpense = queryOne(db, 'SELECT * FROM expenses ORDER BY amount DESC LIMIT 1');

    res.json({ totalThisMonth: totalRow.total, byCategory, highestExpense: highestExpense || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/export
router.get('/export', async (req, res) => {
  try {
    const db = await getDb();
    const { category, startDate, endDate } = req.query;
    let sql = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];
    if (category && category !== 'All') { sql += ' AND category = ?'; params.push(category); }
    if (startDate) { sql += ' AND date >= ?'; params.push(startDate); }
    if (endDate) { sql += ' AND date <= ?'; params.push(endDate); }
    sql += ' ORDER BY date DESC';

    const expenses = queryAll(db, sql, params);
    const headers = ['ID', 'Amount', 'Category', 'Date', 'Note', 'Created At'];
    const rows = expenses.map(e => [e.id, e.amount, e.category, e.date, e.note || '', e.created_at]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const errors = validateExpense(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });

    const db = await getDb();
    const { amount, category, date, note } = req.body;
    const expense = { id: uuidv4(), amount: Number(amount), category, date, note: note || null, created_at: new Date().toISOString() };
    run(db, 'INSERT INTO expenses (id, amount, category, date, note, created_at) VALUES (?, ?, ?, ?, ?, ?)', [expense.id, expense.amount, expense.category, expense.date, expense.note, expense.created_at]);
    save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const existing = queryOne(db, 'SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    const errors = validateExpense(req.body, true);
    if (errors.length > 0) return res.status(400).json({ errors });

    const updated = {
      amount: req.body.amount !== undefined ? Number(req.body.amount) : existing.amount,
      category: req.body.category || existing.category,
      date: req.body.date || existing.date,
      note: req.body.note !== undefined ? req.body.note : existing.note,
    };
    run(db, 'UPDATE expenses SET amount = ?, category = ?, date = ?, note = ? WHERE id = ?', [updated.amount, updated.category, updated.date, updated.note, req.params.id]);
    save();
    res.json({ ...existing, ...updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const existing = queryOne(db, 'SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });
    run(db, 'DELETE FROM expenses WHERE id = ?', [req.params.id]);
    save();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
