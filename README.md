# SpendLess — Mini Expense Tracker

> **Exercise 2** from the Studio Graphene Full Stack Developer Assessment.

A full-stack expense tracking app built with Node.js + Express on the backend and React (Vite) on the frontend. Users can log daily spending across categories, filter by date range or category, and see a live summary of where their money is going — including a pie chart and per-category budget indicators.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | *(deploy to Vercel — see deployment section below)* |
| Backend | *(deploy to Render — see deployment section below)* |

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Backend | Node.js + Express | Lightweight, fast to set up, great ecosystem |
| Database | SQLite via `sql.js` | Zero-config persistence; no separate DB process needed; `sql.js` is pure JS so it works in any Node environment without native compilation |
| Frontend | React + Vite | Fast dev server, modern build tooling, no CRA overhead |
| Charts | Recharts | Composable React charting library, works well with responsive containers |
| Styling | CSS Modules | Scoped styles, no runtime overhead, works natively with Vite |
| Testing | Jest + Supertest | Standard Node testing stack; integration tests hit real Express routes |

---

## How to Run Locally

Assumes you have **Node.js 18+** installed. Clone the repo, then:

```bash
# 1. Install all dependencies
npm install --prefix server
npm install --prefix client

# 2. Start the backend (runs on http://localhost:3001)
npm run dev --prefix server

# 3. In a separate terminal, start the frontend (runs on http://localhost:5173)
npm run dev --prefix client
```

Or, if you install `concurrently` at the root level (`npm install`), you can run both together:

```bash
npm install          # installs concurrently at root
npm run dev          # starts both server and client
```

Open **http://localhost:5173** in your browser.

### Running Tests

```bash
npm test --prefix server
```

---

## API Documentation

All endpoints are prefixed with `/api`.

### Expenses

#### `GET /api/expenses`
Returns a list of expenses, sorted by date descending.

**Query parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category (Food, Transport, Bills, Entertainment, Other). Omit or `All` for no filter. |
| `startDate` | string (YYYY-MM-DD) | Include expenses on or after this date |
| `endDate` | string (YYYY-MM-DD) | Include expenses on or before this date |

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "amount": 250.00,
    "category": "Food",
    "date": "2025-06-01",
    "note": "Lunch",
    "created_at": "2025-06-01T10:30:00.000Z"
  }
]
```

---

#### `GET /api/expenses/summary`
Returns aggregate summary data for the **current calendar month**.

**Response:** `200 OK`
```json
{
  "totalThisMonth": 4200.50,
  "byCategory": [
    { "category": "Food", "total": 1500.00 },
    { "category": "Transport", "total": 800.00 }
  ],
  "highestExpense": { "id": "...", "amount": 1200, "category": "Bills", "date": "2025-06-05", "note": null, "created_at": "..." }
}
```

---

#### `GET /api/expenses/export`
Downloads the current filtered expense list as a CSV file.

**Query parameters:** Same as `GET /api/expenses`.

**Response:** `200 OK` with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="expenses.csv"`.

---

#### `POST /api/expenses`
Creates a new expense.

**Request body:**
```json
{
  "amount": 350,
  "category": "Transport",
  "date": "2025-06-07",
  "note": "Cab to airport"
}
```

**Validation rules:**
- `amount`: required, positive number
- `category`: required, must be one of `Food | Transport | Bills | Entertainment | Other`
- `date`: required, must not be in the future
- `note`: optional string

**Response:** `201 Created` — returns the created expense object.

**Error response:** `400 Bad Request`
```json
{ "errors": ["Amount must be a positive number", "Category is required"] }
```

---

#### `PUT /api/expenses/:id`
Updates an existing expense. All fields are optional (only provided fields are changed).

**Request body:** Same shape as `POST`, all fields optional.

**Response:** `200 OK` — returns the updated expense object.

**Error responses:** `400 Bad Request` (validation), `404 Not Found`.

---

#### `DELETE /api/expenses/:id`
Deletes an expense.

**Response:** `204 No Content`.

**Error response:** `404 Not Found`.

---

### Budgets

#### `GET /api/budgets`
Returns all saved monthly budget limits.

**Response:** `200 OK`
```json
[
  { "category": "Food", "amount": 3000 },
  { "category": "Transport", "amount": 1000 }
]
```

---

#### `PUT /api/budgets/:category`
Sets or updates the budget for a category.

**Request body:**
```json
{ "amount": 3000 }
```

**Response:** `200 OK` — `{ "category": "Food", "amount": 3000 }`.

**Error responses:** `400 Bad Request` if category is invalid or amount is negative.

---

#### `DELETE /api/budgets/:category`
Removes the budget for a category.

**Response:** `204 No Content`.

---

## Project Structure

```
expense-tracker/
├── package.json           # Root — scripts for running both sides together
├── .gitignore
├── README.md
│
├── server/
│   ├── index.js           # Express app setup, middleware, route mounting
│   ├── package.json
│   ├── expenses.test.js   # Jest + Supertest integration tests (8 tests)
│   ├── db/
│   │   └── database.js    # sql.js initialisation, getDb(), save() helpers
│   └── routes/
│       ├── expenses.js    # CRUD + summary + CSV export
│       └── budgets.js     # Budget get/set/delete
│
└── client/
    ├── vite.config.js     # Vite config — proxies /api to localhost:3001 in dev
    ├── package.json
    └── src/
        ├── main.jsx       # React entry point
        ├── App.jsx        # Root component — layout + state wiring
        ├── App.module.css
        ├── index.css      # Global styles, CSS variables, fonts
        ├── components/
        │   ├── ExpenseForm.jsx       # Add / edit form with validation
        │   ├── ExpenseForm.module.css
        │   ├── ExpenseTable.jsx      # Expense list with inline edit + delete confirm
        │   ├── ExpenseTable.module.css
        │   ├── SummaryPanel.jsx      # Monthly totals, pie chart, budget bars
        │   ├── SummaryPanel.module.css
        │   ├── Filters.jsx           # Category + date range filters + CSV export link
        │   ├── Filters.module.css
        │   ├── BudgetModal.jsx       # Set per-category monthly budgets
        │   └── BudgetModal.module.css
        ├── hooks/
        │   └── useExpenses.js        # Central data hook — fetch, mutate, filter state
        └── utils/
            ├── api.js                # Typed fetch wrappers for all API endpoints
            └── format.js             # Currency (INR), date formatting, category constants
```

---

## Deployment

### Frontend → Vercel

1. Push the repo to GitHub.
2. Import the repo in [vercel.com](https://vercel.com). Set **Root Directory** to `client`.
3. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com/api`
4. Deploy.

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com).
2. Set **Root Directory** to `server`, **Build Command** to `npm install`, **Start Command** to `node index.js`.
3. The `expenses.db` file will persist in Render's disk. For production, consider attaching a persistent disk volume.

---

## What Works

- Full CRUD for expenses with client-side + server-side validation
- Filter by category and by date range (this month / last month / last 7 days / all time / custom)
- Monthly summary: total spent, per-category breakdown, highest single expense
- Pie chart of spending by category (Recharts)
- Per-category budget limits with visual progress bar and over-budget warning
- CSV export of the current filtered view
- Delete confirmation modal
- Inline editing (edit row expands into the form)
- SQLite persistence via `sql.js` — survives server restarts
- INR currency formatting via `Intl.NumberFormat`
- Responsive layout (stacks to single column on mobile)
- 8 integration tests covering happy paths and validation errors

## What I Would Build Next

- **Authentication** — right now it's a single-user app with no login; adding JWT auth would make it multi-user
- **Recurring expenses** — many bills repeat monthly; a "recurring" flag with auto-generation would save manual entry
- **Monthly trends** — a bar chart showing total spending per month over the last 6 months
- **Drag-and-drop reorder** — not applicable to expenses (they're date-ordered), but custom categories would benefit
- **PWA / offline mode** — caching the last fetch in a service worker so the app loads offline
- **Code splitting** — the JS bundle is ~518 KB minified; lazy-loading Recharts would reduce initial load
- **End-to-end tests** — Playwright tests covering the full add→view→delete flow in a real browser
