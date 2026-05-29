/**
 * SPIKE TEST — sudden traffic surge (e.g. a news event or marketing campaign)
 * Jumps to 10× normal load instantly, then drops back — tests auto-scaling & recovery.
 */
import { CRITICAL_PAGES as PAGES } from './config.js';
import { visitPage, randomSleep } from './utils.js';

export const options = {
  stages: [
    { duration: '1m',  target: 10  },  // warm-up at baseline
    { duration: '30s', target: 500 },  // instant spike
    { duration: '3m',  target: 500 },  // hold the spike
    { duration: '1m',  target: 10  },  // drop back to baseline
    { duration: '3m',  target: 10  },  // verify recovery
    { duration: '1m',  target: 0   },  // ramp down
  ],
  thresholds: {
    http_req_failed:   ['rate<0.05'],
    http_req_duration: ['p(95)<8000'],
  },
  tags: { test_type: 'spike' },
};

export default function () {
  for (const page of PAGES) {
    visitPage(page.path, page.name);
    randomSleep(1, 2);
  }
}
