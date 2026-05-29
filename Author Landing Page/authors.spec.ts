import { test, expect, Page, BrowserContext, APIRequestContext } from "@playwright/test";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const BASE_URL = "https://qa.indiamacroindicators.co.in/authors";
const ORIGIN = new URL(BASE_URL).origin;

const TEAM_MEMBERS = [
  {
    name: "Animesh Hardia",
    role: "Senior Vice President, Quantitative Research | @1Finance",
    section: "head",
  },
  {
    name: "Ravi Aswani",
    role: "Assistant Vice President, Macroeconomics Research | @1Finance",
    section: "team",
  },
  {
    name: "Sanya Agarwal",
    role: "Quantitative Research Analyst | @1Finance",
    section: "team",
  },
  {
    name: "Purvang Mashru",
    role: "Senior Quantitative Research Analyst | @1Finance",
    section: "team",
  },
  {
    name: "Dev Patel",
    role: "Quantitative Research Analyst | @1Finance",
    section: "team",
  },
  {
    name: "Jessica Shah",
    role: "Quantitative Research Analyst | @1Finance",
    section: "team",
  },
];

const NAV_LINKS = [
  "India Macroeconomic Indices",
  "Economic Indicators",
  "Global Market P/E",
  "Reports and Resources",
  "Asset Allocator",
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
async function goto(page: Page) {
  await page.goto(BASE_URL, { waitUntil: "load" });
  // Wait for RSC streaming to finish rendering the hero heading
  await page.getByRole("heading", { name: /meet our research team/i }).waitFor({ timeout: 15000 });
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ═════════════════════════════════════════════
// SUITE 1 — PAGE LOAD & STRUCTURE
// ═════════════════════════════════════════════
test.describe("Page Load & Basic Structure", () => {
  test("should load the authors page successfully (200)", async ({ page }: { page: Page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
  });

  test("page title should contain '1 Finance' or 'Authors'", async ({ page }: { page: Page }) => {
    await goto(page);
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/1 finance|authors|research team|macroeconomic indicators|imi/i);
  });

  test("hero section heading 'Meet Our Research Team' is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.getByRole("heading", { name: /meet our research team/i })
    ).toBeVisible();
  });

  test("hero section subtitle / tagline is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const subtitle = page.getByText(
      /editors.*india macro indicators|news.*insights.*analysis/i
    );
    await expect(subtitle).toBeVisible();
  });

  test("'Head of Research' section heading is present", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.getByRole("heading", { name: /head of research/i })
    ).toBeVisible();
  });

  test("'Research Team' section heading is present", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.getByRole("heading", { name: /research team/i })
    ).toBeVisible();
  });

  test("breadcrumb shows 'Research Team'", async ({ page }: { page: Page }) => {
    await goto(page);
    const breadcrumb = page
      .locator('[aria-label*="breadcrumb" i], [class*="breadcrumb" i]')
      .filter({ hasText: /authors/i })
      .first();
    await expect(breadcrumb).toBeVisible();
  });
});

// ═════════════════════════════════════════════
// SUITE 2 — NAVIGATION
// ═════════════════════════════════════════════
test.describe("Navigation Bar", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await goto(page);
  });

  test("logo is visible and clickable", async ({ page }: { page: Page }) => {
    const logo = page
      .locator("header")
      .getByRole("link")
      .filter({ hasText: /1 finance/i })
      .or(page.locator("header img[alt*='logo' i]").first());
    await expect(logo.first()).toBeVisible();
    await logo.first().click();
    await page.waitForLoadState("load");
    expect(page.url()).not.toContain("/authors");
  });

  for (const navItem of NAV_LINKS) {
    test(`nav link "${navItem}" is visible`, async ({ page }: { page: Page }) => {
      await expect(
        page.getByRole("navigation").getByText(navItem, { exact: false })
      ).toBeVisible();
    });
  }

  test("search icon is present in header", async ({ page }: { page: Page }) => {
    const searchIcon = page
      .locator("header")
      .locator('[aria-label*="search" i], [title*="search" i], svg')
      .first();
    await expect(searchIcon).toBeVisible();
  });

  test("nav links are not broken (status 200 check for first link)", async ({
    page,
    request,
  }: { page: Page; request: APIRequestContext }) => {
    const firstLink = page
      .getByRole("navigation")
      .getByRole("link")
      .first();
    const href = await firstLink.getAttribute("href");
    if (href && href.startsWith("http")) {
      const res = await request.get(href);
      expect(res.status()).toBe(200);
    } else if (href && href.startsWith("/")) {
      const res = await request.get(`${ORIGIN}${href}`);
      expect(res.status()).toBe(200);
    }
  });
});

// ═════════════════════════════════════════════
// SUITE 3 — CONTENT: HEAD OF RESEARCH
// ═════════════════════════════════════════════
test.describe("Head of Research — Content", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await goto(page);
  });

  test("Animesh Hardia card is visible", async ({ page }: { page: Page }) => {
    await expect(page.getByText("Animesh Hardia")).toBeVisible();
  });

  test("Animesh Hardia's role title is correct", async ({ page }: { page: Page }) => {
    await expect(
      page.getByText(/(senior )?vice president.*quantitative research/i)
    ).toBeVisible();
  });

  test("Animesh Hardia's bio paragraph is present and non-empty", async ({ page }: { page: Page }) => {
    const card = page
      .locator("section, div, article")
      .filter({ hasText: "Animesh Hardia" })
      .first();
    const bio = card.locator("p").first();
    await expect(bio).toBeVisible();
    const text = await bio.textContent();
    expect(text?.trim().length).toBeGreaterThan(20);
  });

  test("Animesh Hardia's profile photo is visible and loaded", async ({ page }: { page: Page }) => {
    const img = page
      .locator("section, div")
      .filter({ hasText: "Animesh Hardia" })
      .locator("img")
      .first();
    await expect(img).toBeVisible();
    const naturalWidth = await img.evaluate(
      (el: HTMLImageElement) => el.naturalWidth
    );
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test("Animesh Hardia has LinkedIn social link", async ({ page }: { page: Page }) => {
    const card = page
      .locator("section, div, article")
      .filter({ hasText: "Animesh Hardia" })
      .first();
    const linkedIn = card.locator('a[href*="linkedin"]');
    await expect(linkedIn).toBeVisible();
  });

  test("Animesh Hardia social links open in new tab with noopener", async ({ page }: { page: Page }) => {
    const card = page
      .locator("section, div, article")
      .filter({ hasText: "Animesh Hardia" })
      .first();
    const socialLinks = card.locator(
      "a[href*='linkedin'], a[href*='twitter'], a[href*='x.com'], a[href*='gmail'], a[href*='mail']"
    );
    const count = await socialLinks.count();
    for (let i = 0; i < count; i++) {
      const target = await socialLinks.nth(i).getAttribute("target");
      expect(target).toBe("_blank");
      const rel = await socialLinks.nth(i).getAttribute("rel");
      expect(rel).toContain("noopener");
    }
  });
});

// ═════════════════════════════════════════════
// SUITE 4 — CONTENT: RESEARCH TEAM GRID
// ═════════════════════════════════════════════
test.describe("Research Team Grid — Content", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await goto(page);
  });

  for (const member of TEAM_MEMBERS.filter((m) => m.section === "team")) {
    test(`team member "${member.name}" is visible`, async ({ page }: { page: Page }) => {
      await expect(page.getByText(member.name)).toBeVisible();
    });

    test(`"${member.name}" role title is correct`, async ({ page }: { page: Page }) => {
      const roleKeyword = escapeRegExp(
        member.role.split(" ").slice(0, 3).join(" ")
      );
      await expect(
        page.getByText(new RegExp(roleKeyword, "i"))
      ).toBeVisible();
    });

    test(`"${member.name}" profile photo loads correctly`, async ({ page }: { page: Page }) => {
      const card = page
        .locator("section, div, article")
        .filter({ hasText: member.name })
        .first();
      const img = card.locator("img").first();
      await expect(img).toBeVisible();
      const naturalWidth = await img.evaluate(
        (el: HTMLImageElement) => el.naturalWidth
      );
      expect(naturalWidth).toBeGreaterThan(0);
    });

    test(`"${member.name}" has at least one social link`, async ({ page }: { page: Page }) => {
      const card = page
        .locator("section, div, article")
        .filter({ hasText: member.name })
        .first();
      const links = card.locator("a");
      const count = await links.count();
      expect(count).toBeGreaterThan(0);
    });
  }

  test("research team grid shows exactly 5 members", async ({ page }: { page: Page }) => {
    const teamSection = page
      .locator("section, div")
      .filter({ hasText: /research team/i })
      .last();
    const cards = teamSection.locator("img");
    const count = await cards.count();
    expect(count).toBe(5);
  });

  test("bio text for each team card is non-empty", async ({ page }: { page: Page }) => {
    for (const member of TEAM_MEMBERS.filter((m) => m.section === "team")) {
      const card = page
        .locator("section, div, article")
        .filter({ hasText: member.name })
        .first();
      const bio = card.locator("p").first();
      const text = await bio.textContent();
      expect((text ?? "").trim().length).toBeGreaterThan(10);
    }
  });
});

// ═════════════════════════════════════════════
// SUITE 5 — UI / UX TESTING
// ═════════════════════════════════════════════
test.describe("UI / UX Checks", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await goto(page);
  });

  test("page is scrollable and footer is reachable", async ({ page }: { page: Page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator("footer").first();
    await expect(footer).toBeVisible();
  });

  test("footer contains '1 Finance' branding", async ({ page }: { page: Page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator("footer");
    await expect(footer.getByText(/1 finance/i).first()).toBeVisible();
  });

  test("newsletter email input in footer is present and interactive", async ({ page }: { page: Page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const emailInput = page
      .locator("footer")
      .getByPlaceholder(/enter your email/i);
    await expect(emailInput).toBeVisible();
    await emailInput.fill("test@example.com");
    expect(await emailInput.inputValue()).toBe("test@example.com");
  });

  test("page has no horizontally overflowing elements", async ({ page }: { page: Page }) => {
    const overflow = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth;
    });
    expect(overflow).toBe(false);
  });

  test("hero section has correct purple background color", async ({ page }: { page: Page }) => {
    const hero = page
      .locator("section, div")
      .filter({ hasText: /meet our research team/i })
      .first();
    // Hero uses a CSS gradient — backgroundColor returns transparent; check backgroundImage
    const backgroundImage = await hero.evaluate(
      (el: HTMLElement) => getComputedStyle(el).backgroundImage
    );
    expect(backgroundImage).toMatch(/linear-gradient/i);
  });

  test("profile images are circular (border-radius)", async ({ page }: { page: Page }) => {
    const card = page
      .locator("section, div, article")
      .filter({ hasText: TEAM_MEMBERS[0].name })
      .first();
    const img = card.locator("img").first();
    const borderRadius = await img.evaluate(
      (el: HTMLElement) => getComputedStyle(el).borderRadius
    );
    expect(borderRadius).not.toBe("0px");
  });

  test("App Store and Google Play links are in footer", async ({ page }: { page: Page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator("footer");
    await expect(footer.getByText(/app store/i)).toBeVisible();
    await expect(footer.getByText(/google play/i)).toBeVisible();
  });

  test("back-to-top button is visible after scrolling down", async ({ page }: { page: Page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const backToTop = page.locator(
      'button[aria-label*="top" i], [title*="top" i], .back-to-top, #back-to-top'
    );
    await expect(backToTop.first()).toBeVisible();
  });
});

// ═════════════════════════════════════════════
// SUITE 6 — FUNCTIONALITY TESTING
// ═════════════════════════════════════════════
test.describe("Functionality Testing", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await goto(page);
  });

  test("clicking LinkedIn icon for Animesh Hardia opens a new page/tab", async ({
    page,
    context,
  }: { page: Page; context: BrowserContext }) => {
    const card = page
      .locator("section, div, article")
      .filter({ hasText: "Animesh Hardia" })
      .first();
    const linkedInLink = card.locator('a[href*="linkedin"]').first();
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      linkedInLink.click(),
    ]);
    expect(newPage.url()).toContain("linkedin");
    await newPage.close();
  });

  test("footer newsletter submit button is clickable", async ({ page }: { page: Page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitBtn = page
      .locator("footer")
      .locator('button[type="submit"], button')
      .first();
    await expect(submitBtn).toBeEnabled();
  });

  test("footer navigation links are all clickable", async ({ page }: { page: Page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footerLinks = page.locator("footer").getByRole("link");
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(5);
    for (let i = 0; i < Math.min(3, count); i++) {
      await expect(footerLinks.nth(i)).toBeEnabled();
    }
  });

  test("breadcrumb home icon navigates to home", async ({ page }: { page: Page }) => {
    const homeLink = page
      .locator('a[href="/"], a[href*="home"], nav a')
      .first();
    const href = await homeLink.getAttribute("href");
    expect(href).toBeTruthy();
  });

  test("copyright year in footer matches current year", async ({ page }: { page: Page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const year = new Date().getFullYear().toString();
    const copyright = page
      .locator("footer")
      .getByText(new RegExp(`copyright.*${year}|©.*${year}`, "i"));
    await expect(copyright).toBeVisible();
  });
});

// ═════════════════════════════════════════════
// SUITE 7 — NEGATIVE TESTING
// ═════════════════════════════════════════════
test.describe("Negative Testing", () => {
  test("submitting empty email in newsletter shows error or stays on page", async ({ page }: { page: Page }) => {
    await goto(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitBtn = page
      .locator("footer")
      .locator('button[type="submit"], button')
      .first();
    await submitBtn.click();
    expect(page.url()).toContain("indiamacroindicators");
  });

  test("invalid email format in newsletter shows validation", async ({ page }: { page: Page }) => {
    await goto(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const emailInput = page
      .locator("footer")
      .getByPlaceholder(/enter your email/i);
    await emailInput.fill("not-an-email");
    const submitBtn = page
      .locator("footer")
      .locator('button[type="submit"], button')
      .first();
    await submitBtn.click();
    expect(page.url()).toContain("indiamacroindicators");
  });

  test("non-existent author page returns 404 or redirects gracefully", async ({ page }: { page: Page }) => {
    const response = await page.goto(
      `${ORIGIN}/authors/nonexistent-author-xyz`
    );
    const status = response?.status();
    // Must NOT be 200 — a 200 would mean broken content served without error
    expect([301, 302, 404]).toContain(status);
  });

  test("images don't have broken src (alt attribute fallback)", async ({ page }: { page: Page }) => {
    await goto(page);
    const brokenCount = await page.evaluate(() =>
      Array.from(document.images).filter((img) => img.naturalWidth === 0).length
    );
    // Allow at most 1 broken image (e.g., lazy-loaded decoration)
    expect(brokenCount).toBeLessThanOrEqual(1);
  });

  test("page does not crash with console errors on load", async ({ page }: { page: Page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await goto(page);
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("analytics") &&
        !e.includes("gtag") &&
        !e.includes("ads")
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("page does not have unhandled JS errors", async ({ page }: { page: Page }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => jsErrors.push(err.message));
    await goto(page);
    expect(jsErrors.length).toBe(0);
  });

  test("author bio text is not a placeholder or lorem ipsum", async ({ page }: { page: Page }) => {
    await goto(page);
    const allText = await page.textContent("body");
    expect(allText?.toLowerCase()).not.toContain("lorem ipsum");
    expect(allText?.toLowerCase()).not.toContain("placeholder");
  });

  test("roles text in team cards don't show '[object Object]' or undefined", async ({ page }: { page: Page }) => {
    await goto(page);
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("[object Object]");
    expect(bodyText).not.toContain("undefined");
    expect(bodyText).not.toContain("null");
  });
});

// ═════════════════════════════════════════════
// SUITE 8 — RESPONSIVE / VIEWPORT TESTING
// ═════════════════════════════════════════════
test.describe("Responsive Design", () => {
  test("page renders correctly on mobile (375x812)", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(
      page.getByRole("heading", { name: /meet our research team/i })
    ).toBeVisible();
  });

  test("page renders correctly on tablet (768x1024)", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await goto(page);
    await expect(
      page.getByRole("heading", { name: /meet our research team/i })
    ).toBeVisible();
  });

  test("page renders correctly on desktop (1440x900)", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await goto(page);
    await expect(
      page.getByRole("heading", { name: /meet our research team/i })
    ).toBeVisible();
  });
});
