const request = require('supertest');
const app = require('./index');

describe('Expenses API', () => {
  let createdId;

  it('POST /api/expenses - creates a valid expense', async () => {
    const res = await request(app).post('/api/expenses').send({
      amount: 250,
      category: 'Food',
      date: '2025-01-15',
      note: 'Lunch',
    });
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(250);
    expect(res.body.category).toBe('Food');
    createdId = res.body.id;
  });

  it('POST /api/expenses - rejects negative amount', async () => {
    const res = await request(app).post('/api/expenses').send({
      amount: -50,
      category: 'Food',
      date: '2025-01-15',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/expenses - rejects missing category', async () => {
    const res = await request(app).post('/api/expenses').send({
      amount: 100,
      date: '2025-01-15',
    });
    expect(res.status).toBe(400);
  });

  it('GET /api/expenses - returns list of expenses', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/expenses/summary - returns summary data', async () => {
    const res = await request(app).get('/api/expenses/summary');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalThisMonth');
    expect(res.body).toHaveProperty('byCategory');
  });

  it('PUT /api/expenses/:id - updates an expense', async () => {
    if (!createdId) return;
    const res = await request(app)
      .put(`/api/expenses/${createdId}`)
      .send({ amount: 300, category: 'Food', date: '2025-01-15' });
    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(300);
  });

  it('DELETE /api/expenses/:id - deletes an expense', async () => {
    if (!createdId) return;
    const res = await request(app).delete(`/api/expenses/${createdId}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/expenses/:id - 404 for missing expense', async () => {
    const res = await request(app).delete('/api/expenses/nonexistent-id');
    expect(res.status).toBe(404);
  });
});
