/**
 * STRESS TEST — find the breaking point
 * Incrementally increases load until errors/latency exceed thresholds.
 * Deliberately has relaxed thresholds — the goal is to *observe* degradation.
 */
import { CRITICAL_PAGES as PAGES } from './config.js';
import { visitPage, randomSleep } from './utils.js';

export const options = {
  stages: [
    { duration: '2m',  target: 50  },  // baseline
    { duration: '3m',  target: 100 },  // 2× normal
    { duration: '3m',  target: 200 },  // 4× normal
    { duration: '3m',  target: 300 },  // stress zone
    { duration: '3m',  target: 400 },  // beyond expected capacity
    { duration: '5m',  target: 0   },  // recovery — watch latency come back down
  ],
  thresholds: {
    // Allow higher error rate — we want to see where it breaks, not fail fast
    http_req_failed:   ['rate<0.10'],
    http_req_duration: ['p(95)<10000'],
  },
  tags: { test_type: 'stress' },
};

export default function () {
  for (const page of PAGES) {
    visitPage(page.path, page.name);
    randomSleep(1, 3);
  }
}
