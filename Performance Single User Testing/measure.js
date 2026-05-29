/**
 * Website Performance Automation Script
 * Measures: Page Load Time, FCP, LCP, Speed Index, CLS, TBT, API Response Time, API Error Rate
 * Fills results into Google Sheets
 *
 * Usage:
 *   node measure.js
 *
 * Config: Edit config.js before running
 */

const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const { google } = require('googleapis');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// ─── Load Config ──────────────────────────────────────────────────────────────
const config = require('./config.js');

// ─── Performance Thresholds (from Parameters sheet) ───────────────────────────
const THRESHOLDS = {
  pageLoadTime:    { ideal: 3000,  acceptable: 5000  },  // ms
  fcp:             { ideal: 1800,  acceptable: 3000  },  // ms
  lcp:             { ideal: 2500,  acceptable: 4000  },  // ms
  speedIndex:      { ideal: 3000,  acceptable: 5000  },  // ms
  cls:             { ideal: 0.1,   acceptable: 0.25  },  // score
  tbt:             { ideal: 200,   acceptable: 600   },  // ms
  apiResponseTime: { ideal: 200,   acceptable: 500   },  // ms
  apiErrorRate:    { ideal: 1,     acceptable: 3     },  // %
};

// ─── Rating Helper ────────────────────────────────────────────────────────────
function getRating(metric, value) {
  const t = THRESHOLDS[metric];
  if (!t || value === null || value === undefined) return '–';
  if (value <= t.ideal) return '✅ Ideal';
  if (value <= t.acceptable) return '⚠️ Acceptable';
  return '❌ Poor';
}

// ─── Format Values for Sheet ──────────────────────────────────────────────────
function fmt(value, unit = '') {
  if (value === null || value === undefined) return 'N/A';
  if (unit === 'ms') return `${Math.round(value)} ms`;
  if (unit === 's')  return `${(value / 1000).toFixed(2)} s`;
  if (unit === '%')  return `${value.toFixed(2)}%`;
  return String(value);
}

// ─── Run Lighthouse on a Single URL ───────────────────────────────────────────
async function runLighthouse(url) {
  console.log(`\n🔍 Auditing: ${url}`);

  // Pre-create a stable Chrome profile dir to avoid Windows EPERM on Temp cleanup
  const userDataDir = path.join(__dirname, '.chrome-profile');
  fs.mkdirSync(userDataDir, { recursive: true });

  const chrome = await chromeLauncher.launch({
    chromePath: config.chromePath,
    userDataDir,
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  let result;
  try {
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
      formFactor: 'desktop',
      throttling: {
        rttMs: 0,
        throughputKbps: 0,
        cpuSlowdownMultiplier: 1,
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
    });

    const audits = runnerResult.lhr.audits;
    const networkRequests = audits['network-requests']?.details?.items || [];

    // ── Core Metrics ──
    const fcp          = audits['first-contentful-paint']?.numericValue;
    const lcp          = audits['largest-contentful-paint']?.numericValue;
    const speedIndex   = audits['speed-index']?.numericValue;
    const cls          = audits['cumulative-layout-shift']?.numericValue;
    const tbt          = audits['total-blocking-time']?.numericValue;
    const pageLoadTime = audits['interactive']?.numericValue; // Time to Interactive ≈ full load

    // ── API Metrics from Network Requests ──
    const apiRequests = networkRequests.filter(r =>
      r.resourceType === 'Fetch' || r.resourceType === 'XHR'
    );

    const totalAPIs   = apiRequests.length;
    const failedAPIs  = apiRequests.filter(r => r.statusCode >= 400).length;
    const apiErrorRate = totalAPIs > 0 ? (failedAPIs / totalAPIs) * 100 : 0;

    const apiTimes = apiRequests
      .map(r => r.endTime - r.startTime)
      .filter(t => t > 0);
    const avgAPIResponse = apiTimes.length > 0
      ? apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length
      : null;

    result = {
      url,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      pageLoadTime,
      fcp,
      lcp,
      speedIndex,
      cls,
      tbt,
      apiResponseTime: avgAPIResponse,
      apiErrorRate,
      totalAPIRequests: totalAPIs,
      failedAPIRequests: failedAPIs,
    };

    // ── Console Summary ──
    console.log(`\n  📊 Results for: ${url}`);
    console.log(`  ┌─────────────────────────────────┬────────────────┬────────────────┐`);
    console.log(`  │ Parameter                        │ Actual         │ Rating         │`);
    console.log(`  ├─────────────────────────────────┼────────────────┼────────────────┤`);
    console.log(`  │ Page Load Time (TTI)             │ ${fmt(pageLoadTime,'s').padEnd(14)} │ ${getRating('pageLoadTime', pageLoadTime).padEnd(14)} │`);
    console.log(`  │ First Contentful Paint (FCP)     │ ${fmt(fcp,'s').padEnd(14)} │ ${getRating('fcp', fcp).padEnd(14)} │`);
    console.log(`  │ Largest Contentful Paint (LCP)   │ ${fmt(lcp,'s').padEnd(14)} │ ${getRating('lcp', lcp).padEnd(14)} │`);
    console.log(`  │ Speed Index                      │ ${fmt(speedIndex,'s').padEnd(14)} │ ${getRating('speedIndex', speedIndex).padEnd(14)} │`);
    console.log(`  │ Cumulative Layout Shift (CLS)    │ ${String(cls?.toFixed(4) ?? 'N/A').padEnd(14)} │ ${getRating('cls', cls).padEnd(14)} │`);
    console.log(`  │ Total Blocking Time (TBT)        │ ${fmt(tbt,'ms').padEnd(14)} │ ${getRating('tbt', tbt).padEnd(14)} │`);
    console.log(`  │ Avg API Response Time            │ ${fmt(avgAPIResponse,'ms').padEnd(14)} │ ${getRating('apiResponseTime', avgAPIResponse).padEnd(14)} │`);
    console.log(`  │ API Error Rate                   │ ${fmt(apiErrorRate,'%').padEnd(14)} │ ${getRating('apiErrorRate', apiErrorRate).padEnd(14)} │`);
    console.log(`  └─────────────────────────────────┴────────────────┴────────────────┘`);

  } finally {
    await chrome.kill();
  }

  return result;
}

// ─── Write to Google Sheets ───────────────────────────────────────────────────
async function writeToGoogleSheets(allResults) {
  if (!config.googleSheets.enabled) {
    console.log('\n📋 Google Sheets disabled. Skipping upload.');
    return;
  }

  console.log('\n📤 Writing results to Google Sheets...');

  const auth = new google.auth.GoogleAuth({
    keyFile: config.googleSheets.serviceAccountKeyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = config.googleSheets.spreadsheetId;
  const sheetName = config.googleSheets.sheetName;

  // ── Write Header Row (only if sheet is empty) ──
  const headerCheck = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1`,
  });

  const isEmpty = !headerCheck.data.values || headerCheck.data.values.length === 0;

  if (isEmpty) {
    const headers = [
      ['Sr. No.', 'Page Name', 'URL', 'Test Date & Time',
       'Page Load Time (TTI)', 'PLT Rating',
       'FCP', 'FCP Rating',
       'LCP', 'LCP Rating',
       'Speed Index', 'SI Rating',
       'CLS', 'CLS Rating',
       'TBT', 'TBT Rating',
       'Avg API Response Time', 'API RT Rating',
       'API Error Rate', 'API ER Rating',
       'Total API Requests', 'Failed API Requests'],
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: headers },
    });
  }

  // ── Append Data Rows ──
  const rows = allResults.map((r, i) => [
    i + 1,
    r.pageName || '',
    r.url,
    r.timestamp,
    r.pageLoadTime ? (r.pageLoadTime / 1000).toFixed(2) + ' s' : 'N/A',
    getRating('pageLoadTime', r.pageLoadTime),
    r.fcp ? (r.fcp / 1000).toFixed(2) + ' s' : 'N/A',
    getRating('fcp', r.fcp),
    r.lcp ? (r.lcp / 1000).toFixed(2) + ' s' : 'N/A',
    getRating('lcp', r.lcp),
    r.speedIndex ? (r.speedIndex / 1000).toFixed(2) + ' s' : 'N/A',
    getRating('speedIndex', r.speedIndex),
    r.cls !== null ? r.cls.toFixed(4) : 'N/A',
    getRating('cls', r.cls),
    r.tbt !== null ? Math.round(r.tbt) + ' ms' : 'N/A',
    getRating('tbt', r.tbt),
    r.apiResponseTime !== null ? Math.round(r.apiResponseTime) + ' ms' : 'N/A',
    getRating('apiResponseTime', r.apiResponseTime),
    r.apiErrorRate !== null ? r.apiErrorRate.toFixed(2) + '%' : 'N/A',
    getRating('apiErrorRate', r.apiErrorRate),
    r.totalAPIRequests ?? 'N/A',
    r.failedAPIRequests ?? 'N/A',
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });

  console.log(`✅ ${rows.length} row(s) written to sheet "${sheetName}"`);
  console.log(`🔗 Sheet URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
}

// ─── Save JSON Report ─────────────────────────────────────────────────────────
function saveJSONReport(allResults) {
  const reportPath = path.join(__dirname, `report_${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2));
  console.log(`\n💾 JSON report saved: ${reportPath}`);
}

// ─── Cell fill helpers ────────────────────────────────────────────────────────
const FILL_GREEN  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
const FILL_YELLOW = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFBF00' } };
const FILL_RED    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };

function cellFill(metric, value) {
  const t = THRESHOLDS[metric];
  if (!t || value === null || value === undefined) return null;
  if (value <= t.ideal)      return FILL_GREEN;
  if (value <= t.acceptable) return FILL_YELLOW;
  return FILL_RED;
}

// ─── Save Excel Report ────────────────────────────────────────────────────────
async function saveExcelReport(allResults) {
  const workbook  = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Performance Report');

  // ── Header style ──
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
  const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

  const columns = [
    { header: 'Sr. No.',               key: 'srNo',            width: 8  },
    { header: 'Page Name',             key: 'pageName',        width: 28 },
    { header: 'URL',                   key: 'url',             width: 45 },
    { header: 'Test Date & Time',      key: 'timestamp',       width: 22 },
    { header: 'Page Load Time (TTI)',  key: 'pageLoadTime',    width: 22 },
    { header: 'FCP',                   key: 'fcp',             width: 14 },
    { header: 'LCP',                   key: 'lcp',             width: 14 },
    { header: 'Speed Index',           key: 'speedIndex',      width: 16 },
    { header: 'CLS',                   key: 'cls',             width: 12 },
    { header: 'TBT',                   key: 'tbt',             width: 14 },
    { header: 'Avg API Response Time', key: 'apiResponseTime', width: 24 },
    { header: 'API Error Rate',        key: 'apiErrorRate',    width: 16 },
    { header: 'Total API Requests',    key: 'totalAPIRequests',  width: 20 },
    { header: 'Failed API Requests',   key: 'failedAPIRequests', width: 20 },
  ];

  worksheet.columns = columns;

  // Apply header styles
  worksheet.getRow(1).eachCell(cell => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  worksheet.getRow(1).height = 30;

  // ── Data rows ──
  allResults.forEach((r, i) => {
    const row = worksheet.addRow({
      srNo:             i + 1,
      pageName:         r.pageName || '',
      url:              r.url,
      timestamp:        r.timestamp,
      pageLoadTime:     r.pageLoadTime != null ? `${(r.pageLoadTime / 1000).toFixed(2)} s` : 'N/A',
      fcp:              r.fcp != null ? `${(r.fcp / 1000).toFixed(2)} s` : 'N/A',
      lcp:              r.lcp != null ? `${(r.lcp / 1000).toFixed(2)} s` : 'N/A',
      speedIndex:       r.speedIndex != null ? `${(r.speedIndex / 1000).toFixed(2)} s` : 'N/A',
      cls:              r.cls != null ? r.cls.toFixed(4) : 'N/A',
      tbt:              r.tbt != null ? `${Math.round(r.tbt)} ms` : 'N/A',
      apiResponseTime:  r.apiResponseTime != null ? `${Math.round(r.apiResponseTime)} ms` : 'N/A',
      apiErrorRate:     r.apiErrorRate != null ? `${r.apiErrorRate.toFixed(2)}%` : 'N/A',
      totalAPIRequests: r.totalAPIRequests ?? 'N/A',
      failedAPIRequests: r.failedAPIRequests ?? 'N/A',
    });

    // Color-code metric cells
    const metricMap = {
      pageLoadTime:    'pageLoadTime',
      fcp:             'fcp',
      lcp:             'lcp',
      speedIndex:      'speedIndex',
      cls:             'cls',
      tbt:             'tbt',
      apiResponseTime: 'apiResponseTime',
      apiErrorRate:    'apiErrorRate',
    };

    row.eachCell((cell, colNumber) => {
      const colKey = columns[colNumber - 1]?.key;
      const metricKey = metricMap[colKey];
      const fill = metricKey ? cellFill(metricKey, r[metricKey === 'apiResponseTime' ? 'apiResponseTime' : metricKey]) : null;
      if (fill) cell.fill = fill;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    row.height = 20;
  });

  // ── Legend row ──
  worksheet.addRow([]);
  const legendRow = worksheet.addRow(['Legend:', '✅ Green = Ideal', '⚠️ Yellow = Acceptable', '❌ Red = Poor']);
  legendRow.getCell(2).fill = FILL_GREEN;
  legendRow.getCell(3).fill = FILL_YELLOW;
  legendRow.getCell(4).fill = FILL_RED;
  legendRow.eachCell(cell => { cell.font = { bold: true }; });

  const reportPath = path.join(__dirname, `perf_report_${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(reportPath);
  console.log(`\n📊 Excel report saved: ${reportPath}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║        Website Performance Automation Script             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n⚙️  Testing ${config.pages.length} page(s)...\n`);

  const allResults = [];

  for (const page of config.pages) {
    try {
      const result = await runLighthouse(page.url);
      result.pageName = page.name;
      allResults.push(result);
    } catch (err) {
      console.error(`❌ Error testing ${page.url}:`, err.message);
      allResults.push({
        url: page.url,
        pageName: page.name,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        error: err.message,
      });
    }
  }

  // Write to Google Sheets
  await writeToGoogleSheets(allResults);

  // Save Excel report with color-coded cells
  await saveExcelReport(allResults);

  // Always save a local JSON backup
  saveJSONReport(allResults);

  console.log('\n✅ All done!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
