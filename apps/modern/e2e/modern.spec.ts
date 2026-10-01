import { expect, test } from "@playwright/test";

test("PPR page has a static shell and a cached section", async ({ page }) => {
  const res = await page.goto("/ppr");
  const html = (await res?.text()) ?? "";
  expect(html).toContain('data-marker="ppr-static"');
  expect(html).toContain('data-marker="ppr-cached"');
  await expect(page.locator('[data-marker="ppr-dynamic"]')).toBeVisible({ timeout: 15_000 });
});

test("cached PPR section is stable; dynamic hole is not", async ({ page }) => {
  await page.goto("/ppr");
  const cached = await page.locator('[data-marker="ppr-cached"]').getByText(/hit #/).textContent();
  const dynamic = await page.locator('[data-marker="ppr-dynamic"]').getByText(/hit #/).textContent();
  await page.reload();
  expect(await page.locator('[data-marker="ppr-cached"]').getByText(/hit #/).textContent()).toBe(cached);
  expect(await page.locator('[data-marker="ppr-dynamic"]').getByText(/hit #/).textContent()).not.toBe(dynamic);
});

test("updateTag adds a todo immediately", async ({ page }) => {
  await page.goto("/cache-tag");
  const label = `pw-${Date.now()}`;
  await page.getByPlaceholder("add + updateTag").fill(label);
  await page.getByRole("button", { name: "add + updateTag" }).click();
  await expect(page.getByTestId("modern-todos")).toContainText(label, { timeout: 10_000 });
});

test("runtime UUID is per request", async ({ page }) => {
  await page.goto("/runtime-data");
  const a = await page.getByTestId("runtime-uuid").textContent();
  await page.reload();
  const b = await page.getByTestId("runtime-uuid").textContent();
  expect(a).toBeTruthy();
  expect(a).not.toBe(b);
});

test("interview hub lists modern lessons", async ({ page }) => {
  await page.goto("/interview");
  await expect(page.getByRole("cell", { name: /Partial Prerendering/ })).toBeVisible();
});
