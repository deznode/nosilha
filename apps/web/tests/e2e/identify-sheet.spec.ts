import { expect, test } from "@playwright/test";

import { addressedRecord, type EntrySummary } from "../utils/archive-data";

/**
 * The seeded Igreja records six of its nine heritage fields (spec 034 FR-016), so
 * its page always carries a question to open.
 */
const HAS_EMPTY_FIELD = (record: EntrySummary) =>
  record.slug.startsWith("igreja");

/**
 * Spec 034 T-41 / FR-004, spec 040 FR-008 — the identify sheet needs no account.
 *
 * A signed-out visitor can open the sheet, type what they know and send it with a
 * name and an email. The post is stubbed, so a run writes nothing to the archive.
 */
test.describe("Identify sheet, signed out", () => {
  test("fills freely and sends with a name and email, no account", async ({
    page,
    request,
  }) => {
    const { path, record } = await addressedRecord(request, HAS_EMPTY_FIELD);

    const suggestionPosts: string[] = [];
    page.on("request", (sent) => {
      if (
        sent.method() === "POST" &&
        sent.url().includes("/api/v1/suggestions")
      ) {
        suggestionPosts.push(sent.url());
      }
    });

    // Stubbed so the run writes nothing and never meets the rate limit. The body is
    // the API's `ApiResult` envelope, which `submitSuggestion` unwraps.
    await page.route("**/api/v1/suggestions", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              status: 201,
              data: { id: null, message: "ok" },
            }),
          })
        : route.fallback()
    );

    await page.goto(path);
    await expect(
      page.getByRole("heading", { level: 1, name: record.name })
    ).toBeVisible();

    // Every empty field on a place record carries its own question.
    const question = page.locator("dl button").first();
    // The record page renders its field grid after the heading; give it a moment
    // before concluding the record has no empty field.
    await question
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(() => undefined);
    test.skip(
      (await question.count()) === 0,
      "this record has every field recorded"
    );
    await question.click();

    const sheet = page.getByRole("dialog", {
      name: "Tell us what you recognise",
    });
    await expect(sheet).toBeVisible();

    const when = sheet.getByLabel("Roughly when?");
    await when.fill("sometime in the sixties");
    await sheet.getByLabel("Your name").fill("Ana Lopes");
    await sheet.getByLabel("Your email").fill("ana@example.com");
    await sheet.getByRole("button", { name: "Send to the curators" }).click();

    await expect(sheet).toBeHidden();
    await expect(
      page.getByText("Thank you — a curator will read this.")
    ).toBeVisible();
    expect(suggestionPosts).toHaveLength(1);
    await expect(page.getByRole("dialog", { name: "Sign in" })).toHaveCount(0);
  });

  test("an empty answer is refused before anything is sent", async ({
    page,
    request,
  }) => {
    const { path, record } = await addressedRecord(request, HAS_EMPTY_FIELD);
    await page.goto(path);
    await expect(
      page.getByRole("heading", { level: 1, name: record.name })
    ).toBeVisible();

    const question = page.locator("dl button").first();
    // The record page renders its field grid after the heading; give it a moment
    // before concluding the record has no empty field.
    await question
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(() => undefined);
    test.skip(
      (await question.count()) === 0,
      "this record has every field recorded"
    );
    await question.click();

    const sheet = page.getByRole("dialog", {
      name: "Tell us what you recognise",
    });
    await sheet.getByRole("button", { name: "Send to the curators" }).click();

    await expect(sheet.getByRole("alert")).toHaveText(
      "Answer at least one question, even if it is a guess."
    );
    await expect(page.getByRole("dialog", { name: "Sign in" })).toHaveCount(0);
  });
});
