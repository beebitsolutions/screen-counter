import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const BADGE = '[role="status"][aria-label="Screen counter"]';
const CLOSE = 'button[aria-label="Hide screen counter"]';
const HIDDEN_KEY = 'screen-counter:hidden';

const COLORS = {
  green: 'rgb(22, 163, 74)',
  amber: 'rgb(217, 119, 6)',
  red: 'rgb(220, 38, 38)',
} as const;

const PROD_ENABLED = !!process.env['E2E_PROD'];

function badge(page: Page): Locator {
  return page.locator(BADGE);
}

async function clearHidden(page: Page): Promise<void> {
  await page.evaluate((key) => window.localStorage.removeItem(key), HIDDEN_KEY);
}

async function gotoFresh(page: Page): Promise<void> {
  await page.goto('/');
  await clearHidden(page);
  await page.reload();
}

test.describe('badge — default project (chromium)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'default-project test');
    await gotoFresh(page);
  });

  test('renders with the correct count', async ({ page }) => {
    const root = badge(page);
    await expect(root).toBeVisible();
    await expect(root).toContainText(/17\/\d+ screens/);
    await expect(root).toContainText('17/20 screens');
  });

  test('hide button removes the badge and the choice persists', async ({ page }) => {
    await badge(page).locator(CLOSE).click();
    await expect(badge(page)).toHaveCount(0);
    const stored = await page.evaluate((key) => window.localStorage.getItem(key), HIDDEN_KEY);
    expect(stored).toBe('1');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(badge(page)).toHaveCount(0);
  });

  test('clearing the localStorage flag brings the badge back', async ({ page }) => {
    await badge(page).locator(CLOSE).click();
    await expect(badge(page)).toHaveCount(0);
    await clearHidden(page);
    await page.reload();
    await expect(badge(page)).toBeVisible();
  });

  test('a11y: no critical axe violations on /', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });

  test('keyboard: the close button is reachable and Enter hides the badge', async ({ page }) => {
    const closeLocator = badge(page).locator(CLOSE);
    await expect(closeLocator).toBeVisible();
    const handle = await closeLocator.elementHandle();
    expect(handle).not.toBeNull();
    let focused = false;
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press('Tab');
      const isFocused = await page.evaluate((el) => document.activeElement === el, handle);
      if (isFocused) {
        focused = true;
        break;
      }
    }
    expect(focused, 'close button never received keyboard focus within 80 tabs').toBe(true);
    await page.keyboard.press('Enter');
    await expect(badge(page)).toHaveCount(0);
  });
});

test.describe('badge — SHOW=never project', () => {
  test('does not render the badge when NEXT_PUBLIC_SCREEN_COUNTER_SHOW=never', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'show-never', 'show-never project test');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(badge(page)).toHaveCount(0);
  });
});

test.describe('badge — color thresholds', () => {
  test('renders green when count is well below the amber threshold', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'limit-green', 'limit-green project test');
    await gotoFresh(page);
    const borderLeft = await badge(page).evaluate(
      (el) => window.getComputedStyle(el).borderLeftColor,
    );
    expect(borderLeft).toBe(COLORS.green);
  });

  test('renders amber when count is in the amber band', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'limit-amber', 'limit-amber project test');
    await gotoFresh(page);
    const borderLeft = await badge(page).evaluate(
      (el) => window.getComputedStyle(el).borderLeftColor,
    );
    expect(borderLeft).toBe(COLORS.amber);
  });

  test('renders red when count meets or exceeds the limit', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'limit-red', 'limit-red project test');
    await gotoFresh(page);
    const borderLeft = await badge(page).evaluate(
      (el) => window.getComputedStyle(el).borderLeftColor,
    );
    expect(borderLeft).toBe(COLORS.red);
  });
});

test.describe('badge — production build (opt-in via E2E_PROD=1)', () => {
  test('SHOW=always overrides NODE_ENV=production and renders the badge', async ({
    page,
  }, testInfo) => {
    test.skip(!PROD_ENABLED, 'set E2E_PROD=1 to run the production-build assertion');
    test.skip(testInfo.project.name !== 'chromium', 'default-project test');
    await page.goto('/');
    await expect(badge(page)).toBeVisible();
  });
});
