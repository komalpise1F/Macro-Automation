/**
 * LOAD TEST — simulates expected normal traffic
 * Ramps to 50 VUs over 5 min → holds 10 min → ramps down 2 min
 * Adjust target VUs to match your expected concurrent users.
 */
import { THRESHOLDS, CRITICAL_PAGES as PAGES } from './config.js';
import { visitPage, randomSleep } from './utils.js';

export const options = {
  stages: [
    { duration: '5m',  target: 10 },   // ramp-up
    { duration: '10m', target: 50 },   // steady state — normal load
    { duration: '3m',  target: 50 },   // hold at peak
    { duration: '2m',  target: 0  },   // ramp-down
  ],
  thresholds: {
    ...THRESHOLDS,
    // Stricter during steady state — 99% under 4s
    http_req_duration: ['p(95)<3000', 'p(99)<4000'],
  },
  tags: { test_type: 'load' },
};

export default function () {
  for (const page of PAGES) {
    visitPage(page.path, page.name);
    randomSleep(2, 5);   // simulate realistic user think time
  }
}
