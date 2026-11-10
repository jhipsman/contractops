import { test, expect } from "@playwright/test";
test("dashboard, filters, navigation and responsive layout", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "A clearer view of what’s next." }),
  ).toBeVisible();
  await expect(page.getByText("Fictional demo", { exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `.impeccable/review/${info.project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Blocked", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Blocked", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Search reimbursements").fill("no such contract");
  await expect(
    page.getByRole("heading", { name: "No matching requests" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await page.getByRole("link", { name: "Review blocker" }).click();
  await expect(
    page.getByRole("heading", { name: "Two documents are still needed" }),
  ).toBeVisible();
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(
      page.getByRole("link", { name: "Contract Ops", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(
      page.getByRole("button", { name: "Close navigation", exact: true }).and(page.locator("[aria-controls]")),
    ).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(
      page.getByRole("link", { name: "Organization settings" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toBeFocused();
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Documents" })
    .click();
  await expect(
    page.getByRole("heading", { name: "A home for your documents." }),
  ).toBeVisible();
  await page.goto("/contracts/not-a-real-contract");
  await expect(page.getByText("This page could not be found.")).toBeVisible();
  expect(errors).toEqual([]);
});
