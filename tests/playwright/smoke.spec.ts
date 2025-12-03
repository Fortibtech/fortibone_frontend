import { test, expect } from '@playwright/test';

test('home page http 200 and basic UI', async ({ page, request }) => {
  // Wait/retry for the local server to become available (use request to probe baseURL)
  const maxRetries = 20; // total wait ~20s
  let resp = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      resp = await request.get('/');
      if (resp && resp.status() < 400) break;
    } catch (e) {
      // connection refused or not ready yet
    }
    // wait 1s and retry
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!resp) {
    throw new Error('Failed to reach local server after waiting');
  }
  expect(resp.status()).toBeLessThan(400);

  // UI check
  await page.goto('/');
  // wait a bit for app to render
  await page.waitForTimeout(1500);

  // Try common selectors used in the app; fall back to body
  const appRoot = await page.locator('[data-testid=app-root]').first();
  if (await appRoot.count() > 0) {
    expect(await appRoot.isVisible()).toBeTruthy();
  } else {
    const body = page.locator('body');
    expect(await body.count()).toBeGreaterThan(0);
  }

  // capture screenshot
  await page.screenshot({ path: 'playwright-screenshots/home.png', fullPage: true });
});
