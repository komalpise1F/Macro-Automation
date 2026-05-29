import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { BASE_URL, HEADERS } from './config.js';

export const pageLoadTime = new Trend('page_load_time', true);
export const errorRate    = new Rate('error_rate');
export const pageHits     = new Counter('page_hits');

/**
 * Fetch a page and validate it, recording custom metrics.
 * @param {string} path  - URL path (e.g. '/')
 * @param {string} label - Tag label for grouping in results
 */
export function visitPage(path, label) {
  const url = `${BASE_URL}${path}`;
  const res = http.get(url, {
    headers: HEADERS,
    tags: { page: label },
  });

  const ok = check(res, {
    [`${label}: status 200`]:        (r) => r.status === 200,
    [`${label}: response < 3000ms`]: (r) => r.timings.duration < 3000,
    [`${label}: has body`]:          (r) => r.body && r.body.length > 0,
  });

  pageLoadTime.add(res.timings.duration, { page: label });
  errorRate.add(!ok);
  pageHits.add(1, { page: label });

  return res;
}

export function randomSleep(min = 1, max = 3) {
  sleep(Math.random() * (max - min) + min);
}
