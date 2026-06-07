const express = require('express');
const { getDb, save } = require('../db/database');

const router = express.Router();
const VALID_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    res.json(queryAll(db, 'SELECT * FROM budgets'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { amount } = req.body;
    if (!VALID_CATEGORIES.includes(category)) return res.status(400).json({ error: 'Invalid category' });
    if (amount === undefined || isNaN(Number(amount)) || Number(amount) < 0) return res.status(400).json({ error: 'Amount must be a non-negative number' });
    const db = await getDb();
    db.run('INSERT OR REPLACE INTO budgets (category, amount) VALUES (?, ?)', [category, Number(amount)]);
    save();
    res.json({ category, amount: Number(amount) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:category', async (req, res) => {
  try {
    const db = await getDb();
    db.run('DELETE FROM budgets WHERE category = ?', [req.params.category]);
    save();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
