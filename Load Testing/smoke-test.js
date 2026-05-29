/**
 * SMOKE TEST — sanity check before heavier runs
 * 1 VU · 2 minutes · validates the site is up and responding correctly
 */
import { THRESHOLDS, ALL_PAGES as PAGES } from './config.js';
import { visitPage, randomSleep } from './utils.js';

export const options = {
  vus: 1,
  duration: '2m',
  thresholds: THRESHOLDS,
  tags: { test_type: 'smoke' },
};

export default function () {
  for (const page of PAGES) {
    visitPage(page.path, page.name);
    randomSleep(1, 2);
  }
}
