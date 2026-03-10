import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Nexos/i);
  });

  test("property listing page loads", async ({ page }) => {
    await page.goto("/emlak");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/iletisim");
    await expect(page.locator("form")).toBeVisible();
  });

  test("blog page loads", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog/i);
  });

  test("team page loads", async ({ page }) => {
    await page.goto("/ekibimiz");
    await expect(page).toHaveTitle(/Ekibimiz/i);
  });

  test("map page loads", async ({ page }) => {
    await page.goto("/harita");
    await expect(page).toHaveTitle(/Harita/i);
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/giris");
    await expect(page.locator("form")).toBeVisible();
  });

  test("404 page shows for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    await expect(page.locator("text=404")).toBeVisible();
  });
});
