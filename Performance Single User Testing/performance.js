/**
 * Performance Automation Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Metrics measured (per Parameters sheet):
 *   Page Load Time | FCP | LCP | Speed Index | CLS | TBT
 *
 * Auth: OAuth2 via GOOGLE_REFRESH_TOKEN (no service-account key file needed)
 *
 * Usage:
 *   node performance.js
 *
 * Requires .env with:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI,
 *   GOOGLE_REFRESH_TOKEN, SHEET_ID
 */

require('dotenv').config();

const { default: lighthouse } = require('lighthouse');
const chromeLauncher             = require('chrome-launcher');
const { google }                 = require('googleapis');
const fs                         = require('fs');
const path                       = require('path');
const config                     = require('./config.js');

// ─── Validate required env vars ───────────────────────────────────────────────
const REQUIRED_ENV = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'GOOGLE_REFRESH_TOKEN',
  'SHEET_ID',
];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  console.error('Please add them to your .env file and retry.');
  process.exit(1);
}

// ─── OAuth2 Client (refresh-token based) ─────────────────────────────────────
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

// ─── Thresholds (from Parameters sheet) ──────────────────────────────────────
const THRESHOLDS = {
  pageLoadTime: { ideal: 3000, acceptable: 5000 },  // ms — < 3s / 3–5s / > 5s
  fcp:          { ideal: 1800, acceptable: 3000 },  // ms — < 1.8s / 1.8–3s / > 3s
  lcp:          { ideal: 2500, acceptable: 4000 },  // ms — < 2.5s / 2.5–4s / > 4s
  speedIndex:   { ideal: 3000, acceptable: 5000 },  // ms — < 3s / 3–5s / > 5s
  cls:          { ideal: 0.1,  acceptable: 0.25  }, // score — < 0.1 / 0.1–0.25 / > 0.25
  tbt:          { ideal: 200,  acceptable: 600   },  // ms — < 200ms / 200–600ms / > 600ms
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRating(metric, value) {
  const t = THRESHOLDS[metric];
  if (!t || value === null || value === undefined) return '–';
  if (value <= t.ideal)      return 'Ideal';
  if (value <= t.acceptable) return 'Acceptable';
  return 'Poor';
}

function toSeconds(ms) {
  if (ms === null || ms === undefined) return 'N/A';
  return `${(ms / 1000).toFixed(2)} s`;
}

function toMs(ms) {
  if (ms === null || ms === undefined) return 'N/A';
  return `${Math.round(ms)} ms`;
}

function toCLS(val) {
  if (val === null || val === undefined) return 'N/A';
  return val.toFixed(4);
}

function now() {
  return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

// ─── Run Lighthouse ───────────────────────────────────────────────────────────
async function runLighthouse(url) {
  console.log(`\nAuditing: ${url}`);

  const isWindows = process.platform === 'win32';

  // Use a unique per-run dir inside the project so Windows doesn't block cleanup
  const userDataDir = path.join(__dirname, '.chrome-tmp', `run-${Date.now()}`);
  fs.mkdirSync(userDataDir, { recursive: true });

  const windowsFlags = [
    '--headless=new',
    '--disable-gpu',
  ];
  const linuxFlags = [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
  ];

  const launchOptions = {
    userDataDir,
    chromeFlags: isWindows ? windowsFlags : linuxFlags,
  };
  if (!isWindows && config.chromePath) {
    launchOptions.chromePath = config.chromePath;
  }

  const chrome = await chromeLauncher.launch(launchOptions);

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

    const fcp          = audits['first-contentful-paint']?.numericValue ?? null;
    const lcp          = audits['largest-contentful-paint']?.numericValue ?? null;
    const speedIndex   = audits['speed-index']?.numericValue ?? null;
    const cls          = audits['cumulative-layout-shift']?.numericValue ?? null;
    const tbt          = audits['total-blocking-time']?.numericValue ?? null;
    const pageLoadTime = audits['interactive']?.numericValue ?? null; // TTI ≈ full load

    // Console table
    const col = (s, w) => String(s).padEnd(w);
    console.log(`\n  Results for: ${url}`);
    console.log(`  ${'─'.repeat(70)}`);
    console.log(`  ${col('Parameter', 36)} ${col('Value', 16)} Rating`);
    console.log(`  ${'─'.repeat(70)}`);
    console.log(`  ${col('Page Load Time', 36)} ${col(toSeconds(pageLoadTime), 16)} ${getRating('pageLoadTime', pageLoadTime)}`);
    console.log(`  ${col('First Contentful Paint (FCP)', 36)} ${col(toSeconds(fcp), 16)} ${getRating('fcp', fcp)}`);
    console.log(`  ${col('Largest Contentful Paint (LCP)', 36)} ${col(toSeconds(lcp), 16)} ${getRating('lcp', lcp)}`);
    console.log(`  ${col('Speed Index', 36)} ${col(toSeconds(speedIndex), 16)} ${getRating('speedIndex', speedIndex)}`);
    console.log(`  ${col('Cumulative Layout Shift (CLS)', 36)} ${col(toCLS(cls), 16)} ${getRating('cls', cls)}`);
    console.log(`  ${col('Total Blocking Time (TBT)', 36)} ${col(toMs(tbt), 16)} ${getRating('tbt', tbt)}`);
    console.log(`  ${'─'.repeat(70)}`);

    return { url, timestamp: now(), pageLoadTime, fcp, lcp, speedIndex, cls, tbt };

  } finally {
    try { chrome.kill(); } catch (_) {}
    // Clean up the per-run dir; ignore errors if Windows still has a lock
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (_) {}
  }
}

// ─── Write to Google Sheets ───────────────────────────────────────────────────
async function writeToGoogleSheets(allResults) {
  console.log('\nWriting results to Google Sheets...');

  const sheets        = google.sheets({ version: 'v4', auth: oauth2Client });
  const spreadsheetId = process.env.SHEET_ID;
  const sheetName     = 'Performance Results';

  // Check if the sheet tab exists, create if not
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetExists = spreadsheet.data.sheets.some(
    s => s.properties.title === sheetName
  );
  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });
    console.log(`  Created sheet tab: "${sheetName}"`);
  }

  // Write header row if sheet is empty
  const headerCheck = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1`,
  });
  const isEmpty = !headerCheck.data.values || headerCheck.data.values.length === 0;
  if (isEmpty) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Sr. No.',
          'Page Name',
          'URL',
          'Test Date & Time',
          'Page Load Time',
          'PLT Rating',
          'First Contentful Paint (FCP)',
          'FCP Rating',
          'Largest Contentful Paint (LCP)',
          'LCP Rating',
          'Speed Index',
          'Speed Index Rating',
          'Cumulative Layout Shift (CLS)',
          'CLS Rating',
          'Total Blocking Time (TBT)',
          'TBT Rating',
        ]],
      },
    });
    console.log('  Header row written.');
  }

  // Build data rows
  const rows = allResults.map((r, i) => {
    if (r.error) {
      return [i + 1, r.pageName || '', r.url, r.timestamp, 'ERROR', r.error, '', '', '', '', '', '', '', '', '', ''];
    }
    return [
      i + 1,
      r.pageName || '',
      r.url,
      r.timestamp,
      toSeconds(r.pageLoadTime),
      getRating('pageLoadTime', r.pageLoadTime),
      toSeconds(r.fcp),
      getRating('fcp', r.fcp),
      toSeconds(r.lcp),
      getRating('lcp', r.lcp),
      toSeconds(r.speedIndex),
      getRating('speedIndex', r.speedIndex),
      toCLS(r.cls),
      getRating('cls', r.cls),
      toMs(r.tbt),
      getRating('tbt', r.tbt),
    ];
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });

  console.log(`  ${rows.length} row(s) written to "${sheetName}".`);
  console.log(`  Sheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
}

// ─── Save local JSON backup ───────────────────────────────────────────────────
function saveJSON(allResults) {
  const file = path.join(__dirname, `perf_report_${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(allResults, null, 2));
  console.log(`\nJSON backup saved: ${file}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║          Performance Automation — Lighthouse             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\nTesting ${config.pages.length} page(s)...\n`);

  const allResults = [];

  for (const page of config.pages) {
    try {
      const result    = await runLighthouse(page.url);
      result.pageName = page.name;
      allResults.push(result);
    } catch (err) {
      console.error(`Error testing ${page.url}: ${err.message}`);
      allResults.push({
        url:       page.url,
        pageName:  page.name,
        timestamp: now(),
        error:     err.message,
      });
    }
  }

  await writeToGoogleSheets(allResults);
  saveJSON(allResults);

  console.log('\nAll done!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
