/**
 * SOAK TEST — extended duration at normal load
 * Detects memory leaks, DB connection pool exhaustion, or gradual degradation.
 * Default: 1 hour. Increase to 4–8 hours for thorough soak testing.
 */
import { THRESHOLDS, ALL_PAGES as PAGES } from './config.js';
import { visitPage, randomSleep } from './utils.js';

export const options = {
  stages: [
    { duration: '5m',  target: 30 },   // ramp-up
    { duration: '50m', target: 30 },   // soak at normal load
    { duration: '5m',  target: 0  },   // ramp-down
  ],
  thresholds: {
    ...THRESHOLDS,
    // Alert if p95 drifts up by more than 20% vs smoke baseline
    http_req_duration: ['p(95)<3600'],
  },
  tags: { test_type: 'soak' },
};

export default function () {
  for (const page of PAGES) {
    visitPage(page.path, page.name);
    randomSleep(3, 7);   // longer think time to mimic real user sessions
  }
}
