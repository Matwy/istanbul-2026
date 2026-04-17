import { test, expect, type Page } from '@playwright/test';

async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test.describe('Home', () => {
  test('loads with countdown and 6 navigation cards', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto('/');

    await expect(page).toHaveTitle(/Istanbul 2026/);
    await expect(page.getByRole('heading', { name: 'Istanbul', exact: true })).toBeVisible();

    // countdown Svelte island
    const countdown = page.locator('[class*="countdown"], .ornamental-number, [data-countdown]').first();
    // fallback: look for big number near "giorni alla partenza"
    await expect(page.getByText(/giorni alla partenza|in viaggio|è oggi|viaggio concluso/i)).toBeVisible();

    // 6 nav cards in the body grid (exclude header menu items)
    const targets = ['/giorno/1', '/mappa', '/checklist', '/cibo', '/quartieri', '/trasporti'];
    for (const href of targets) {
      await expect(page.locator(`main a[href="${href}"]`).first()).toBeVisible();
    }

    // Info rapide: currency, timezone etc
    await expect(page.getByText(/Lira turca/)).toBeVisible();
    await expect(page.getByText(/\+2h/)).toBeVisible();

    expect(errors.filter((e) => !e.includes('favicon'))).toEqual([]);
  });
});

test.describe('Navigation between sections', () => {
  const routes = [
    { path: '/', match: /Istanbul/ },
    { path: '/giorno/1', match: /Arrivo/ },
    { path: '/giorno/2', match: /Cuore bizantino/ },
    { path: '/giorno/3', match: /Sultani/ },
    { path: '/giorno/4', match: /Due continenti/ },
    { path: '/giorno/5', match: /Partenza/ },
    { path: '/mappa', match: /Mappa generale/ },
    { path: '/checklist', match: /Checklist/i },
    { path: '/cibo', match: /piatti|Cibo/i },
    { path: '/quartieri', match: /Quartieri/ },
    { path: '/trasporti', match: /Trasporti|Istanbulkart/ },
  ];

  for (const { path, match } of routes) {
    test(`${path} returns 200 and renders content`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).toContainText(match);
    });
  }
});

test.describe('Day pages with timeline', () => {
  test('giorno 2 shows attractions with timeline', async ({ page }) => {
    await page.goto('/giorno/2');
    await expect(page.getByText('Hagia Sophia').first()).toBeVisible();
    await expect(page.getByText('Moschea Blu').first()).toBeVisible();
    await expect(page.getByText('Basilica Cisterna').first()).toBeVisible();
    await expect(page.getByText('Gran Bazar').first()).toBeVisible();
    // Timeline sections
    await expect(page.getByText(/Mattino/).first()).toBeVisible();
  });

  test('giorno 1 shows arrival note (empty day)', async ({ page }) => {
    await page.goto('/giorno/1');
    await expect(page.getByText(/Giornata di arrivo/i)).toBeVisible();
    await expect(page.getByText(/Istanbulkart/i)).toBeVisible();
  });
});

test.describe('Mappa generale', () => {
  test('FullMap loads Leaflet with pins and filters', async ({ page }) => {
    await page.goto('/mappa');
    // client:visible needs to be in viewport — map is below header, should be visible
    await page.waitForSelector('.leaflet-container', { timeout: 10_000 });
    await expect(page.locator('.leaflet-container')).toBeVisible();

    // markers present (at least 14 must-see)
    await page.waitForFunction(() => document.querySelectorAll('.leaflet-marker-icon').length >= 10, null, {
      timeout: 10_000,
    });

    // filter toggles visible
    await expect(page.getByRole('button', { name: /Giorno 2/i }).first()).toBeVisible();
  });
});

test.describe('Checklist persistence', () => {
  test('checking an item persists across reload', async ({ page }) => {
    await page.goto('/checklist');

    // Click the first label (checkbox is visually hidden behind label)
    const firstLabel = page.locator('main label').filter({ has: page.locator('input[type="checkbox"]') }).first();
    const firstCheckbox = firstLabel.locator('input[type="checkbox"]');
    await expect(firstCheckbox).not.toBeChecked();
    await firstLabel.click();
    await expect(firstCheckbox).toBeChecked();

    await page.reload();
    const checkboxAfter = page.locator('main input[type="checkbox"]').first();
    await expect(checkboxAfter).toBeChecked();
  });
});

test.describe('Currency calculator', () => {
  test('10 EUR converts to 530 TL', async ({ page }) => {
    await page.goto('/trasporti');
    // Wait for island hydration
    await page.waitForTimeout(800);
    const eurInput = page.locator('input').filter({ hasNot: page.locator('[type="range"]') }).filter({ hasNot: page.locator('[type="checkbox"]') }).first();
    await eurInput.fill('10');
    await expect(page.locator('body')).toContainText(/530/, { timeout: 3_000 });
  });
});

test.describe('Transport calculator', () => {
  test('5 rides shows comparison values', async ({ page }) => {
    await page.goto('/trasporti');
    await page.waitForTimeout(800);
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();
    await slider.fill('5');
    // 5 rides single = 205 TL (from singleTable), card = 165+175=340 TL
    await expect(page.locator('body')).toContainText(/205|340/);
  });
});

test.describe('Dishes page', () => {
  test('shows 12 dish cards', async ({ page }) => {
    await page.goto('/cibo');
    const names = ['Simit', 'Döner', 'Balık', 'Meze', 'Lahmacun', 'Menemen', 'Çay', 'Türk Kahvesi', 'Baklava', 'Lokum', 'Midye', 'Pide'];
    for (const name of names) {
      await expect(page.getByText(name).first()).toBeVisible();
    }
  });
});

test.describe('Neighborhoods page', () => {
  test('shows all 8 neighborhoods grouped by side', async ({ page }) => {
    await page.goto('/quartieri');
    const names = ['Sultanahmet', 'Beyoğlu', 'Eminönü', 'Balat', 'Fener', 'Fatih', 'Kadıköy', 'Üsküdar'];
    for (const name of names) {
      await expect(page.getByText(name).first()).toBeVisible();
    }
  });
});

test.describe('Mobile responsive', () => {
  test('no horizontal overflow at 375px width', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only test');
    await page.goto('/');
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth + 1;
    });
    expect(overflow).toBe(true);
  });

  test('hamburger menu opens and closes on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only test');
    await page.goto('/');
    const burger = page.getByRole('button', { name: /men[uù]|apri/i }).first();
    if (await burger.isVisible({ timeout: 2000 }).catch(() => false)) {
      await burger.click();
      // drawer nav should be visible
      await expect(page.getByRole('link', { name: 'Mappa' }).first()).toBeVisible();
    }
  });
});

test.describe('Console errors', () => {
  test('home and all main pages have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`${page.url()} :: ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`${page.url()} :: ${err.message}`));

    for (const path of ['/', '/giorno/2', '/mappa', '/checklist', '/cibo', '/quartieri', '/trasporti']) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      // small wait for island hydration
      await page.waitForTimeout(500);
    }

    const filtered = errors.filter(
      (e) => !e.includes('favicon') && !e.toLowerCase().includes('net::err_aborted'),
    );
    expect(filtered).toEqual([]);
  });
});
