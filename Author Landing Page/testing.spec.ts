import { test, expect, Page, BrowserContext, APIRequestContext } from "@playwright/test";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const BASE_URL = "https://qa.indiamacroindicators.co.in/authors";
const ORIGIN = new URL(BASE_URL).origin;




async function goto(page: Page) {
  await page.goto(BASE_URL, { waitUntil: "load" });
  // Wait for RSC streaming to finish rendering the hero heading
  await page.getByRole("heading", { name: /meet our research team/i }).waitFor({ timeout: 15000 });
}



function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


// SUITE 1
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


    const textToStarch = page
      .locator('h2.mb-8.mt-10.text-center.text-3xl.font-semibold')
      .filter({ hasText: /research team/i })
      .first();

    await expect(textToStarch).toBeVisible();

    // 'mb-8 mt-10 text-center text-3xl font-semibold'
  });

  test("breadcrumb shows 'Research Team'", async ({ page }: { page: Page }) => {
    await goto(page);
    const breadcrumb = page
      .locator('p.text-sm.font-medium.leading-5')
      .filter({ hasText: /authors/i })
      .first();

    console.log("Breadcrumb text content:", await breadcrumb.textContent());
    await expect(breadcrumb).toBeVisible();
  });

  test("breadcrumb shows 'Authors' new test case", async ({ page }: { page: Page }) => {
    await goto(page);
    const breadcrumb = page.locator('p.text-sm.font-medium.leading-5', { hasText: /authors/i }).first();

    console.log("Breadcrumb text content:", await breadcrumb.textContent());
    await expect(breadcrumb).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// SUITE 2 — Hero Banner Section
// ─────────────────────────────────────────────
test.describe("Hero Banner Section", () => {

  // ── 2.1  Structural presence ──────────────────────────────────────────
  test("hero banner wrapper is present in DOM", async ({ page }: { page: Page }) => {
    await goto(page);
    const banner = page.locator("div.bg-gradient-to-r").first();
    await expect(banner).toBeAttached();
  });

  test("hero banner is visible on screen", async ({ page }: { page: Page }) => {
    await goto(page);
    const banner = page.locator("div.bg-gradient-to-r").first();
    await expect(banner).toBeVisible();
  });

  // ── 2.2  Heading ──────────────────────────────────────────────────────
  test("hero heading renders exact text 'Meet Our Research Team'", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.getByRole("heading", { name: "Meet Our Research Team", exact: true });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("Meet Our Research Team");
  });

  test("hero heading is an <h1> element", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h1").filter({ hasText: /meet our research team/i }).first();
    await expect(heading).toBeVisible();
  });

  test("hero heading carries white-text styling class", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h1").filter({ hasText: /meet our research team/i }).first();
    await expect(heading).toHaveClass(/text-white/);
  });

  test("hero heading carries font-semibold class", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h1").filter({ hasText: /meet our research team/i }).first();
    await expect(heading).toHaveClass(/font-semibold/);
  });

  test("hero heading carries text-center class", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h1").filter({ hasText: /meet our research team/i }).first();
    await expect(heading).toHaveClass(/text-center/);
  });

  test("hero heading carries text-4xl class (desktop size)", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h1").filter({ hasText: /meet our research team/i }).first();
    await expect(heading).toHaveClass(/text-4xl/);
  });

  // ── 2.3  Subtitle paragraph ───────────────────────────────────────────
  test("hero subtitle paragraph is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const subtitle = page.locator("p").filter({
      hasText: /get to know our team of editors/i,
    }).first();
    await expect(subtitle).toBeVisible();
  });

  test("hero subtitle renders the full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const expectedText =
      "Get to know our team of editors, behind India Macro Indicators bringing you the most relevant news, insights and analysis for your financial journey.";
    const subtitle = page.locator("p").filter({ hasText: expectedText }).first();
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toHaveText(expectedText);
  });

  test("hero subtitle contains keyword 'India Macro Indicators'", async ({ page }: { page: Page }) => {
    await goto(page);
    const subtitle = page.locator("p").filter({ hasText: /india macro indicators/i }).first();
    await expect(subtitle).toBeVisible();
  });

  test("hero subtitle carries text-center class", async ({ page }: { page: Page }) => {
    await goto(page);
    const subtitle = page.locator("p").filter({ hasText: /get to know our team of editors/i }).first();
    await expect(subtitle).toHaveClass(/text-center/);
  });

  test("hero subtitle carries text-xl class (desktop size)", async ({ page }: { page: Page }) => {
    await goto(page);
    const subtitle = page.locator("p").filter({ hasText: /get to know our team of editors/i }).first();
    await expect(subtitle).toHaveClass(/text-xl/);
  });

  // ── 2.4  Gradient background ──────────────────────────────────────────
  test("hero banner wrapper has gradient 'from-' purple class", async ({ page }: { page: Page }) => {
    await goto(page);
    const banner = page.locator("div.bg-gradient-to-r").first();
    // Tailwind JIT generates the literal class name in the DOM
    await expect(banner).toHaveClass(/from-\[#53389e\]/);
  });

  test("hero banner wrapper has gradient 'to-' purple class", async ({ page }: { page: Page }) => {
    await goto(page);
    const banner = page.locator("div.bg-gradient-to-r").first();
    await expect(banner).toHaveClass(/to-\[#8672be\]/);
  });

  test("hero banner wrapper has horizontal gradient direction class", async ({ page }: { page: Page }) => {
    await goto(page);
    const banner = page.locator("div.bg-gradient-to-r").first();
    await expect(banner).toHaveClass(/bg-gradient-to-r/);
  });

  test("hero banner has vertical padding class py-12", async ({ page }: { page: Page }) => {
    await goto(page);
    const banner = page.locator("div.bg-gradient-to-r").first();
    await expect(banner).toHaveClass(/py-12/);
  });

  // ── 2.5  Layout & containment ─────────────────────────────────────────
  test("inner content wrapper has max-w-3xl constraint", async ({ page }: { page: Page }) => {
    await goto(page);
    const inner = page.locator("div.max-w-3xl").first();
    await expect(inner).toBeVisible();
  });

  test("inner content wrapper is horizontally centred (m-auto)", async ({ page }: { page: Page }) => {
    await goto(page);
    const inner = page.locator("div.m-auto.max-w-3xl").first();
    await expect(inner).toBeAttached();
  });

  test("heading and subtitle are both children of the same inner wrapper", async ({ page }: { page: Page }) => {
    await goto(page);
    const wrapper = page.locator("div.m-auto.max-w-3xl").first();
    const heading = wrapper.locator("h1").filter({ hasText: /meet our research team/i });
    const subtitle = wrapper.locator("p").filter({ hasText: /get to know our team of editors/i });
    await expect(heading).toBeVisible();
    await expect(subtitle).toBeVisible();
  });

  // ── 2.6  Responsive (mobile viewport) ────────────────────────────────
  test("hero heading carries mobile responsive class 'mobile:text-xl'", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h1").filter({ hasText: /meet our research team/i }).first();
    // Class attribute contains the mobile variant token
    const cls = await heading.getAttribute("class") ?? "";
    expect(cls).toMatch(/mobile:text-xl/);
  });

  test("hero subtitle carries mobile responsive class 'mobile:text-xs'", async ({ page }: { page: Page }) => {
    await goto(page);
    const subtitle = page.locator("p").filter({ hasText: /get to know our team of editors/i }).first();
    const cls = await subtitle.getAttribute("class") ?? "";
    expect(cls).toMatch(/mobile:text-xs/);
  });

  test("hero banner is visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    const banner = page.locator("div.bg-gradient-to-r").first();
    await expect(banner).toBeVisible();
  });

  test("hero heading remains visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(
      page.getByRole("heading", { name: /meet our research team/i })
    ).toBeVisible();
  });

  // ── 2.7  Accessibility ────────────────────────────────────────────────
  test("hero heading is reachable via ARIA role 'heading'", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.getByRole("heading", { name: /meet our research team/i })
    ).toHaveCount(1);
  });

  test("hero heading is the first h1 on the page", async ({ page }: { page: Page }) => {
    await goto(page);
    const firstH1 = page.locator("h1").first();
    await expect(firstH1).toHaveText(/meet our research team/i);
  });

  test("hero banner text nodes are not empty", async ({ page }: { page: Page }) => {
    await goto(page);
    const headingText = await page.locator("h1").filter({ hasText: /meet our research team/i }).first().innerText();
    const subtitleText = await page.locator("p").filter({ hasText: /get to know our team of editors/i }).first().innerText();
    expect(headingText.trim().length).toBeGreaterThan(0);
    expect(subtitleText.trim().length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// SUITE 3 — "Research Team" Section Heading
// ─────────────────────────────────────────────
test.describe("Research Team Section Heading", () => {

  // ── 3.1  Presence & visibility ────────────────────────────────────────
  test("'Research Team' h2 heading is present in the DOM", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h2").filter({ hasText: /^research team$/i }).first();
    await expect(heading).toBeAttached();
  });

  test("'Research Team' h2 heading is visible on screen", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h2").filter({ hasText: /^research team$/i }).first();
    await expect(heading).toBeVisible();
  });

  test("'Research Team' heading is reachable via ARIA role 'heading'", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.getByRole("heading", { name: /^research team$/i })
    ).toBeVisible();
  });

  // ── 3.2  Exact text content ───────────────────────────────────────────
  test("heading renders exact text 'Research Team'", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h2").filter({ hasText: /^research team$/i }).first();
    await expect(heading).toHaveText("Research Team");
  });

  test("heading text is not empty", async ({ page }: { page: Page }) => {
    await goto(page);
    const text = await page
      .locator("h2")
      .filter({ hasText: /^research team$/i })
      .first()
      .innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  // ── 3.3  Tag ──────────────────────────────────────────────────────────
  test("'Research Team' heading uses an <h2> tag (not h1 or h3)", async ({ page }: { page: Page }) => {
    await goto(page);
    // Must be exactly h2 — not h1 or h3
    const h2 = page.locator("h2").filter({ hasText: /^research team$/i }).first();
    await expect(h2).toBeVisible();

    const h1 = page.locator("h1").filter({ hasText: /^research team$/i });
    await expect(h1).toHaveCount(0);

    const h3 = page.locator("h3").filter({ hasText: /^research team$/i });
    await expect(h3).toHaveCount(0);
  });

  // ── 3.4  Typography classes ───────────────────────────────────────────
  test("heading carries font-semibold class", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h2").filter({ hasText: /^research team$/i }).first();
    await expect(heading).toHaveClass(/font-semibold/);
  });

  test("heading carries text-center class", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h2").filter({ hasText: /^research team$/i }).first();
    await expect(heading).toHaveClass(/text-center/);
  });

  test("heading carries text-3xl class (desktop size)", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h2").filter({ hasText: /^research team$/i }).first();
    await expect(heading).toHaveClass(/text-3xl/);
  });

  test("heading carries dark-color class text-[#101828]", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h2").filter({ hasText: /^research team$/i }).first();
    await expect(heading).toHaveClass(/text-\[#101828\]/);
  });

  test("heading carries custom line-height class leading-[38px]", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h2").filter({ hasText: /^research team$/i }).first();
    await expect(heading).toHaveClass(/leading-\[38px\]/);
  });

  // ── 3.5  Spacing classes ──────────────────────────────────────────────
  test("heading carries top-margin class mt-10", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h2").filter({ hasText: /^research team$/i }).first();
    await expect(heading).toHaveClass(/mt-10/);
  });

  test("heading carries bottom-margin class mb-8", async ({ page }: { page: Page }) => {
    await goto(page);
    const heading = page.locator("h2").filter({ hasText: /^research team$/i }).first();
    await expect(heading).toHaveClass(/mb-8/);
  });

  // ── 3.6  Responsive (mobile classes) ─────────────────────────────────
  test("heading carries mobile font-size class 'mobile:text-xl'", async ({ page }: { page: Page }) => {
    await goto(page);
    const cls = await page
      .locator("h2")
      .filter({ hasText: /^research team$/i })
      .first()
      .getAttribute("class") ?? "";
    expect(cls).toMatch(/mobile:text-xl/);
  });

  test("heading carries mobile line-height class 'mobile:leading-[30px]'", async ({ page }: { page: Page }) => {
    await goto(page);
    const cls = await page
      .locator("h2")
      .filter({ hasText: /^research team$/i })
      .first()
      .getAttribute("class") ?? "";
    expect(cls).toMatch(/mobile:leading-\[30px\]/);
  });

  test("heading carries mobile margin class 'mobile:my-6'", async ({ page }: { page: Page }) => {
    await goto(page);
    const cls = await page
      .locator("h2")
      .filter({ hasText: /^research team$/i })
      .first()
      .getAttribute("class") ?? "";
    expect(cls).toMatch(/mobile:my-6/);
  });

  test("'Research Team' heading is visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(
      page.getByRole("heading", { name: /^research team$/i })
    ).toBeVisible();
  });

  // ── 3.7  Page hierarchy ───────────────────────────────────────────────
  test("'Research Team' h2 appears after the hero h1 in DOM order", async ({ page }: { page: Page }) => {
    await goto(page);
    const h1Box = await page
      .locator("h1")
      .filter({ hasText: /meet our research team/i })
      .first()
      .boundingBox();
    const h2Box = await page
      .locator("h2")
      .filter({ hasText: /^research team$/i })
      .first()
      .boundingBox();

    expect(h1Box).not.toBeNull();
    expect(h2Box).not.toBeNull();
    // h2 must start below h1 vertically
    expect(h2Box!.y).toBeGreaterThan(h1Box!.y);
  });

  test("exactly one 'Research Team' h2 exists on the page", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.locator("h2").filter({ hasText: /^research team$/i })
    ).toHaveCount(1);
  });
});

// ─────────────────────────────────────────────
// SUITE 4 — Research Team Member Card (Ravi Aswani)
// ─────────────────────────────────────────────
test.describe("Research Team Member Card — Ravi Aswani", () => {

  // Shared locator helper — the card root scoped to this author
  const cardRoot = (page: Page) =>
    page.locator("div.flex.w-full.flex-col.items-center.gap-5")
      .filter({ has: page.locator('a[href="/authors/ravi-aswani"]') })
      .first();

  // ── 4.1  Card structure ───────────────────────────────────────────────
  test("Ravi Aswani card is present in the DOM", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(cardRoot(page)).toBeAttached();
  });

  test("Ravi Aswani card is visible on screen", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(cardRoot(page)).toBeVisible();
  });

  // ── 4.2  Avatar / profile image ───────────────────────────────────────
  test("avatar wrapper is a rounded circle (rounded-full) and sized h-20 w-20", async ({ page }: { page: Page }) => {
    await goto(page);
    const avatar = cardRoot(page).locator("div.relative.h-20.w-20.rounded-full").first();
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveClass(/rounded-full/);
    await expect(avatar).toHaveClass(/h-20/);
    await expect(avatar).toHaveClass(/w-20/);
  });

  test("avatar image is visible and has correct alt text 'Ravi Aswani'", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Ravi Aswani']").first();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("alt", "Ravi Aswani");
  });

  test("avatar image src points to the expected S3 URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Ravi Aswani']").first();
    const src = await img.getAttribute("src") ?? "";
    expect(src).toMatch(/macro-crypto\.s3\.ap-south-1\.amazonaws\.com/);
  });

  test("avatar image loads without error (naturalWidth > 0)", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Ravi Aswani']").first();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("avatar image carries object-cover and rounded-full styling", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Ravi Aswani']").first();
    await expect(img).toHaveClass(/object-cover/);
    await expect(img).toHaveClass(/rounded-full/);
  });

  test("avatar image is wrapped in a link to '/authors/ravi-aswani'", async ({ page }: { page: Page }) => {
    await goto(page);
    const avatarLink = cardRoot(page)
      .locator("div.relative.h-20.w-20")
      .locator("a[href='/authors/ravi-aswani']")
      .first();
    await expect(avatarLink).toBeAttached();
  });

  // ── 4.3  Author name ──────────────────────────────────────────────────
  test("author name 'Ravi Aswani' is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Ravi Aswani" })
      .first();
    await expect(nameLink).toBeVisible();
  });

  test("author name renders exact text 'Ravi Aswani'", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Ravi Aswani" })
      .first();
    await expect(nameLink).toHaveText("Ravi Aswani");
  });

  test("author name link points to '/authors/ravi-aswani'", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Ravi Aswani" })
      .first();
    await expect(nameLink).toHaveAttribute("href", "/authors/ravi-aswani");
  });

  test("author name carries font-semibold and text-[#101828] classes", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Ravi Aswani" })
      .first();
    await expect(nameLink).toHaveClass(/font-semibold/);
    await expect(nameLink).toHaveClass(/text-\[#101828\]/);
  });

  // ── 4.4  Designation ─────────────────────────────────────────────────
  test("designation text is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /assistant vice president.*macroeconomics research/i })
      .first();
    await expect(designation).toBeVisible();
  });

  test("designation renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /assistant vice president.*macroeconomics research/i })
      .first();
    await expect(designation).toHaveText(
      "Assistant Vice President, Macroeconomics Research | @1Finance"
    );
  });

  test("designation link points to '/authors/ravi-aswani'", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /assistant vice president.*macroeconomics research/i })
      .first();
    await expect(designation).toHaveAttribute("href", "/authors/ravi-aswani");
  });

  test("designation carries purple-color class text-[#6941c6]", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /assistant vice president.*macroeconomics research/i })
      .first();
    await expect(designation).toHaveClass(/text-\[#6941c6\]/);
  });

  // ── 4.5  Bio paragraph ────────────────────────────────────────────────
  test("bio paragraph is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /ravi aswani is assistant vice president/i })
      .first();
    await expect(bio).toBeVisible();
  });

  test("bio paragraph renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /ravi aswani is assistant vice president/i })
      .first();
    await expect(bio).toHaveText(
      "Ravi Aswani is Assistant Vice President at 1 Finance, specialising in macroeconomic analysis, econometric modelling, and delivering data-driven market insights."
    );
  });

  test("bio paragraph carries muted-color class text-[#475467]", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /ravi aswani is assistant vice president/i })
      .first();
    await expect(bio).toHaveClass(/text-\[#475467\]/);
  });

  test("bio paragraph text is not empty", async ({ page }: { page: Page }) => {
    await goto(page);
    const text = await cardRoot(page)
      .locator("p", { hasText: /ravi aswani is assistant vice president/i })
      .first()
      .innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  // ── 4.6  Social links ─────────────────────────────────────────────────
  test("LinkedIn social icon link is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const li = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/aswani-ravi/']")
      .first();
    await expect(li).toBeVisible();
  });

  test("LinkedIn link points to correct URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const li = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/aswani-ravi/']")
      .first();
    await expect(li).toHaveAttribute("href", "https://www.linkedin.com/in/aswani-ravi/");
  });

  test("LinkedIn icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/aswani-ravi/'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("email (mailto) social link is visible and points to correct address", async ({ page }: { page: Page }) => {
    await goto(page);
    const mail = cardRoot(page)
      .locator("a[href='mailto:ravi.aswani@1finance.co.in']")
      .first();
    await expect(mail).toBeVisible();
    await expect(mail).toHaveAttribute("href", "mailto:ravi.aswani@1finance.co.in");
  });

  test("email icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='mailto:ravi.aswani@1finance.co.in'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("Twitter/X social link is visible and points to correct URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const tw = cardRoot(page)
      .locator("a[href='https://x.com/RaviAswani25643']")
      .first();
    await expect(tw).toBeVisible();
    await expect(tw).toHaveAttribute("href", "https://x.com/RaviAswani25643");
  });

  test("Twitter/X icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='https://x.com/RaviAswani25643'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("exactly 3 social icon links are present in the card", async ({ page }: { page: Page }) => {
    await goto(page);
    const socialRow = cardRoot(page)
      .locator("div.flex.items-center.gap-5")
      .first();
    await expect(socialRow.locator("a")).toHaveCount(3);
  });

  // ── 4.7  Navigation ───────────────────────────────────────────────────
  test("clicking author name navigates to the author detail page", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Ravi Aswani" })
      .first();
    await nameLink.click();
    await page.waitForURL(/\/authors\/ravi-aswani/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/authors\/ravi-aswani/);
  });

  // ── 4.8  Responsive (375-px mobile viewport) ──────────────────────────
  test("card is fully visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(cardRoot(page)).toBeVisible();
  });

  test("avatar image is visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(
      cardRoot(page).locator("img[alt='Ravi Aswani']").first()
    ).toBeVisible();
  });

  test("social links row carries mobile layout classes", async ({ page }: { page: Page }) => {
    await goto(page);
    const socialRow = cardRoot(page)
      .locator("div.flex.items-center.gap-5")
      .first();
    const cls = await socialRow.getAttribute("class") ?? "";
    expect(cls).toMatch(/mobile:justify-center/);
    expect(cls).toMatch(/mobile:gap-4/);
  });
});

// ─────────────────────────────────────────────
// SUITE 5 — Research Team Member Card (Purvang Mashru)
// ─────────────────────────────────────────────
test.describe("Research Team Member Card — Purvang Mashru", () => {

  // Shared locator helper — scoped to this author's card
  const cardRoot = (page: Page) =>
    page.locator("div.flex.w-full.flex-col.items-center.gap-5")
      .filter({ has: page.locator('a[href="/authors/purvang-mashru"]') })
      .first();

  // ── 5.1  Card structure ───────────────────────────────────────────────
  test("Purvang Mashru card is present in the DOM", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(cardRoot(page)).toBeAttached();
  });

  test("Purvang Mashru card is visible on screen", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(cardRoot(page)).toBeVisible();
  });

  // ── 5.2  Avatar / profile image ───────────────────────────────────────
  test("avatar wrapper is a rounded circle (rounded-full) and sized h-20 w-20", async ({ page }: { page: Page }) => {
    await goto(page);
    const avatar = cardRoot(page).locator("div.relative.h-20.w-20.rounded-full").first();
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveClass(/rounded-full/);
    await expect(avatar).toHaveClass(/h-20/);
    await expect(avatar).toHaveClass(/w-20/);
  });

  test("avatar image is visible and has correct alt text 'Purvang Mashru'", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Purvang Mashru']").first();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("alt", "Purvang Mashru");
  });

  test("avatar image src points to the expected S3 URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Purvang Mashru']").first();
    const src = await img.getAttribute("src") ?? "";
    expect(src).toMatch(/macro-crypto\.s3\.ap-south-1\.amazonaws\.com/);
  });

  test("avatar image loads without error (naturalWidth > 0)", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Purvang Mashru']").first();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("avatar image carries object-cover and rounded-full styling", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Purvang Mashru']").first();
    await expect(img).toHaveClass(/object-cover/);
    await expect(img).toHaveClass(/rounded-full/);
  });

  test("avatar image is wrapped in a link to '/authors/purvang-mashru'", async ({ page }: { page: Page }) => {
    await goto(page);
    const avatarLink = cardRoot(page)
      .locator("div.relative.h-20.w-20")
      .locator("a[href='/authors/purvang-mashru']")
      .first();
    await expect(avatarLink).toBeAttached();
  });

  // ── 5.3  Author name ──────────────────────────────────────────────────
  test("author name 'Purvang Mashru' is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Purvang Mashru" })
      .first();
    await expect(nameLink).toBeVisible();
  });

  test("author name renders exact text 'Purvang Mashru'", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Purvang Mashru" })
      .first();
    await expect(nameLink).toHaveText("Purvang Mashru");
  });

  test("author name link points to '/authors/purvang-mashru'", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Purvang Mashru" })
      .first();
    await expect(nameLink).toHaveAttribute("href", "/authors/purvang-mashru");
  });

  test("author name carries font-semibold and text-[#101828] classes", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Purvang Mashru" })
      .first();
    await expect(nameLink).toHaveClass(/font-semibold/);
    await expect(nameLink).toHaveClass(/text-\[#101828\]/);
  });

  // ── 5.4  Designation ─────────────────────────────────────────────────
  test("designation text is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /senior quantitative research analyst/i })
      .first();
    await expect(designation).toBeVisible();
  });

  test("designation renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /senior quantitative research analyst/i })
      .first();
    await expect(designation).toHaveText(
      "Senior Quantitative Research Analyst | @1Finance"
    );
  });

  test("designation link points to '/authors/purvang-mashru'", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /senior quantitative research analyst/i })
      .first();
    await expect(designation).toHaveAttribute("href", "/authors/purvang-mashru");
  });

  test("designation carries purple-color class text-[#6941c6]", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /senior quantitative research analyst/i })
      .first();
    await expect(designation).toHaveClass(/text-\[#6941c6\]/);
  });

  // ── 5.5  Bio paragraph ────────────────────────────────────────────────
  test("bio paragraph is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /purvang builds macro indicator frameworks/i })
      .first();
    await expect(bio).toBeVisible();
  });

  test("bio paragraph renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /purvang builds macro indicator frameworks/i })
      .first();
    await expect(bio).toHaveText(
      "Purvang builds macro indicator frameworks at 1 Finance, translating economic shifts into insights and helping investors position portfolios across changing cycles."
    );
  });

  test("bio paragraph carries muted-color class text-[#475467]", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /purvang builds macro indicator frameworks/i })
      .first();
    await expect(bio).toHaveClass(/text-\[#475467\]/);
  });

  test("bio paragraph text is not empty", async ({ page }: { page: Page }) => {
    await goto(page);
    const text = await cardRoot(page)
      .locator("p", { hasText: /purvang builds macro indicator frameworks/i })
      .first()
      .innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  // ── 5.6  Social links ─────────────────────────────────────────────────
  test("LinkedIn social icon link is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const li = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/purvangmashru/']")
      .first();
    await expect(li).toBeVisible();
  });

  test("LinkedIn link points to correct URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const li = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/purvangmashru/']")
      .first();
    await expect(li).toHaveAttribute("href", "https://www.linkedin.com/in/purvangmashru/");
  });

  test("LinkedIn icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/purvangmashru/'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("email (mailto) social link is visible and points to correct address", async ({ page }: { page: Page }) => {
    await goto(page);
    const mail = cardRoot(page)
      .locator("a[href='mailto:purvang.mashru@1finance.co.in']")
      .first();
    await expect(mail).toBeVisible();
    await expect(mail).toHaveAttribute("href", "mailto:purvang.mashru@1finance.co.in");
  });

  test("email icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='mailto:purvang.mashru@1finance.co.in'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("Twitter/X social link is visible and points to correct URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const tw = cardRoot(page)
      .locator("a[href='https://x.com/mashru_purvang']")
      .first();
    await expect(tw).toBeVisible();
    await expect(tw).toHaveAttribute("href", "https://x.com/mashru_purvang");
  });

  test("Twitter/X icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='https://x.com/mashru_purvang'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("exactly 3 social icon links are present in the card", async ({ page }: { page: Page }) => {
    await goto(page);
    const socialRow = cardRoot(page)
      .locator("div.flex.items-center.gap-5")
      .first();
    await expect(socialRow.locator("a")).toHaveCount(3);
  });

  // ── 5.7  Navigation ───────────────────────────────────────────────────
  test("clicking author name navigates to the author detail page", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Purvang Mashru" })
      .first();
    await nameLink.click();
    await page.waitForURL(/\/authors\/purvang-mashru/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/authors\/purvang-mashru/);
  });

  // ── 5.8  Responsive (375-px mobile viewport) ──────────────────────────
  test("card is fully visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(cardRoot(page)).toBeVisible();
  });

  test("avatar image is visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(
      cardRoot(page).locator("img[alt='Purvang Mashru']").first()
    ).toBeVisible();
  });

  test("social links row carries mobile layout classes", async ({ page }: { page: Page }) => {
    await goto(page);
    const socialRow = cardRoot(page)
      .locator("div.flex.items-center.gap-5")
      .first();
    const cls = await socialRow.getAttribute("class") ?? "";
    expect(cls).toMatch(/mobile:justify-center/);
    expect(cls).toMatch(/mobile:gap-4/);
  });
});

// ─────────────────────────────────────────────
// SUITE 6 — Research Team Member Card (Sanya Agarwal)
// ─────────────────────────────────────────────
test.describe("Research Team Member Card — Sanya Agarwal", () => {

  // Shared locator helper — scoped to this author's card
  const cardRoot = (page: Page) =>
    page.locator("div.flex.w-full.flex-col.items-center.gap-5")
      .filter({ has: page.locator('a[href="/authors/sanya-agarwal"]') })
      .first();

  // ── 6.1  Card structure ───────────────────────────────────────────────
  test("Sanya Agarwal card is present in the DOM", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(cardRoot(page)).toBeAttached();
  });

  test("Sanya Agarwal card is visible on screen", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(cardRoot(page)).toBeVisible();
  });

  // ── 6.2  Avatar / profile image ───────────────────────────────────────
  test("avatar wrapper is a rounded circle (rounded-full) and sized h-20 w-20", async ({ page }: { page: Page }) => {
    await goto(page);
    const avatar = cardRoot(page).locator("div.relative.h-20.w-20.rounded-full").first();
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveClass(/rounded-full/);
    await expect(avatar).toHaveClass(/h-20/);
    await expect(avatar).toHaveClass(/w-20/);
  });

  test("avatar image is visible and has correct alt text 'Sanya Agarwal'", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Sanya Agarwal']").first();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("alt", "Sanya Agarwal");
  });

  test("avatar image src points to the expected S3 URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Sanya Agarwal']").first();
    const src = await img.getAttribute("src") ?? "";
    expect(src).toMatch(/macro-crypto\.s3\.ap-south-1\.amazonaws\.com/);
  });

  test("avatar image loads without error (naturalWidth > 0)", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Sanya Agarwal']").first();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("avatar image carries object-cover and rounded-full styling", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Sanya Agarwal']").first();
    await expect(img).toHaveClass(/object-cover/);
    await expect(img).toHaveClass(/rounded-full/);
  });

  test("avatar image is wrapped in a link to '/authors/sanya-agarwal'", async ({ page }: { page: Page }) => {
    await goto(page);
    const avatarLink = cardRoot(page)
      .locator("div.relative.h-20.w-20")
      .locator("a[href='/authors/sanya-agarwal']")
      .first();
    await expect(avatarLink).toBeAttached();
  });

  // ── 6.3  Author name ──────────────────────────────────────────────────
  test("author name 'Sanya Agarwal' is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Sanya Agarwal" })
      .first();
    await expect(nameLink).toBeVisible();
  });

  test("author name renders exact text 'Sanya Agarwal'", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Sanya Agarwal" })
      .first();
    await expect(nameLink).toHaveText("Sanya Agarwal");
  });

  test("author name link points to '/authors/sanya-agarwal'", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Sanya Agarwal" })
      .first();
    await expect(nameLink).toHaveAttribute("href", "/authors/sanya-agarwal");
  });

  test("author name carries font-semibold and text-[#101828] classes", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Sanya Agarwal" })
      .first();
    await expect(nameLink).toHaveClass(/font-semibold/);
    await expect(nameLink).toHaveClass(/text-\[#101828\]/);
  });

  // ── 6.4  Designation ─────────────────────────────────────────────────
  test("designation text is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toBeVisible();
  });

  test("designation renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toHaveText("Quantitative Research Analyst | @1Finance");
  });

  test("designation link points to '/authors/sanya-agarwal'", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toHaveAttribute("href", "/authors/sanya-agarwal");
  });

  test("designation carries purple-color class text-[#6941c6]", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toHaveClass(/text-\[#6941c6\]/);
  });

  // ── 6.5  Bio paragraph ────────────────────────────────────────────────
  test("bio paragraph is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /sanya is a quantitative research analyst/i })
      .first();
    await expect(bio).toBeVisible();
  });

  test("bio paragraph renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /sanya is a quantitative research analyst/i })
      .first();
    await expect(bio).toHaveText(
      "Sanya is a Quantitative Research Analyst tracking macro trends and commodity cycles, helping investors identify risks and navigate changing global markets."
    );
  });

  test("bio paragraph carries muted-color class text-[#475467]", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /sanya is a quantitative research analyst/i })
      .first();
    await expect(bio).toHaveClass(/text-\[#475467\]/);
  });

  test("bio paragraph text is not empty", async ({ page }: { page: Page }) => {
    await goto(page);
    const text = await cardRoot(page)
      .locator("p", { hasText: /sanya is a quantitative research analyst/i })
      .first()
      .innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  // ── 6.6  Social links ─────────────────────────────────────────────────
  test("LinkedIn social icon link is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const li = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/sanya-agarwal-/']")
      .first();
    await expect(li).toBeVisible();
  });

  test("LinkedIn link points to correct URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const li = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/sanya-agarwal-/']")
      .first();
    await expect(li).toHaveAttribute("href", "https://www.linkedin.com/in/sanya-agarwal-/");
  });

  test("LinkedIn icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/sanya-agarwal-/'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("email (mailto) social link is visible and points to correct address", async ({ page }: { page: Page }) => {
    await goto(page);
    const mail = cardRoot(page)
      .locator("a[href='mailto:sanya.agarwal@1finance.co.in']")
      .first();
    await expect(mail).toBeVisible();
    await expect(mail).toHaveAttribute("href", "mailto:sanya.agarwal@1finance.co.in");
  });

  test("email icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='mailto:sanya.agarwal@1finance.co.in'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("Twitter/X social link is visible and points to correct URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const tw = cardRoot(page)
      .locator("a[href='https://x.com/Sanyaagarwal87']")
      .first();
    await expect(tw).toBeVisible();
    await expect(tw).toHaveAttribute("href", "https://x.com/Sanyaagarwal87");
  });

  test("Twitter/X icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='https://x.com/Sanyaagarwal87'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("exactly 3 social icon links are present in the card", async ({ page }: { page: Page }) => {
    await goto(page);
    const socialRow = cardRoot(page)
      .locator("div.flex.items-center.gap-5")
      .first();
    await expect(socialRow.locator("a")).toHaveCount(3);
  });

  // ── 6.7  Navigation ───────────────────────────────────────────────────
  test("clicking author name navigates to the author detail page", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Sanya Agarwal" })
      .first();
    await nameLink.click();
    await page.waitForURL(/\/authors\/sanya-agarwal/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/authors\/sanya-agarwal/);
  });

  // ── 6.8  Responsive (375-px mobile viewport) ──────────────────────────
  test("card is fully visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(cardRoot(page)).toBeVisible();
  });

  test("avatar image is visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(
      cardRoot(page).locator("img[alt='Sanya Agarwal']").first()
    ).toBeVisible();
  });

  test("social links row carries mobile layout classes", async ({ page }: { page: Page }) => {
    await goto(page);
    const socialRow = cardRoot(page)
      .locator("div.flex.items-center.gap-5")
      .first();
    const cls = await socialRow.getAttribute("class") ?? "";
    expect(cls).toMatch(/mobile:justify-center/);
    expect(cls).toMatch(/mobile:gap-4/);
  });
});

// ─────────────────────────────────────────────
// SUITE 7 — Research Team Member Card (Dev Patel)
// ─────────────────────────────────────────────
test.describe("Research Team Member Card — Dev Patel", () => {

  // Shared locator helper — scoped to this author's card
  const cardRoot = (page: Page) =>
    page.locator("div.flex.w-full.flex-col.items-center.gap-5")
      .filter({ has: page.locator('a[href="/authors/dev-patel"]') })
      .first();

  // ── 7.1  Card structure ───────────────────────────────────────────────
  test("Dev Patel card is present in the DOM", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(cardRoot(page)).toBeAttached();
  });

  test("Dev Patel card is visible on screen", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(cardRoot(page)).toBeVisible();
  });

  // ── 7.2  Avatar / profile image ───────────────────────────────────────
  test("avatar wrapper is a rounded circle (rounded-full) and sized h-20 w-20", async ({ page }: { page: Page }) => {
    await goto(page);
    const avatar = cardRoot(page).locator("div.relative.h-20.w-20.rounded-full").first();
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveClass(/rounded-full/);
    await expect(avatar).toHaveClass(/h-20/);
    await expect(avatar).toHaveClass(/w-20/);
  });

  test("avatar image is visible and has correct alt text 'Dev Patel'", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Dev Patel']").first();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("alt", "Dev Patel");
  });

  test("avatar image src points to the expected S3 URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Dev Patel']").first();
    const src = await img.getAttribute("src") ?? "";
    expect(src).toMatch(/macro-crypto\.s3\.ap-south-1\.amazonaws\.com/);
  });

  test("avatar image loads without error (naturalWidth > 0)", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Dev Patel']").first();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("avatar image carries object-cover and rounded-full styling", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Dev Patel']").first();
    await expect(img).toHaveClass(/object-cover/);
    await expect(img).toHaveClass(/rounded-full/);
  });

  test("avatar image is wrapped in a link to '/authors/dev-patel'", async ({ page }: { page: Page }) => {
    await goto(page);
    const avatarLink = cardRoot(page)
      .locator("div.relative.h-20.w-20")
      .locator("a[href='/authors/dev-patel']")
      .first();
    await expect(avatarLink).toBeAttached();
  });

  // ── 7.3  Author name ──────────────────────────────────────────────────
  test("author name 'Dev Patel' is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Dev Patel" })
      .first();
    await expect(nameLink).toBeVisible();
  });

  test("author name renders exact text 'Dev Patel'", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Dev Patel" })
      .first();
    await expect(nameLink).toHaveText("Dev Patel");
  });

  test("author name link points to '/authors/dev-patel'", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Dev Patel" })
      .first();
    await expect(nameLink).toHaveAttribute("href", "/authors/dev-patel");
  });

  test("author name carries font-semibold and text-[#101828] classes", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Dev Patel" })
      .first();
    await expect(nameLink).toHaveClass(/font-semibold/);
    await expect(nameLink).toHaveClass(/text-\[#101828\]/);
  });

  // ── 7.4  Designation ─────────────────────────────────────────────────
  test("designation text is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toBeVisible();
  });

  test("designation renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toHaveText("Quantitative Research Analyst | @1Finance");
  });

  test("designation link points to '/authors/dev-patel'", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toHaveAttribute("href", "/authors/dev-patel");
  });

  test("designation carries purple-color class text-[#6941c6]", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toHaveClass(/text-\[#6941c6\]/);
  });

  // ── 7.5  Bio paragraph ────────────────────────────────────────────────
  test("bio paragraph is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /dev patel is a quantitative research analyst/i })
      .first();
    await expect(bio).toBeVisible();
  });

  test("bio paragraph renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /dev patel is a quantitative research analyst/i })
      .first();
    await expect(bio).toHaveText(
      "Dev Patel is a Quantitative Research Analyst specialising in personal finance, combining data and behavioural insights to guide asset allocation decisions."
    );
  });

  test("bio paragraph carries muted-color class text-[#475467]", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /dev patel is a quantitative research analyst/i })
      .first();
    await expect(bio).toHaveClass(/text-\[#475467\]/);
  });

  test("bio paragraph text is not empty", async ({ page }: { page: Page }) => {
    await goto(page);
    const text = await cardRoot(page)
      .locator("p", { hasText: /dev patel is a quantitative research analyst/i })
      .first()
      .innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  // ── 7.6  Social links ─────────────────────────────────────────────────
  test("LinkedIn social icon link is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const li = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/dev-patel6/']")
      .first();
    await expect(li).toBeVisible();
  });

  test("LinkedIn link points to correct URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const li = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/dev-patel6/']")
      .first();
    await expect(li).toHaveAttribute("href", "https://www.linkedin.com/in/dev-patel6/");
  });

  test("LinkedIn icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/dev-patel6/'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("email (mailto) social link is visible and points to correct address", async ({ page }: { page: Page }) => {
    await goto(page);
    const mail = cardRoot(page)
      .locator("a[href='mailto:dev.patel@1finance.co.in']")
      .first();
    await expect(mail).toBeVisible();
    await expect(mail).toHaveAttribute("href", "mailto:dev.patel@1finance.co.in");
  });

  test("email icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='mailto:dev.patel@1finance.co.in'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("Twitter/X social link is visible and points to correct URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const tw = cardRoot(page)
      .locator("a[href='https://x.com/devpatelx6']")
      .first();
    await expect(tw).toBeVisible();
    await expect(tw).toHaveAttribute("href", "https://x.com/devpatelx6");
  });

  test("Twitter/X icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='https://x.com/devpatelx6'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("exactly 3 social icon links are present in the card", async ({ page }: { page: Page }) => {
    await goto(page);
    const socialRow = cardRoot(page)
      .locator("div.flex.items-center.gap-5")
      .first();
    await expect(socialRow.locator("a")).toHaveCount(3);
  });

  // ── 7.7  Navigation ───────────────────────────────────────────────────
  test("clicking author name navigates to the author detail page", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Dev Patel" })
      .first();
    await nameLink.click();
    await page.waitForURL(/\/authors\/dev-patel/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/authors\/dev-patel/);
  });

  // ── 7.8  Responsive (375-px mobile viewport) ──────────────────────────
  test("card is fully visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(cardRoot(page)).toBeVisible();
  });

  test("avatar image is visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(
      cardRoot(page).locator("img[alt='Dev Patel']").first()
    ).toBeVisible();
  });

  test("social links row carries mobile layout classes", async ({ page }: { page: Page }) => {
    await goto(page);
    const socialRow = cardRoot(page)
      .locator("div.flex.items-center.gap-5")
      .first();
    const cls = await socialRow.getAttribute("class") ?? "";
    expect(cls).toMatch(/mobile:justify-center/);
    expect(cls).toMatch(/mobile:gap-4/);
  });
});

// ─────────────────────────────────────────────
// SUITE 8 — Research Team Member Card (Jessica Shah)
// NOTE: Jessica Shah has only 1 social link (LinkedIn).
//       Email and Twitter/X are intentionally absent.
// ─────────────────────────────────────────────
test.describe("Research Team Member Card — Jessica Shah", () => {

  // Shared locator helper — scoped to this author's card
  const cardRoot = (page: Page) =>
    page.locator("div.flex.w-full.flex-col.items-center.gap-5")
      .filter({ has: page.locator('a[href="/authors/jessica-shah"]') })
      .first();

  // ── 8.1  Card structure ───────────────────────────────────────────────
  test("Jessica Shah card is present in the DOM", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(cardRoot(page)).toBeAttached();
  });

  test("Jessica Shah card is visible on screen", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(cardRoot(page)).toBeVisible();
  });

  // ── 8.2  Avatar / profile image ───────────────────────────────────────
  test("avatar wrapper is a rounded circle (rounded-full) and sized h-20 w-20", async ({ page }: { page: Page }) => {
    await goto(page);
    const avatar = cardRoot(page).locator("div.relative.h-20.w-20.rounded-full").first();
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveClass(/rounded-full/);
    await expect(avatar).toHaveClass(/h-20/);
    await expect(avatar).toHaveClass(/w-20/);
  });

  test("avatar image is visible and has correct alt text 'Jessica Shah'", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Jessica Shah']").first();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("alt", "Jessica Shah");
  });

  test("avatar image src points to the expected S3 URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Jessica Shah']").first();
    const src = await img.getAttribute("src") ?? "";
    expect(src).toMatch(/macro-crypto\.s3\.ap-south-1\.amazonaws\.com/);
  });

  test("avatar image loads without error (naturalWidth > 0)", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Jessica Shah']").first();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("avatar image carries object-cover and rounded-full styling", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page).locator("img[alt='Jessica Shah']").first();
    await expect(img).toHaveClass(/object-cover/);
    await expect(img).toHaveClass(/rounded-full/);
  });

  test("avatar image is wrapped in a link to '/authors/jessica-shah'", async ({ page }: { page: Page }) => {
    await goto(page);
    const avatarLink = cardRoot(page)
      .locator("div.relative.h-20.w-20")
      .locator("a[href='/authors/jessica-shah']")
      .first();
    await expect(avatarLink).toBeAttached();
  });

  // ── 8.3  Author name ──────────────────────────────────────────────────
  test("author name 'Jessica Shah' is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Jessica Shah" })
      .first();
    await expect(nameLink).toBeVisible();
  });

  test("author name renders exact text 'Jessica Shah'", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Jessica Shah" })
      .first();
    await expect(nameLink).toHaveText("Jessica Shah");
  });

  test("author name link points to '/authors/jessica-shah'", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Jessica Shah" })
      .first();
    await expect(nameLink).toHaveAttribute("href", "/authors/jessica-shah");
  });

  test("author name carries font-semibold and text-[#101828] classes", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Jessica Shah" })
      .first();
    await expect(nameLink).toHaveClass(/font-semibold/);
    await expect(nameLink).toHaveClass(/text-\[#101828\]/);
  });

  // ── 8.4  Designation ─────────────────────────────────────────────────
  test("designation text is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toBeVisible();
  });

  test("designation renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toHaveText("Quantitative Research Analyst | @1Finance");
  });

  test("designation link points to '/authors/jessica-shah'", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toHaveAttribute("href", "/authors/jessica-shah");
  });

  test("designation carries purple-color class text-[#6941c6]", async ({ page }: { page: Page }) => {
    await goto(page);
    const designation = cardRoot(page)
      .locator("a", { hasText: /quantitative research analyst/i })
      .first();
    await expect(designation).toHaveClass(/text-\[#6941c6\]/);
  });

  // ── 8.5  Bio paragraph ────────────────────────────────────────────────
  test("bio paragraph is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /jessica shah is a quantitative research analyst/i })
      .first();
    await expect(bio).toBeVisible();
  });

  test("bio paragraph renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /jessica shah is a quantitative research analyst/i })
      .first();
    await expect(bio).toHaveText(
      "Jessica Shah is a Quantitative Research Analyst focusing on macro research and policy, translating economic trends into actionable portfolio insights for investors."
    );
  });

  test("bio paragraph carries muted-color class text-[#475467]", async ({ page }: { page: Page }) => {
    await goto(page);
    const bio = cardRoot(page)
      .locator("p", { hasText: /jessica shah is a quantitative research analyst/i })
      .first();
    await expect(bio).toHaveClass(/text-\[#475467\]/);
  });

  test("bio paragraph text is not empty", async ({ page }: { page: Page }) => {
    await goto(page);
    const text = await cardRoot(page)
      .locator("p", { hasText: /jessica shah is a quantitative research analyst/i })
      .first()
      .innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  // ── 8.6  Social links (LinkedIn only) ────────────────────────────────
  test("LinkedIn social icon link is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const li = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/jessica-shah-b40929220/']")
      .first();
    await expect(li).toBeVisible();
  });

  test("LinkedIn link points to correct URL", async ({ page }: { page: Page }) => {
    await goto(page);
    const li = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/jessica-shah-b40929220/']")
      .first();
    await expect(li).toHaveAttribute("href", "https://www.linkedin.com/in/jessica-shah-b40929220/");
  });

  test("LinkedIn icon image loads without error", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = cardRoot(page)
      .locator("a[href='https://www.linkedin.com/in/jessica-shah-b40929220/'] img")
      .first();
    await expect(img).toBeVisible();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("email (mailto) link is NOT present in this card", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      cardRoot(page).locator("a[href^='mailto:']")
    ).toHaveCount(0);
  });

  test("Twitter/X link is NOT present in this card", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      cardRoot(page).locator("a[href*='x.com']")
    ).toHaveCount(0);
  });

  test("exactly 1 social icon link is present in the card", async ({ page }: { page: Page }) => {
    await goto(page);
    const socialRow = cardRoot(page)
      .locator("div.flex.items-center.gap-5")
      .first();
    await expect(socialRow.locator("a")).toHaveCount(1);
  });

  // ── 8.7  Navigation ───────────────────────────────────────────────────
  test("clicking author name navigates to the author detail page", async ({ page }: { page: Page }) => {
    await goto(page);
    const nameLink = cardRoot(page)
      .locator("a.font-semibold", { hasText: "Jessica Shah" })
      .first();
    await nameLink.click();
    await page.waitForURL(/\/authors\/jessica-shah/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/authors\/jessica-shah/);
  });

  // ── 8.8  Responsive (375-px mobile viewport) ──────────────────────────
  test("card is fully visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(cardRoot(page)).toBeVisible();
  });

  test("avatar image is visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(
      cardRoot(page).locator("img[alt='Jessica Shah']").first()
    ).toBeVisible();
  });

  test("social links row carries mobile layout classes", async ({ page }: { page: Page }) => {
    await goto(page);
    const socialRow = cardRoot(page)
      .locator("div.flex.items-center.gap-5")
      .first();
    const cls = await socialRow.getAttribute("class") ?? "";
    expect(cls).toMatch(/mobile:justify-center/);
    expect(cls).toMatch(/mobile:gap-4/);
  });
});

// ─────────────────────────────────────────────
// SUITE 9 — Footer
// ─────────────────────────────────────────────
test.describe("Footer", () => {

  // ── 9.1  Footer structure ─────────────────────────────────────────────
  test("footer container is present in the DOM", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(page.locator("div.container").last()).toBeAttached();
  });

  // ── 9.2  Logo ─────────────────────────────────────────────────────────
  test("footer logo image is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const logo = page.locator("img[alt='Logo']").first();
    await expect(logo).toBeVisible();
  });

  test("footer logo src points to the brand-dark SVG", async ({ page }: { page: Page }) => {
    await goto(page);
    const logo = page.locator("img[alt='Logo']").first();
    await expect(logo).toHaveAttribute("src", "/asset/icons/header/brand-dark.svg");
  });

  test("footer logo image loads without error (naturalWidth > 0)", async ({ page }: { page: Page }) => {
    await goto(page);
    const logo = page.locator("img[alt='Logo']").first();
    const loaded = await logo.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  // ── 9.3  Company information ──────────────────────────────────────────
  test("CIN number is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.getByText(/CIN No: U67100GJ2021PTC126723/i)
    ).toBeVisible();
  });

  test("CIN number renders exact text", async ({ page }: { page: Page }) => {
    await goto(page);
    const cin = page.locator("span", { hasText: "CIN No: U67100GJ2021PTC126723" }).first();
    await expect(cin).toHaveText("CIN No: U67100GJ2021PTC126723");
  });

  test("'Registered Office' label is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.locator("span", { hasText: "Registered Office" }).first()
    ).toBeVisible();
  });

  test("Registered Office address is visible and contains 'Rajkot'", async ({ page }: { page: Page }) => {
    await goto(page);
    const addr = page.getByText(/Marwadi Financial Plaza.*Rajkot/i).first();
    await expect(addr).toBeVisible();
  });

  test("Registered Office address renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const addr = page.locator("span", {
      hasText: "Marwadi Financial Plaza, Nana Mava Road, Off. 150 Feet Ring Road, Rajkot-360 001.",
    }).first();
    await expect(addr).toHaveText(
      "Marwadi Financial Plaza, Nana Mava Road, Off. 150 Feet Ring Road, Rajkot-360 001."
    );
  });

  test("'Corporate Office' label is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.locator("span", { hasText: "Corporate Office" }).first()
    ).toBeVisible();
  });

  test("Corporate Office address is visible and contains 'Mumbai'", async ({ page }: { page: Page }) => {
    await goto(page);
    const addr = page.getByText(/Lotus Corporate Park.*Mumbai/i).first();
    await expect(addr).toBeVisible();
  });

  test("Corporate Office address renders full expected text", async ({ page }: { page: Page }) => {
    await goto(page);
    const addr = page.locator("span", {
      hasText: "Unit No. 1101 & 1102, 11th Floor, B – Wing, Lotus Corporate Park, Goregaon (E), Mumbai-400063",
    }).first();
    await expect(addr).toHaveText(
      "Unit No. 1101 & 1102, 11th Floor, B – Wing, Lotus Corporate Park, Goregaon (E), Mumbai-400063"
    );
  });

  // ── 9.4  India Macro Indicators navigation links ──────────────────────
  test("'India Macro Indicators' section label is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.locator("span", { hasText: "India Macro Indicators" }).first()
    ).toBeVisible();
  });

  test("'1 Finance Macroeconomic Index' link is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/1-finance-macroeconomic-index']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("1 Finance Macroeconomic Index");
  });

  test("'Global Economic Outlook Report' link is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/global-economic-outlook-report']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText(/global economic outlook report/i);
  });

  test("'Subindices' link is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/subindices']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Subindices");
  });

  test("'Key Economic Indicators' link is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/key-economic-indicators']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Key Economic Indicators");
  });

  test("'Economic Indicators' link is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/economic-indicators']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Economic Indicators");
  });

  test("'Asset Allocator' link is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/asset-allocator']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Asset Allocator");
  });

  test("'Reports and Resources' link is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/resources/blogs']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Reports and Resources");
  });

  test("'Authors' link in footer is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/authors']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Authors");
  });

  test("'India's Economic Dashboard' link is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/indias-economic-dashboard']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("India's Economic Dashboard");
  });

  test("'Terms of Use' link is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/term-of-use']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Terms of Use");
  });

  test("'Privacy Policy' link is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/privacy-policy']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Privacy Policy");
  });

  test("'Sitemap' link is visible and has correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='/site-map']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Sitemap");
  });

  // ── 9.5  Other Resources navigation links ─────────────────────────────
  test("'Other Resources' section label is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.locator("span", { hasText: "Other Resources" }).first()
    ).toBeVisible();
  });

  test("'Personal Finance Calculators' link is visible, opens in new tab, correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='https://1finance.co.in/calculator']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Personal Finance Calculators");
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("'Financial Products Research' link is visible, opens in new tab, correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='https://1finance.co.in/product-scoring']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Financial Products Research");
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("'Our Story' link is visible, opens in new tab, correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='https://1finance.co.in/story']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Our Story");
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("'GFP Summit 2025' link is visible, opens in new tab, correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='https://gfpsummit.com/']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("GFP Summit 2025");
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("'Personal Finance Magazine' link is visible, opens in new tab, correct href", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='https://1financemagazine.com/']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Personal Finance Magazine");
    await expect(link).toHaveAttribute("target", "_blank");
  });

  // ── 9.6  Newsletter subscription form ────────────────────────────────
  test("newsletter 'Subscribe to our Newsletter' label is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.getByText(/subscribe to our newsletter/i)
    ).toBeVisible();
  });

  test("newsletter email input is visible with correct placeholder", async ({ page }: { page: Page }) => {
    await goto(page);
    const input = page.locator("input[type='email'][name='email']").first();
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("placeholder", "Enter your email");
  });

  test("newsletter email input is of type email", async ({ page }: { page: Page }) => {
    await goto(page);
    const input = page.locator("input[name='email']").first();
    await expect(input).toHaveAttribute("type", "email");
  });

  test("newsletter submit button is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    const btn = page.locator("form button[type='submit']").first();
    await expect(btn).toBeVisible();
  });

  test("newsletter submit button carries brand purple background", async ({ page }: { page: Page }) => {
    await goto(page);
    const btn = page.locator("form button[type='submit']").first();
    await expect(btn).toHaveClass(/bg-\[#7f56d9\]/);
  });

  test("user can type a valid email into the newsletter input", async ({ page }: { page: Page }) => {
    await goto(page);
    const input = page.locator("input[type='email'][name='email']").first();
    await input.fill("test@example.com");
    await expect(input).toHaveValue("test@example.com");
  });

  // ── 9.7  App download links ───────────────────────────────────────────
  test("'Download the 1 Finance App' label is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.getByText(/download the 1 finance app/i)
    ).toBeVisible();
  });

  test("App Store link is visible and opens in new tab", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='https://1finance.onelink.me/5Kxt/tsik250m']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("App Store badge image is visible and has correct alt text", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = page.locator("img[alt='App Store']").first();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("alt", "App Store");
  });

  test("App Store badge image loads without error (naturalWidth > 0)", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = page.locator("img[alt='App Store']").first();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  test("Google Play Store link is visible and opens in new tab", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='https://1finance.onelink.me/5Kxt/478awhax']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("Google Play badge image is visible and has correct alt text", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = page.locator("img[alt='Google Store']").first();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("alt", "Google Store");
  });

  test("Google Play badge image loads without error (naturalWidth > 0)", async ({ page }: { page: Page }) => {
    await goto(page);
    const img = page.locator("img[alt='Google Store']").first();
    const loaded = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0
    );
    expect(loaded).toBe(true);
  });

  // ── 9.8  Copyright ────────────────────────────────────────────────────
  test("copyright notice '© Copyright 2026' is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.getByText(/© Copyright 2026/i)
    ).toBeVisible();
  });

  test("copyright domain link points to indiamacroindicators.co.in", async ({ page }: { page: Page }) => {
    await goto(page);
    const link = page.locator("a[href='https://indiamacroindicators.co.in/']").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText("indiamacroindicators.co.in");
  });

  test("'All Rights Reserved' text is visible", async ({ page }: { page: Page }) => {
    await goto(page);
    await expect(
      page.getByText(/all rights reserved/i)
    ).toBeVisible();
  });

  // ── 9.9  Responsive (375-px mobile viewport) ──────────────────────────
  test("footer logo is visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(page.locator("img[alt='Logo']").first()).toBeVisible();
  });

  test("newsletter form is visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(
      page.locator("input[type='email'][name='email']").first()
    ).toBeVisible();
  });

  test("App Store and Google Play badges are visible on a 375-px mobile viewport", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page);
    await expect(page.locator("img[alt='App Store']").first()).toBeVisible();
    await expect(page.locator("img[alt='Google Store']").first()).toBeVisible();
  });
});
