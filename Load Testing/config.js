export const BASE_URL = 'https://uat.indiamacroindicators.co.in';

export const THRESHOLDS = {
  // 95% of requests must complete below 3s
  http_req_duration: ['p(95)<3000', 'p(99)<5000'],
  // Error rate must stay below 1%
  http_req_failed: ['rate<0.01'],
  // Time to first byte under 1.5s for 95%
  http_req_waiting: ['p(95)<1500'],
};

export const HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

// All pages grouped by section for targeted scenario testing
export const PAGES = [
  // Core / Navigation
  { name: 'homepage',                     path: '/',                                                          group: 'core' },
  { name: 'site_map',                     path: '/site-map',                                                  group: 'core' },

  // Index & Subindices
  { name: '1finance_macro_index',         path: '/1-finance-macroeconomic-index',                             group: 'index' },
  { name: 'subindices',                   path: '/subindices',                                                group: 'index' },
  { name: 'subindex_services_activity',   path: '/subindices/services-sector-activity-index',                 group: 'index' },

  // Dashboard & Indicators
  { name: 'economic_dashboard',           path: '/indias-economic-dashboard',                                 group: 'indicators' },
  { name: 'economic_indicators',          path: '/economic-indicators',                                       group: 'indicators' },
  { name: 'indicators_services_category', path: '/economic-indicators/category/services-sector-activity',     group: 'indicators' },
  { name: 'key_economic_indicators',      path: '/key-economic-indicators',                                   group: 'indicators' },
  { name: 'gsec_yield_curve',             path: '/key-economic-indicators/g-sec-yield-curve',                 group: 'indicators' },
  { name: 'global_market_pe_ratios',      path: '/global-market-pe-ratios',                                   group: 'indicators' },

  // Reports & Tools
  { name: 'asset_allocator',              path: '/asset-allocator',                                           group: 'tools' },
  { name: 'global_economic_outlook',      path: '/global-economic-outlook-report',                            group: 'tools' },

  // Resources / Blog
  { name: 'blogs_listing',               path: '/resources/blogs?page=1',                                    group: 'resources' },
  { name: 'blog_post_rate_cut',          path: '/resources/blogs/the-global-rate-cut-cycle-is-over',         group: 'resources' },
  { name: 'authors_listing',             path: '/authors',                                                    group: 'resources' },
  { name: 'author_sanya_agarwal',        path: '/authors/sanya-agarwal',                                     group: 'resources' },

  // Legal
  { name: 'term_of_use',                 path: '/term-of-use',                                               group: 'legal' },
  { name: 'privacy_policy',              path: '/privacy-policy',                                            group: 'legal' },
];

// Convenience subsets — use these in tests that target specific sections
export const CRITICAL_PAGES  = PAGES.filter(p => ['core', 'index', 'indicators'].includes(p.group));
export const ALL_PAGES        = PAGES;
