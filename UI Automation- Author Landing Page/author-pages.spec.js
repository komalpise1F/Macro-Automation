// author-pages.spec.js
// Playwright tests for Individual Author Page and Author Listing Page
// Based on Figma design for indiamacroindicators.co.in

const { test, expect } = require('@playwright/test');

// ─── Constants ─────────────────────────────────────────────────────────────── 

const BASE_URL        = 'https://indiamacroindicators.co.in';
const AUTHOR_LIST_URL = `${BASE_URL}/authors`;
const BLOG_BASE_PATH  = '/resources/blogs/';

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile:  { width: 390,  height: 844 },
};

// Selectors derived from live site inspection
const SEL = {
  // ── Header ──────────────────────────────────────────────────────────────
  header:   'header, [role="banner"]',
  // Only real nav links (exclude dropdown anchors with href="#")
  navLinks: 'header nav a[href]:not([href="#"]):not([href^="javascript"])',

  // ── Author Listing Page ─────────────────────────────────────────────────
  listingHeading:  'h1:has-text("Meet Our Research Team"), h2:has-text("Meet Our Research Team")',
  headOfResearch:  'h2:has-text("Head of Research"), h3:has-text("Head of Research")',
  // Author name links on the listing page (text links, not image links)
  authorNameLink:  'a[href^="/authors/"]:not(:has(img))',
  // Any link that points to an author profile (image OR name)
  authorAnyLink:   'a[href^="/authors/"]',
  socialIcons:     'svg[class*="AuthorLinkedin"], svg[class*="AuthorTwitter"], [class*="author-mail-social-icon"], a[href*="linkedin.com"], a[href*="twitter.com"]',
  pagination:      '.pagination, [aria-label="pagination"], [class*="paginate"]',

  // ── Individual Author Page ───────────────────────────────────────────────
  authorName:      'h1',
  authorPhoto:     'img[src*="s3.ap-south-1.amazonaws.com"], img[src*="macro-crypto"]',
  authorBio:       'main p, article p, [class*="bio"], [class*="description"]',
  blogCard:        `a[href*="${BLOG_BASE_PATH}"]`,
  meetTeamSection: 'section:has-text("Meet Our Research Team"), div:has-text("Meet Our Research Team")',
  meetTeamCTA:     `a[href="/authors"], a[href="${AUTHOR_LIST_URL}"], a:has-text("Meet Our Research Team")`,

  // ── Blog article page ────────────────────────────────────────────────────
  blogArticleLink: `a[href*="${BLOG_BASE_PATH}"]`,
  // Author link inside a blog article (links to /authors/...)
  blogAuthorLink:  'a[href^="/authors/"]',

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: 'footer, [role="contentinfo"]',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function waitForPageLoad(page) {
  // Use domcontentloaded — networkidle never settles on this Next.js site
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800); // allow JS hydration
}

/**
 * Dismiss the site popup that appears ~10 seconds after page load.
 * Tries common close-button patterns; silently skips if no popup appears.
 */
async function dismissPopup(page) {
  const closeSelectors = [
    'button[aria-label="Close"]',
    'button[aria-label="close"]',
    '[class*="popup"] button[class*="close"]',
    '[class*="modal"] button[class*="close"]',
    '[class*="popup-close"]',
    '[class*="modal-close"]',
    '.popup .close',
    '.modal .close',
    'button:has(svg)[class*="close"]',
    '[class*="overlay"] button',
    '[data-dismiss="modal"]',
    '[aria-label*="dismiss"]',
    'button:has-text("✕")',
    'button:has-text("×")',
    'button:has-text("Close")',
  ];

  try {
    await page.waitForSelector(
      '[class*="popup"], [class*="modal"], [class*="overlay"], [role="dialog"]',
      { timeout: 13000 }
    );
    for (const sel of closeSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(500);
        return;
      }
    }
    await page.keyboard.press('Escape');
  } catch {
    // No popup — continue
  }
}

/**
 * Verify no images that have finished loading show as broken.
 * Skips lazy images that haven't loaded yet (naturalWidth=0, complete=false).
 */
async function verifyNoBrokenImages(page) {
  // Scroll to trigger lazy loading
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));

  const images = await page.locator('img').all();
  for (const img of images) {
    const src = await img.getAttribute('src').catch(() => null);
    if (!src || src.startsWith('data:')) continue;

    const { complete, naturalWidth } = await img.evaluate(el => ({
      complete:     el.complete,
      naturalWidth: el.naturalWidth,
    }));

    // Only fail if image finished loading but has zero dimensions (broken)
    if (complete && naturalWidth === 0) {
      throw new Error(`Broken image detected: ${src}`);
    }
  }
}

/**
 * Navigate to Author Listing, click the first author name link,
 * and return to the individual author page.
 */
async function goToFirstAuthorPage(page) {
  await page.goto(AUTHOR_LIST_URL);
  await waitForPageLoad(page);
  await dismissPopup(page);

  const nameLink = page.locator(SEL.authorNameLink).first();
  await expect(nameLink).toBeVisible({ timeout: 10000 });
  const authorName = (await nameLink.textContent() || '').trim();
  await nameLink.click();
  await waitForPageLoad(page);

  return authorName;
}

// ─── Path 1: Blog Article → Individual Author → Listing ──────────────────────

test.describe('Path 1 — Blog Article → Individual Author Page → Author Listing Page', () => {

  test.describe('Desktop (1280x800)', () => {

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
    });

    // TC-P1-D-01: Blog article page loads with author link visible
    test('TC-P1-D-01: Blog article page — author link visible', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      await dismissPopup(page);

      // Use the second blog article (index 1) — skip the first
      const articleLink = page.locator(SEL.blogArticleLink).nth(1);
      await expect(articleLink).toBeVisible({ timeout: 10000 });

      const href = await articleLink.getAttribute('href');
      const articleURL = href.startsWith('http') ? href : `${BASE_URL}${href}`;
      await page.goto(articleURL);
      await waitForPageLoad(page);
      await dismissPopup(page);

      // Author link pointing to /authors/* should exist on the blog page
      const authorLink = page.locator(SEL.blogAuthorLink).first();
      await expect(authorLink).toBeVisible({ timeout: 10000 });
    });

    // TC-P1-D-02: Clicking author link on blog → Individual Author Page
    test('TC-P1-D-02: Click author link on blog → redirects to Individual Author Page', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      await dismissPopup(page);

      // Use the second blog article (index 1) — skip the first
      const articleLink = page.locator(SEL.blogArticleLink).nth(1);
      const href = await articleLink.getAttribute('href');
      await page.goto(href.startsWith('http') ? href : `${BASE_URL}${href}`);
      await waitForPageLoad(page);
      await dismissPopup(page);

      const authorLink = page.locator(SEL.blogAuthorLink).first();
      await expect(authorLink).toBeVisible({ timeout: 10000 });

      await authorLink.click();
      await waitForPageLoad(page);

      // URL should now be /authors/[name]
      expect(page.url()).toMatch(/\/authors\//);
      await expect(page.locator(SEL.authorName).first()).toBeVisible({ timeout: 10000 });
    });

    // TC-P1-D-03: Individual Author Page — profile (photo, name, designation, bio)
    test('TC-P1-D-03: Individual Author Page — profile section visible', async ({ page }) => {
      await goToFirstAuthorPage(page);

      // Author name (h1)
      const nameEl = page.locator(SEL.authorName).first();
      await expect(nameEl).toBeVisible({ timeout: 10000 });
      expect((await nameEl.textContent()).trim().length).toBeGreaterThan(0);

      // Author photo
      const photo = page.locator(SEL.authorPhoto).first();
      await expect(photo).toBeVisible({ timeout: 10000 });

      // Bio text
      const bio = page.locator(SEL.authorBio).first();
      await expect(bio).toBeVisible({ timeout: 10000 });
    });

    // TC-P1-D-04: Individual Author Page — articles section (min 1 card)
    test('TC-P1-D-04: Individual Author Page — at least 1 article card visible', async ({ page }) => {
      await goToFirstAuthorPage(page);

      const card = page.locator(SEL.blogCard).first();
      await expect(card).toBeVisible({ timeout: 10000 });

      const cardCount = await page.locator(SEL.blogCard).count();
      expect(cardCount).toBeGreaterThanOrEqual(1);

      // Card must have a non-empty title
      const titleEl = card.locator('h2, h3, p').first();
      await expect(titleEl).toBeVisible();
    });

    // TC-P1-D-05: Individual Author Page — "Meet Our Research Team" section at bottom
    test('TC-P1-D-05: Individual Author Page — "Meet Our Research Team" section at bottom', async ({ page }) => {
      await goToFirstAuthorPage(page);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      const section = page.locator(SEL.meetTeamSection).first();
      await expect(section).toBeVisible({ timeout: 10000 });
      await expect(section).toContainText(/Meet Our Research Team/i);
    });

    // TC-P1-D-06: Click "Meet Our Research Team" CTA → Author Listing Page
    test('TC-P1-D-06: Click "Meet Our Research Team" CTA → Author Listing Page', async ({ page }) => {
      await goToFirstAuthorPage(page);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      const cta = page.locator(SEL.meetTeamCTA).first();
      await expect(cta).toBeVisible({ timeout: 10000 });
      await cta.click();
      await waitForPageLoad(page);

      expect(page.url()).toMatch(/\/authors/);
      await expect(page.locator(SEL.listingHeading).first()).toBeVisible({ timeout: 10000 });

      const cards = await page.locator(SEL.authorNameLink).count();
      expect(cards).toBeGreaterThanOrEqual(2);
    });

    // TC-P1-D-07: Individual Author Page — footer visible
    test('TC-P1-D-07: Individual Author Page — footer is visible', async ({ page }) => {
      await goToFirstAuthorPage(page);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      await expect(page.locator(SEL.footer).first()).toBeVisible({ timeout: 10000 });
    });

    // TC-P1-D-08: Individual Author Page — no broken images
    test('TC-P1-D-08: Individual Author Page — no broken images', async ({ page }) => {
      await goToFirstAuthorPage(page);
      await verifyNoBrokenImages(page);
    });

  });

  test.describe('Mobile (390x844)', () => {

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
    });

    // TC-P1-M-01: Individual Author Page — profile visible on mobile
    test('TC-P1-M-01: Individual Author Page — profile section visible on mobile', async ({ page }) => {
      await goToFirstAuthorPage(page);

      await expect(page.locator(SEL.authorName).first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator(SEL.authorPhoto).first()).toBeVisible({ timeout: 10000 });
    });

    // TC-P1-M-02: Individual Author Page — articles section visible on mobile
    test('TC-P1-M-02: Individual Author Page — articles section visible on mobile', async ({ page }) => {
      await goToFirstAuthorPage(page);

      const firstCard = page.locator(SEL.blogCard).first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });

      // Card should not overflow mobile viewport
      const box = await firstCard.boundingBox();
      if (box) expect(box.width).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 5);
    });

    // TC-P1-M-03: Individual Author Page — "Meet Our Research Team" section on mobile
    test('TC-P1-M-03: Individual Author Page — Meet Our Research Team section on mobile', async ({ page }) => {
      await goToFirstAuthorPage(page);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      await expect(page.locator(SEL.meetTeamSection).first()).toBeVisible({ timeout: 10000 });
    });

    // TC-P1-M-04: Individual Author Page — no broken images on mobile
    test('TC-P1-M-04: Individual Author Page — no broken images on mobile', async ({ page }) => {
      await goToFirstAuthorPage(page);
      await verifyNoBrokenImages(page);
    });

  });

});

// ─── Path 2: Author Listing Page → Individual Author Page ────────────────────

test.describe('Path 2 — Author Listing Page → Individual Author Page', () => {

  test.describe('Desktop (1280x800)', () => {

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto(AUTHOR_LIST_URL);
      await waitForPageLoad(page);
      await dismissPopup(page);
    });

    // TC-P2-D-01: Heading "Meet Our Research Team" visible
    test('TC-P2-D-01: Author Listing Page — heading "Meet Our Research Team" is visible', async ({ page }) => {
      const heading = page.locator(SEL.listingHeading).first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      await expect(heading).toContainText(/Meet Our Research Team/i);
    });

    // TC-P2-D-02: Head of Research section visible with photo, name, designation
    test('TC-P2-D-02: Author Listing Page — Head of Research section visible', async ({ page }) => {
      const headLabel = page.locator(SEL.headOfResearch).first();
      await expect(headLabel).toBeVisible({ timeout: 10000 });

      // Photo near the head of research label
      const headPhoto = page.locator('img').first();
      await expect(headPhoto).toBeVisible({ timeout: 10000 });

      // Author name link near the section
      const headName = page.locator(SEL.authorNameLink).first();
      await expect(headName).toBeVisible({ timeout: 10000 });
      expect((await headName.textContent()).trim().length).toBeGreaterThan(0);
    });

    // TC-P2-D-03: Research Team grid — min 2 author cards (photo, name, role)
    test('TC-P2-D-03: Author Listing Page — Research Team grid (min 2 authors)', async ({ page }) => {
      const nameLinks = page.locator(SEL.authorNameLink);
      await expect(nameLinks.first()).toBeVisible({ timeout: 10000 });

      const count = await nameLinks.count();
      expect(count).toBeGreaterThanOrEqual(2);

      // Verify first author has a non-empty name
      const firstName = (await nameLinks.first().textContent() || '').trim();
      expect(firstName.length).toBeGreaterThan(0);
    });

    // TC-P2-D-04: Social/follow icons visible on team cards
    test('TC-P2-D-04: Author Listing Page — social icons present on team member cards', async ({ page }) => {
      const socialIcons = page.locator(SEL.socialIcons);
      await expect(socialIcons.first()).toBeVisible({ timeout: 10000 });
      const count = await socialIcons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    // TC-P2-D-05: Pagination check (soft — may not exist)
    test('TC-P2-D-05: Author Listing Page — pagination check (if applicable)', async ({ page }) => {
      const pagination = page.locator(SEL.pagination).first();
      const hasPagination = await pagination.isVisible().catch(() => false);
      if (hasPagination) {
        await expect(pagination).toBeVisible();
      } else {
        // No pagination — all authors should be on one page
        const count = await page.locator(SEL.authorNameLink).count();
        expect(count).toBeGreaterThanOrEqual(1);
      }
    });

    // TC-P2-D-06: Footer visible
    test('TC-P2-D-06: Author Listing Page — footer is visible', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await expect(page.locator(SEL.footer).first()).toBeVisible({ timeout: 10000 });
    });

    // TC-P2-D-07: Click author name → redirects to correct Individual Author Page
    test('TC-P2-D-07: Click author name → navigates to correct Individual Author Page', async ({ page }) => {
      const nameLink = page.locator(SEL.authorNameLink).first();
      await expect(nameLink).toBeVisible({ timeout: 10000 });

      const expectedName = (await nameLink.textContent() || '').trim();
      await nameLink.click();
      await waitForPageLoad(page);

      expect(page.url()).toMatch(/\/authors\//);

      const authorNameEl = page.locator(SEL.authorName).first();
      await expect(authorNameEl).toBeVisible({ timeout: 10000 });
      const actualName = (await authorNameEl.textContent() || '').trim();
      expect(actualName.toLowerCase()).toContain(expectedName.split(' ')[0].toLowerCase());
    });

    // TC-P2-D-08: Individual Author Page (via listing) — at least 1 article card
    test('TC-P2-D-08: Individual Author Page (via listing) — at least 1 article card visible', async ({ page }) => {
      await page.locator(SEL.authorNameLink).first().click();
      await waitForPageLoad(page);

      await expect(page.locator(SEL.blogCard).first()).toBeVisible({ timeout: 10000 });
    });

    // TC-P2-D-09: Header nav links intact on Author Listing Page
    test('TC-P2-D-09: Author Listing Page — header navigation links are visible and intact', async ({ page }) => {
      await expect(page.locator(SEL.header).first()).toBeVisible({ timeout: 10000 });

      const navLinks = page.locator(SEL.navLinks);
      const count = await navLinks.count();
      expect(count).toBeGreaterThanOrEqual(1);

      // All real nav links must have a non-empty href (# links are filtered by selector)
      for (let i = 0; i < count; i++) {
        const href = await navLinks.nth(i).getAttribute('href');
        expect(href).toBeTruthy();
      }
    });

    // TC-P2-D-10: No broken images on Author Listing Page
    test('TC-P2-D-10: Author Listing Page — no broken images', async ({ page }) => {
      await verifyNoBrokenImages(page);
    });

  });

  test.describe('Mobile (390x844)', () => {

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(AUTHOR_LIST_URL);
      await waitForPageLoad(page);
      await dismissPopup(page);
    });

    // TC-P2-M-01: Heading "Meet Our Research Team" visible on mobile
    test('TC-P2-M-01: Author Listing Page — heading visible on mobile', async ({ page }) => {
      await expect(page.locator(SEL.listingHeading).first()).toBeVisible({ timeout: 10000 });
    });

    // TC-P2-M-02: Team member cards visible and fit mobile viewport
    test('TC-P2-M-02: Author Listing Page — author cards visible and fit mobile viewport', async ({ page }) => {
      const nameLink = page.locator(SEL.authorNameLink).first();
      await expect(nameLink).toBeVisible({ timeout: 10000 });

      const count = await page.locator(SEL.authorNameLink).count();
      expect(count).toBeGreaterThanOrEqual(2);

      const box = await nameLink.boundingBox();
      if (box) expect(box.width).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 5);
    });

    // TC-P2-M-03: Click author card on mobile → correct Individual Author Page
    test('TC-P2-M-03: Click author card on mobile → correct Individual Author Page', async ({ page }) => {
      const nameLink = page.locator(SEL.authorNameLink).first();
      await expect(nameLink).toBeVisible({ timeout: 10000 });

      const expectedName = (await nameLink.textContent() || '').trim();
      await nameLink.click();
      await waitForPageLoad(page);

      expect(page.url()).toMatch(/\/authors\//);

      const authorNameEl = page.locator(SEL.authorName).first();
      await expect(authorNameEl).toBeVisible({ timeout: 10000 });
      const actualName = (await authorNameEl.textContent() || '').trim();
      expect(actualName.toLowerCase()).toContain(expectedName.split(' ')[0].toLowerCase());
    });

    // TC-P2-M-04: Individual Author Page (via listing, mobile) — profile and articles visible
    test('TC-P2-M-04: Individual Author Page (mobile) — profile and articles visible', async ({ page }) => {
      await page.locator(SEL.authorNameLink).first().click();
      await waitForPageLoad(page);

      await expect(page.locator(SEL.authorName).first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator(SEL.blogCard).first()).toBeVisible({ timeout: 10000 });
    });

    // TC-P2-M-05: Footer visible on mobile
    test('TC-P2-M-05: Author Listing Page — footer visible on mobile', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await expect(page.locator(SEL.footer).first()).toBeVisible({ timeout: 10000 });
    });

    // TC-P2-M-06: No broken images on mobile
    test('TC-P2-M-06: Author Listing Page — no broken images on mobile', async ({ page }) => {
      await verifyNoBrokenImages(page);
    });

  });

});

// ─── Cross-cutting: Navigation & Layout ──────────────────────────────────────

test.describe('Cross-cutting — Navigation & Layout Checks', () => {

  // TC-CC-01: Header nav intact on Individual Author Page (desktop)
  test('TC-CC-01: Individual Author Page — header navigation intact (desktop)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await goToFirstAuthorPage(page);

    await expect(page.locator(SEL.header).first()).toBeVisible({ timeout: 10000 });
    const count = await page.locator(SEL.navLinks).count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // TC-CC-02: Header nav intact on Individual Author Page (mobile)
  test('TC-CC-02: Individual Author Page — header navigation intact (mobile)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await goToFirstAuthorPage(page);

    await expect(page.locator(SEL.header).first()).toBeVisible({ timeout: 10000 });
  });

  // TC-CC-03: Author Listing Page loads on desktop
  test('TC-CC-03: Author Listing Page loads correctly on desktop (1280x800)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(AUTHOR_LIST_URL);
    await waitForPageLoad(page);
    await dismissPopup(page);

    await expect(page).toHaveURL(AUTHOR_LIST_URL);
    await expect(page.locator(SEL.listingHeading).first()).toBeVisible({ timeout: 10000 });
  });

  // TC-CC-04: Author Listing Page loads on mobile
  test('TC-CC-04: Author Listing Page loads correctly on mobile (390x844)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto(AUTHOR_LIST_URL);
    await waitForPageLoad(page);
    await dismissPopup(page);

    await expect(page).toHaveURL(AUTHOR_LIST_URL);
    await expect(page.locator(SEL.listingHeading).first()).toBeVisible({ timeout: 10000 });
  });

});
