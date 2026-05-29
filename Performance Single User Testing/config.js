/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║          PERFORMANCE AUTOMATION — CONFIG FILE            ║
 * ║  Edit this file before running `node measure.js`         ║
 * ╚══════════════════════════════════════════════════════════╝
 */

module.exports = {

  // ── Chrome / Chromium Path ───────────────────────────────────────────────
  // Leave as-is if using Playwright's bundled Chromium.
  // Or set to: '/usr/bin/google-chrome', '/usr/bin/chromium', etc.
  chromePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',

  // ── Pages to Test ────────────────────────────────────────────────────────
  // Add one entry per page you want to measure.
  pages: [
    { name: 'Home Page',       url: 'https://indiamacroindicators.co.in/' },
   // { name: 'Login Page',      url: 'https://example.com/login' },
    { name: '1FMI Graph landing page',       url: 'https://indiamacroindicators.co.in/1-finance-macroeconomic-index' },
    { name: 'Subindices Landing page',   url: 'https://indiamacroindicators.co.in/subindices' },
    { name: 'Subindex graph page',   url: 'https://indiamacroindicators.co.in/subindices/services-sector-activity-index' },
    { name: 'Economic Indicators Dashboard',   url: 'https://indiamacroindicators.co.in/indias-economic-dashboard' },
    { name: 'Economic Indicators listing page',   url: 'https://indiamacroindicators.co.in/economic-indicators' },
    { name: 'Economic Indicator graph details page',   url: 'https://indiamacroindicators.co.in/economic-indicators/category/services-sector-activity' },
    { name: 'Key Economic Indicators listing page',   url: 'https://indiamacroindicators.co.in/key-economic-indicators' },
    { name: 'Key Economic Indicators graph details page',   url: 'https://indiamacroindicators.co.in/key-economic-indicators/g-sec-yield-curve' },
    { name: 'Global Market P/E Ratios',   url: 'https://indiamacroindicators.co.in/global-market-pe-ratios' },
    { name: 'Reports and Resources',   url: 'https://indiamacroindicators.co.in/resources/blogs?page=1' },
    { name: 'Blogs details page',   url: 'https://indiamacroindicators.co.in/resources/blogs/the-global-rate-cut-cycle-is-over' },
    { name: 'Author details page',   url: 'https://indiamacroindicators.co.in/authors/sanya-agarwal' },
    { name: 'Asset Allocator',   url: 'https://indiamacroindicators.co.in/asset-allocator' },
    { name: 'Global Economic Outlook 2026',   url: 'https://indiamacroindicators.co.in/global-economic-outlook-report' },
    { name: 'Terms of Use',   url: 'https://indiamacroindicators.co.in/term-of-use' },
    { name: 'Privacy Policy',   url: 'https://indiamacroindicators.co.in/privacy-policy' },
    { name: 'Sitemap',   url: 'https://indiamacroindicators.co.in/site-map' },
    { name: 'Authors Landing Page',   url: 'https://indiamacroindicators.co.in/authors' },
    // Add more pages as needed...
  ],

  // ── Google Sheets Settings ───────────────────────────────────────────────
  googleSheets: {
    // Set to false to skip Google Sheets upload (results still saved as JSON)
    enabled: false,

    // Your Google Sheet ID (from the URL):
    // https://docs.google.com/spreadsheets/d/  <-- THIS PART -->  /edit
    spreadsheetId: '11Td_6e26QlyAKltIe-3mFeh--7YDwW9mnfO2ridOj4o',

    // Name of the tab/sheet inside the spreadsheet to write results into
    sheetName: 'Performance Results',

    // Path to your Google Service Account JSON key file
    // Download from: Google Cloud Console → IAM → Service Accounts → Keys
    serviceAccountKeyFile: './service-account-key.json',
  },

};
