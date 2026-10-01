import { expect, test } from "@playwright/test";

test("home shows the roadmap", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Next.js Rendering Lab/i })).toBeVisible();
});

test("SSG timestamp stays the same across reloads", async ({ page }) => {
  await page.goto("/rendering/ssg");
  const first = await page.locator("text=/random /").first().textContent();
  await page.reload();
  const second = await page.locator("text=/random /").first().textContent();
  expect(first).toBe(second);
  await expect(page.locator('[data-marker="ssg-posts"]')).toBeVisible();
});

test("SSR timestamp changes across reloads", async ({ page }) => {
  await page.goto("/rendering/ssr");
  const first = await page.locator("text=/random /").first().textContent();
  await page.reload();
  const second = await page.locator("text=/random /").first().textContent();
  expect(first).not.toBe(second);
  await expect(page.locator('[data-marker="ssr-request"]')).toBeVisible();
});

test("CSR data is absent from the raw HTML and appears after hydration", async ({ page }) => {
  const res = await page.goto("/rendering/csr");
  const html = (await res?.text()) ?? "";
  expect(html).not.toContain('data-marker="csr-data"');
  await expect(page.getByTestId("csr-data")).toBeVisible({ timeout: 15_000 });
});

test("ISR on-demand revalidate updates the page", async ({ page }) => {
  await page.goto("/rendering/isr");
  const before = await page.locator('[data-marker="isr-data"]').textContent();
  await page.getByRole("button", { name: /revalidateTag\('isr-time', \{ expire: 0 \}\)/ }).click();
  await page.waitForTimeout(500);
  await page.reload();
  const after = await page.locator('[data-marker="isr-data"]').textContent();
  expect(after).toBeTruthy();
  expect(before).toBeTruthy();
});

test("streaming shows fallbacks then resolved sections", async ({ page }) => {
  await page.goto("/streaming");
  await expect(page.locator('[data-marker="stream-fast"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-marker="stream-slow"]')).toBeVisible({ timeout: 15_000 });
});

test("Server Action adds a todo", async ({ page }) => {
  await page.goto("/actions");
  const label = `pw-${Date.now()}`;
  await page.getByPlaceholder("new todo").fill(label);
  await page.getByRole("button", { name: /add \(Server Action\)/ }).click();
  await expect(page.getByTestId("todo-list")).toContainText(label, { timeout: 10_000 });
});

test("legacy SSG vs SSR", async ({ page }) => {
  await page.goto("/legacy/ssg");
  const a = await page.locator('[data-marker="legacy-ssg"]').textContent();
  await page.reload();
  const b = await page.locator('[data-marker="legacy-ssg"]').textContent();
  expect(a).toBe(b);

  await page.goto("/legacy/ssr");
  const c = await page.locator('[data-marker="legacy-ssr"]').textContent();
  await page.reload();
  const d = await page.locator('[data-marker="legacy-ssr"]').textContent();
  expect(c).not.toBe(d);
});

test("interview hub lists classic lessons", async ({ page }) => {
  await page.goto("/interview");
  await expect(page.getByRole("heading", { name: /Interview hub/i })).toBeVisible();
  await expect(page.getByRole("cell", { name: /SSG: Static Site Generation/ })).toBeVisible();
});
