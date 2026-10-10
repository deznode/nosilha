import { expect, test } from "@playwright/test";

import { photographs } from "../utils/archive-data";
import { stubSuggestionPosts } from "../utils/network";

/**
 * Spec 040 FR-007, FR-008 — a visitor follows an ask link from a group chat, with no
 * account, and tells the archive what they know.
 */
test("answers an ask link signed out", async ({ page, request }) => {
  // Any active photograph will do if it is missing its photographer, which the seeded
  // archive's uploads all are.
  const photo = (await photographs(request)).find(
    (item) => !item.photographerCredit?.trim()
  );
  test.skip(
    !photo,
    "no photograph in this archive is missing its photographer"
  );

  const posts = await stubSuggestionPosts(page);

  await page.goto(
    `/photographs/${photo!.id}?ask=1&utm_source=share&utm_medium=link&utm_campaign=ask`
  );

  // The photograph first, the question beside it, and no sheet over it.
  await expect(
    page.getByText("Do you recognise this photograph?")
  ).toBeVisible();
  const sheet = page.getByRole("dialog", {
    name: "Tell us what you recognise",
  });
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("note")).toContainText("From the Brava archive");

  await page.getByRole("button", { name: "Tell us" }).click();
  await expect(sheet).toBeVisible();

  await sheet.getByLabel("Who is in it?").fill("My grandmother, Maria");
  await sheet.getByLabel("Your name").fill("Ana Lopes");
  await sheet.getByLabel("Your email").fill("ana@example.com");
  await sheet.getByRole("button", { name: "Send to the curators" }).click();

  await expect(sheet).toBeHidden();
  await expect(
    page.getByText("Thank you — a curator will read this.")
  ).toBeVisible();
  expect(posts).toHaveLength(1);
  expect(posts[0]).toMatchObject({
    name: "Ana Lopes",
    email: "ana@example.com",
    suggestionType: "PHOTO_IDENTIFICATION",
    mediaId: photo!.id,
  });
});
