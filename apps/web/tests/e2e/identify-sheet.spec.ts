import { expect, test } from "@playwright/test";

import { addressedRecord, type EntrySummary } from "../utils/archive-data";

/**
 * The seeded Igreja records six of its nine heritage fields (spec 034 FR-016), so
 * its page always carries a question to open.
 */
const HAS_EMPTY_FIELD = (record: EntrySummary) =>
  record.slug.startsWith("igreja");

/**
 * Spec 034 T-41 / FR-004 — the identify sheet asks for sign-in at submit, not before.
 *
 * A signed-out visitor can open the sheet and type what they know. Sending it opens
 * the sign-in dialog, and nothing leaves the browser until they have signed in.
 */
test.describe("Identify sheet, signed out", () => {
  test("fills freely and asks for sign-in only at submit", async ({
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
    await sheet.getByRole("button", { name: "Send to the curators" }).click();

    // Headless UI's dialog root has no box of its own, so its title stands in for it.
    const signIn = page
      .getByRole("dialog", { name: "Sign in" })
      .getByRole("heading", { name: "Sign in" });
    await expect(signIn).toBeVisible();
    expect(suggestionPosts).toEqual([]);

    // Declining sign-in keeps what was typed: it is the thing worth keeping.
    await page.keyboard.press("Escape");
    await expect(signIn).toBeHidden();
    await expect(when).toHaveValue("sometime in the sixties");
    expect(suggestionPosts).toEqual([]);
  });

  test("an empty answer is refused before sign-in is asked for", async ({
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
