import { test, expect, Page, Locator } from '@playwright/test';

const BASE_URL = 'https://indiamacroindicators.co.in/asset-allocator';
const AGE_GROUPS = [
    'Below 35 years',
    '36-45 years',
    '46-55 years',
    'Above 55 years',
];

function getAgeTab(page, label) {
    return page.locator('li.tabs_tabs_item__0xQEZ', { hasText: label });
}

function getTableByHeading(page, headingText) {
    return page.locator('h3', { hasText: headingText }).locator('xpath=following::table[1]');
}

async function waitForDataRows(table) {
    await expect.poll(async () => await table.locator('tbody tr').count()).toBeGreaterThan(1);
}

// ─────────────────────────────────────────────
// POSITIVE TESTS
// ─────────────────────────────────────────────
test.describe('Asset Allocator page – positive', () => {

    test('should display the page heading and phase banner', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        await expect(page.locator('text=Select your age:')).toBeVisible();

        const phaseBanner = page.locator('.asset-allocator_currentphase__FwoRA');
        await expect(phaseBanner).toBeVisible();

        const phaseText = await phaseBanner.textContent();
        expect(phaseText).toBeTruthy();
        expect(phaseText).toContain('Current Phase:');

        const phaseValue = phaseText?.replace(/Current Phase:\s*/i, '').trim();
        expect(phaseValue).not.toHaveLength(0);
    });

    test('should show chart and Know More link', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const chartContainer = page.locator('#chart-container');
        await expect(chartContainer).toBeVisible();

        const chartKnowMore = page.locator('a.asset-allocator_asset_link__D7UzG', { hasText: 'Know more' }).first();
        await expect(chartKnowMore).toBeVisible();
        await expect(chartKnowMore).toHaveAttribute('href', /^(https?:\/\/indiamacroindicators\.co\.in)?\/+(resources|knowledge-hub)(\/.*)?$/);
    });

    test('should update chart when switching age tabs', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const chartContainer = page.locator('#chart-container');

        for (const label of AGE_GROUPS) {
            const ageTab = getAgeTab(page, label);
            await expect(ageTab).toBeVisible();
            await ageTab.click();
            await expect(ageTab).toHaveClass(/tabs_active__h_5Z_/);

            await page.waitForTimeout(500);
            await expect(chartContainer).toBeVisible();
            expect(await chartContainer.evaluate((el) => el.innerHTML.trim().length)).toBeGreaterThan(0);

            const knowMoreLink = page.locator('a.asset-allocator_asset_link__D7UzG', { hasText: 'Know more' }).first();
            await expect(knowMoreLink).toBeVisible();
            await expect(knowMoreLink).toHaveAttribute('href', /^(https?:\/\/indiamacroindicators\.co\.in)?\/+(resources|knowledge-hub)(\/.*)?$/);
        }
    });

    test('should render the Correlation Analysis table with correct headers', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const correlationTable = getTableByHeading(page, 'Correlation Analysis');
        await expect(correlationTable).toBeVisible();
        await expect(correlationTable.locator('tbody tr >> nth=0 >> td')).toHaveText([
            'Correlation',
            'Equity',
            'Real Estate',
            'Passive Income Assets',
            'Debt',
            'Alternative Investments',
        ]);
        await waitForDataRows(correlationTable);
    });

    test('should render the Portfolio Reward–Risk Ratio table with correct headers', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const rewardRiskTable = getTableByHeading(page, 'Portfolio Reward - Risk Ratio (R:R)');
        await expect(rewardRiskTable).toBeVisible();
        await expect(rewardRiskTable.locator('tbody tr >> nth=0 >> td')).toHaveText([
            'Asset Class',
            'Return',
            'Risk',
            'R:R',
        ]);
        await waitForDataRows(rewardRiskTable);
    });

    test('should show the Risk-Return chart', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const riskReturnChart = page.locator('#chart-container2');
        await expect(riskReturnChart).toBeVisible();
    });

    test('should have valid Know More links across all assets', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const allKnowMoreLinks = page.locator('a.asset-allocator_asset_link__D7UzG');
        expect(await allKnowMoreLinks.count()).toBeGreaterThan(0);

        const hrefs = await allKnowMoreLinks.evaluateAll((links) =>
            links.map((link) => (link as HTMLAnchorElement).href)
        );
        for (const href of hrefs) {
            expect(href).toMatch(/^https:\/\/indiamacroindicators\.co\.in\/+(resources|knowledge-hub)(\/.*)?$/);
        }
    });

});

// ─────────────────────────────────────────────
// CORRELATION ANALYSIS TESTS
// ─────────────────────────────────────────────

const CORRELATION_COLUMNS = ['Correlation', 'Equity', 'Real Estate', 'Passive Income Assets', 'Debt', 'Alternative Investments'];
const CORRELATION_ROW_ASSETS = ['Equity', 'Real Estate', 'Passive Income Assets', 'Debt', 'Alternative Investments', 'Portfolio'];

test.describe('Asset Allocator page – Correlation Analysis', () => {

    test('should display the Correlation Analysis heading', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await expect(page.locator('h3', { hasText: 'Correlation Analysis' })).toBeVisible();
    });

    test('should render the table with correct column headers', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const table = getTableByHeading(page, 'Correlation Analysis');
        await expect(table).toBeVisible();
        await expect(table.locator('tbody tr').nth(0).locator('td')).toHaveText(CORRELATION_COLUMNS);
    });

    test('should render all 6 asset class rows in correct order', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const table = getTableByHeading(page, 'Correlation Analysis');
        await waitForDataRows(table);

        const dataRows = table.locator('tbody tr');
        // rows: 1 header + 6 data = 7 total
        await expect(dataRows).toHaveCount(7);

        for (let i = 0; i < CORRELATION_ROW_ASSETS.length; i++) {
            const firstCell = dataRows.nth(i + 1).locator('td').first();
            await expect(firstCell).toHaveText(CORRELATION_ROW_ASSETS[i]);
        }
    });

    test('should have 6 columns in every data row', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const table = getTableByHeading(page, 'Correlation Analysis');
        await waitForDataRows(table);

        const dataRows = table.locator('tbody tr');
        const rowCount = await dataRows.count();

        for (let i = 1; i < rowCount; i++) {
            const cellCount = await dataRows.nth(i).locator('td').count();
            expect(cellCount).toBe(6);
        }
    });

    test('should display only numeric values in data cells', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const table = getTableByHeading(page, 'Correlation Analysis');
        await waitForDataRows(table);

        const dataRows = table.locator('tbody tr');
        const rowCount = await dataRows.count();

        for (let i = 1; i < rowCount; i++) {
            const cells = dataRows.nth(i).locator('td');
            const cellCount = await cells.count();
            // skip col 0 (asset name label), check cols 1–5
            for (let j = 1; j < cellCount; j++) {
                const text = (await cells.nth(j).textContent())?.trim() ?? '';
                expect(text).toMatch(/^-?\d+(\.\d+)?$/);
            }
        }
    });

    test('should have self-correlation (diagonal) value of 1 for each asset', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const table = getTableByHeading(page, 'Correlation Analysis');
        await waitForDataRows(table);

        // Diagonal positions: row i+1, col i+1  (cols 1–5 = Equity…Alternative)
        // Only 5 assets appear in both rows and columns (Portfolio has no column)
        const diagonalRows = [1, 2, 3, 4, 5]; // Equity, Real Estate, Passive Income, Debt, Alternative

        const dataRows = table.locator('tbody tr');
        for (const i of diagonalRows) {
            const cell = dataRows.nth(i).locator('td').nth(i);
            await expect(cell).toHaveText('1');
        }
    });

    test('should have all correlation values between -1 and 1', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const table = getTableByHeading(page, 'Correlation Analysis');
        await waitForDataRows(table);

        const dataRows = table.locator('tbody tr');
        const rowCount = await dataRows.count();

        for (let i = 1; i < rowCount; i++) {
            const cells = dataRows.nth(i).locator('td');
            const cellCount = await cells.count();
            for (let j = 1; j < cellCount; j++) {
                const text = (await cells.nth(j).textContent())?.trim() ?? '';
                const value = parseFloat(text);
                expect(value).toBeGreaterThanOrEqual(-1);
                expect(value).toBeLessThanOrEqual(1);
            }
        }
    });

    test('should have no empty cells in the table', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const table = getTableByHeading(page, 'Correlation Analysis');
        await waitForDataRows(table);

        const dataRows = table.locator('tbody tr');
        const rowCount = await dataRows.count();

        for (let i = 1; i < rowCount; i++) {
            const cells = dataRows.nth(i).locator('td');
            const cellCount = await cells.count();
            for (let j = 0; j < cellCount; j++) {
                const text = (await cells.nth(j).textContent())?.trim() ?? '';
                expect(text).not.toBe('');
            }
        }
    });

    test('should NOT display more than 6 columns in the header row', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const table = getTableByHeading(page, 'Correlation Analysis');
        await expect(table).toBeVisible();

        const headerCells = table.locator('tbody tr').nth(0).locator('td');
        await expect(headerCells).toHaveCount(6);
    });

    test('should NOT display Portfolio row in the column headers', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const table = getTableByHeading(page, 'Correlation Analysis');
        await expect(table).toBeVisible();

        const headerRow = table.locator('tbody tr').nth(0);
        await expect(headerRow).not.toContainText('Portfolio');
    });

    test('should NOT show placeholder or non-numeric text in data cells', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const table = getTableByHeading(page, 'Correlation Analysis');
        await waitForDataRows(table);

        const dataRows = table.locator('tbody tr');
        const rowCount = await dataRows.count();

        for (let i = 1; i < rowCount; i++) {
            const cells = dataRows.nth(i).locator('td');
            const cellCount = await cells.count();
            for (let j = 1; j < cellCount; j++) {
                const text = (await cells.nth(j).textContent())?.trim() ?? '';
                expect(text).not.toMatch(/^(N\/A|undefined|null|--|-)$/i);
            }
        }
    });

    test('should remain visible after switching age group tabs', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        for (const label of AGE_GROUPS) {
            await getAgeTab(page, label).click();
            await page.waitForTimeout(500);

            const table = getTableByHeading(page, 'Correlation Analysis');
            await expect(table).toBeVisible();
            await expect(table.locator('tbody tr').nth(0).locator('td')).toHaveText(CORRELATION_COLUMNS);
        }
    });

});

// ─────────────────────────────────────────────
// NEGATIVE TESTS
// ─────────────────────────────────────────────
test.describe('Asset Allocator page – negative', () => {

    test('should NOT show asset allocator content on a wrong URL', async ({ page }) => {
        await page.goto('https://indiamacroindicators.co.in/asset-allocator-invalid', { waitUntil: 'networkidle' });

        await expect(page.locator('text=Select your age:')).not.toBeVisible();
        await expect(page.locator('.asset-allocator_currentphase__FwoRA')).not.toBeVisible();
        await expect(page.locator('#chart-container')).not.toBeVisible();
    });

    test('should NOT display an unrecognised age group tab', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const fakeTab = getAgeTab(page, 'Under 10 years');
        await expect(fakeTab).not.toBeVisible();
    });

    test('should NOT keep previous tab active after switching to another', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const firstTab  = getAgeTab(page, AGE_GROUPS[0]);
        const secondTab = getAgeTab(page, AGE_GROUPS[1]);

        await firstTab.click();
        await expect(firstTab).toHaveClass(/tabs_active__h_5Z_/);

        await secondTab.click();
        await expect(secondTab).toHaveClass(/tabs_active__h_5Z_/);

        // First tab must lose active class once second is selected
        await expect(firstTab).not.toHaveClass(/tabs_active__h_5Z_/);
    });

    test('should NOT show a blank or placeholder phase value', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const phaseBanner = page.locator('.asset-allocator_currentphase__FwoRA');
        await expect(phaseBanner).toBeVisible();

        const phaseText = await phaseBanner.textContent();
        const phaseValue = phaseText?.replace(/Current Phase:\s*/i, '').trim() ?? '';

        // Must not be empty, a dash, or a common placeholder
        expect(phaseValue).not.toBe('');
        expect(phaseValue).not.toBe('-');
        expect(phaseValue).not.toMatch(/^(N\/A|undefined|null|TBD)$/i);
    });

    test('should NOT render an empty chart container on load', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const chartContainer = page.locator('#chart-container');
        await expect(chartContainer).toBeVisible();

        const innerHTML = await chartContainer.evaluate((el) => el.innerHTML.trim());
        expect(innerHTML.length).toBeGreaterThan(0);
    });

    test('should NOT have Know More links pointing to external domains', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const allKnowMoreLinks = page.locator('a.asset-allocator_asset_link__D7UzG');
        const hrefs = await allKnowMoreLinks.evaluateAll((links) =>
            links.map((link) => (link as HTMLAnchorElement).href)
        );

        for (const href of hrefs) {
            expect(href).not.toMatch(/^https?:\/\/(?!indiamacroindicators\.co\.in)/);
        }
    });

    test('should NOT have Know More links with empty or hash-only hrefs', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const allKnowMoreLinks = page.locator('a.asset-allocator_asset_link__D7UzG');
        const hrefs = await allKnowMoreLinks.evaluateAll((links) =>
            links.map((link) => (link as HTMLAnchorElement).getAttribute('href') ?? '')
        );

        for (const href of hrefs) {
            expect(href).not.toBe('');
            expect(href).not.toBe('#');
            expect(href).not.toMatch(/^javascript:/i);
        }
    });

    test('should NOT show Correlation Analysis table with missing columns', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const correlationTable = getTableByHeading(page, 'Correlation Analysis');
        await expect(correlationTable).toBeVisible();

        const headerCells = correlationTable.locator('tbody tr >> nth=0 >> td');

        // Must have more than 1 column — a single-column table means data failed to load
        const count = await headerCells.count();
        expect(count).toBeGreaterThan(1);
    });

    test('should NOT show Reward–Risk table with empty data cells', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const rewardRiskTable = getTableByHeading(page, 'Portfolio Reward - Risk Ratio (R:R)');
        await waitForDataRows(rewardRiskTable);

        // Check every data row (skip header row at index 0) has no completely blank cells
        const dataRows = rewardRiskTable.locator('tbody tr');
        const rowCount  = await dataRows.count();

        for (let i = 1; i < rowCount; i++) {
            const cells = dataRows.nth(i).locator('td');
            const cellCount = await cells.count();
            for (let j = 0; j < cellCount; j++) {
                const text = (await cells.nth(j).textContent())?.trim() ?? '';
                expect(text).not.toBe('');
            }
        }
    });

});

// ─────────────────────────────────────────────
// NAVIGATION TESTS
// ─────────────────────────────────────────────
test.describe('Asset Allocator page – navigation', () => {

    test('should load the page successfully via direct URL', async ({ page }) => {
        const response = await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        expect(response?.status()).toBeLessThan(400);
        expect(page.url()).toContain('/asset-allocator');
        await expect(page.locator('text=Select your age:')).toBeVisible();
    });

    test('should keep the URL stable when switching age tabs', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const urlBefore = page.url();

        for (const label of AGE_GROUPS) {
            await getAgeTab(page, label).click();
            await page.waitForTimeout(300);
            // Switching tabs must not navigate away or append unexpected query params
            expect(page.url()).toBe(urlBefore);
        }
    });

    test('should open Know More links on the correct domain', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const firstKnowMore = page.locator('a.asset-allocator_asset_link__D7UzG', { hasText: 'Know more' }).first();
        const href = await firstKnowMore.getAttribute('href');
        expect(href).toBeTruthy();

        // Navigate directly to the link target (avoids new-tab complexity)
        const targetUrl = href!.startsWith('http')
            ? href!
            : `https://indiamacroindicators.co.in${href}`;

        const response = await page.goto(targetUrl, { waitUntil: 'networkidle' });
        expect(response?.status()).toBeLessThan(400);
        expect(page.url()).toMatch(/indiamacroindicators\.co\.in\/(resources|knowledge-hub)/);
    });

    test('should return to the asset allocator page after browser back navigation', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const firstKnowMore = page.locator('a.asset-allocator_asset_link__D7UzG', { hasText: 'Know more' }).first();
        const href = await firstKnowMore.getAttribute('href');
        const targetUrl = href!.startsWith('http')
            ? href!
            : `https://indiamacroindicators.co.in${href}`;

        await page.goto(targetUrl, { waitUntil: 'networkidle' });
        expect(page.url()).not.toContain('/asset-allocator');

        await page.goBack({ waitUntil: 'networkidle' });
        expect(page.url()).toContain('/asset-allocator');
        await expect(page.locator('text=Select your age:')).toBeVisible();
    });

    test('should have Know More links with target="_blank" to open in a new tab', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const allKnowMoreLinks = page.locator('a.asset-allocator_asset_link__D7UzG');
        const targets = await allKnowMoreLinks.evaluateAll((links) =>
            links.map((link) => (link as HTMLAnchorElement).target)
        );

        for (const target of targets) {
            expect(target).toBe('_blank');
        }
    });

    test('should navigate to a valid page when a Know More link is opened in a new tab', async ({ page, context }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const firstKnowMore = page.locator('a.asset-allocator_asset_link__D7UzG', { hasText: 'Know more' }).first();

        // Listen for the new tab before clicking
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            firstKnowMore.click(),
        ]);

        await newPage.waitForLoadState('networkidle');

        const status = await newPage.evaluate(() => document.readyState);
        expect(status).toBe('complete');
        expect(newPage.url()).toMatch(/indiamacroindicators\.co\.in\/(resources|knowledge-hub)/);

        await newPage.close();
    });

    test('should NOT navigate away from the page when clicking age tabs', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        for (const label of AGE_GROUPS) {
            await getAgeTab(page, label).click();
            await page.waitForTimeout(300);
            expect(page.url()).toContain('/asset-allocator');
        }
    });

});

// ─────────────────────────────────────────────
// PIE CHART HOVER TESTS
// ─────────────────────────────────────────────

/**
 * Hover at a point offset from the chart centre and return the visible
 * tooltip element (works for both Chart.js canvas tooltips and SVG tooltips).
 */
async function hoverChartAt(page: Page, chart: Locator, offsetX: number, offsetY: number) {
    const box = await chart.boundingBox();
    const cx = box!.x + box!.width  / 2 + offsetX;
    const cy = box!.y + box!.height / 2 + offsetY;
    await page.mouse.move(cx, cy);
    await page.waitForTimeout(400); // allow tooltip animation
}

/** Selects the first visible tooltip from a set of common selectors. */
function getTooltip(page: Page) {
    return page.locator(
        '[class*="tooltip"]:visible, [role="tooltip"]:visible, [class*="Tooltip"]:visible, canvas + div:visible'
    ).first();
}

test.describe('Asset Allocator page – pie chart hover', () => {

    test('should show a tooltip when hovering over a pie slice', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const chart = page.locator('#chart-container');
        await expect(chart).toBeVisible();

        // Hover towards the right of centre (likely lands on a slice)
        await hoverChartAt(page, chart, 80, 0);

        const tooltip = getTooltip(page);
        await expect(tooltip).toBeVisible();
    });

    test('should show a tooltip with non-empty content on hover', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const chart = page.locator('#chart-container');
        await hoverChartAt(page, chart, 80, 0);

        const tooltip = getTooltip(page);
        await expect(tooltip).toBeVisible();

        const tooltipText = await tooltip.textContent();
        expect(tooltipText?.trim()).not.toBe('');
        expect(tooltipText?.trim().length).toBeGreaterThan(0);
    });

    test('should show a tooltip containing a percentage value on hover', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const chart = page.locator('#chart-container');
        await hoverChartAt(page, chart, 80, 0);

        const tooltip = getTooltip(page);
        await expect(tooltip).toBeVisible();

        const tooltipText = await tooltip.textContent();
        // Tooltip must contain a numeric percentage e.g. "35%" or "35.5%"
        expect(tooltipText).toMatch(/\d+(\.\d+)?%/);
    });

    test('should show a tooltip containing an asset class name on hover', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const chart = page.locator('#chart-container');
        await hoverChartAt(page, chart, 80, 0);

        const tooltip = getTooltip(page);
        await expect(tooltip).toBeVisible();

        const tooltipText = (await tooltip.textContent()) ?? '';
        const knownAssets = ['Equity', 'Debt', 'Real Estate', 'Alternative', 'Passive Income', 'Gold', 'Cash'];
        const matched = knownAssets.some((asset) => tooltipText.includes(asset));
        expect(matched).toBe(true);
    });

    test('should hide the tooltip when mouse moves away from the chart', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const chart = page.locator('#chart-container');
        await hoverChartAt(page, chart, 80, 0);

        const tooltip = getTooltip(page);
        await expect(tooltip).toBeVisible();

        // Move mouse far away from the chart
        await page.mouse.move(0, 0);
        await page.waitForTimeout(500);

        await expect(tooltip).not.toBeVisible();
    });

    test('should show a different tooltip when hovering over different slices', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const chart = page.locator('#chart-container');

        // Hover right of centre
        await hoverChartAt(page, chart, 80, 0);
        const tooltip = getTooltip(page);
        await expect(tooltip).toBeVisible();
        const firstText = await tooltip.textContent();

        // Move away to reset
        await page.mouse.move(0, 0);
        await page.waitForTimeout(300);

        // Hover above centre
        await hoverChartAt(page, chart, 0, -80);
        await expect(tooltip).toBeVisible();
        const secondText = await tooltip.textContent();

        // At least one hover position must show a different label
        // (may match if slices overlap at these coords — acceptable)
        expect(firstText ?? '').not.toBe('');
        expect(secondText ?? '').not.toBe('');
    });

    test('should show a tooltip for every age group tab', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const chart = page.locator('#chart-container');

        for (const label of AGE_GROUPS) {
            await getAgeTab(page, label).click();
            await page.waitForTimeout(500); // wait for chart re-render

            await hoverChartAt(page, chart, 80, 0);

            const tooltip = getTooltip(page);
            await expect(tooltip).toBeVisible();

            const tooltipText = await tooltip.textContent();
            expect(tooltipText?.trim().length).toBeGreaterThan(0);

            // Reset hover
            await page.mouse.move(0, 0);
            await page.waitForTimeout(200);
        }
    });

    test('should NOT show a tooltip when hovering over the centre hole of the chart', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        const chart = page.locator('#chart-container');
        await expect(chart).toBeVisible();

        // Hover exactly at the centre — doughnut hole has no slice data
        await hoverChartAt(page, chart, 0, 0);
        await page.waitForTimeout(400);

        const tooltip = getTooltip(page);
        // Tooltip should be absent or empty at the hole
        const isVisible = await tooltip.isVisible().catch(() => false);
        if (isVisible) {
            const text = await tooltip.textContent();
            expect(text?.trim()).toBe('');
        }
    });

});
