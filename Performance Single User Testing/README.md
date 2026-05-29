# Website Performance Automation Script

Automatically measures 8 performance parameters via Lighthouse and writes actual times into Google Sheets.

---

## Parameters Measured

| # | Parameter | Tool | Sheet Column |
|---|-----------|------|-------------|
| 1 | Page Load Time (TTI) | Lighthouse | ✅ |
| 2 | First Contentful Paint (FCP) | Lighthouse | ✅ |
| 3 | Largest Contentful Paint (LCP) | Lighthouse | ✅ |
| 4 | Speed Index | Lighthouse | ✅ |
| 5 | Cumulative Layout Shift (CLS) | Lighthouse | ✅ |
| 6 | Total Blocking Time (TBT) | Lighthouse | ✅ |
| 7 | Avg API Response Time | Network Requests | ✅ |
| 8 | API Error Rate | Network Requests | ✅ |

---

## Setup Steps

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Set up Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google Sheets API**
4. Go to **IAM & Admin → Service Accounts → Create Service Account**
5. Download the JSON key → save as `service-account-key.json` in this folder
6. Open your Google Sheet → **Share** it with the service account email (Editor access)

### Step 3 — Edit `config.js`

```js
pages: [
  { name: 'Home Page',   url: 'https://yourwebsite.com/' },
  { name: 'Login Page',  url: 'https://yourwebsite.com/login' },
  // add more pages...
],

googleSheets: {
  enabled: true,
  spreadsheetId: 'YOUR_SHEET_ID',   // from the sheet URL
  sheetName: 'Performance Results',
  serviceAccountKeyFile: './service-account-key.json',
}
```

### Step 4 — Run
```bash
node measure.js
```

---

## Output

**Console** — Live table printed for each page:
```
┌─────────────────────────────────┬────────────────┬────────────────┐
│ Parameter                        │ Actual         │ Rating         │
├─────────────────────────────────┼────────────────┼────────────────┤
│ Page Load Time (TTI)             │ 2.45 s         │ ✅ Ideal       │
│ First Contentful Paint (FCP)     │ 1.23 s         │ ✅ Ideal       │
│ Largest Contentful Paint (LCP)   │ 2.80 s         │ ⚠️ Acceptable  │
│ Speed Index                      │ 3.10 s         │ ⚠️ Acceptable  │
│ Cumulative Layout Shift (CLS)    │ 0.0540         │ ✅ Ideal       │
│ Total Blocking Time (TBT)        │ 120 ms         │ ✅ Ideal       │
│ Avg API Response Time            │ 180 ms         │ ✅ Ideal       │
│ API Error Rate                   │ 0.00%          │ ✅ Ideal       │
└─────────────────────────────────┴────────────────┴────────────────┘
```

**Google Sheet** — Each run appends a new row with actual values + ratings.

**JSON backup** — `report_<timestamp>.json` saved locally after each run.

---

## Ratings (from Parameters sheet)

| Metric | ✅ Ideal | ⚠️ Acceptable | ❌ Poor |
|--------|---------|--------------|--------|
| Page Load Time | < 3s | 3–5s | > 5s |
| FCP | < 1.8s | 1.8–3s | > 3s |
| LCP | < 2.5s | 2.5–4s | > 4s |
| Speed Index | < 3s | 3–5s | > 5s |
| CLS | < 0.1 | 0.1–0.25 | > 0.25 |
| TBT | < 200ms | 200–600ms | > 600ms |
| API Response Time | < 200ms | 200–500ms | > 500ms |
| API Error Rate | < 1% | 1–3% | > 3% |
