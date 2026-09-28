import { describe, it, expect } from "vitest";
import { isNewUser } from "@/features/contribute/lib/new-user";

describe("isNewUser", () => {
  it("is true when last_sign_in_at is within 10s of created_at", () => {
    const created = "2026-01-01T00:00:00.000Z";
    const signedIn = "2026-01-01T00:00:05.000Z";
    expect(isNewUser({ created_at: created, last_sign_in_at: signedIn })).toBe(
      true
    );
  });

  it("is true when the two timestamps are identical", () => {
    const t = "2026-01-01T00:00:00.000Z";
    expect(isNewUser({ created_at: t, last_sign_in_at: t })).toBe(true);
  });

  it("is false when last_sign_in_at is 10s or more after created_at", () => {
    const created = "2026-01-01T00:00:00.000Z";
    const signedIn = "2026-01-01T00:00:10.000Z";
    expect(isNewUser({ created_at: created, last_sign_in_at: signedIn })).toBe(
      false
    );
  });

  it("is false well outside the window", () => {
    const created = "2026-01-01T00:00:00.000Z";
    const signedIn = "2026-01-02T00:00:00.000Z";
    expect(isNewUser({ created_at: created, last_sign_in_at: signedIn })).toBe(
      false
    );
  });

  it("is false when created_at is missing", () => {
    expect(isNewUser({ last_sign_in_at: "2026-01-01T00:00:00.000Z" })).toBe(
      false
    );
  });

  it("is false when last_sign_in_at is missing", () => {
    expect(isNewUser({ created_at: "2026-01-01T00:00:00.000Z" })).toBe(false);
  });

  it("is false for null or undefined", () => {
    expect(isNewUser(null)).toBe(false);
    expect(isNewUser(undefined)).toBe(false);
  });

  it("is false for an unparseable timestamp", () => {
    expect(
      isNewUser({ created_at: "not-a-date", last_sign_in_at: "also-not" })
    ).toBe(false);
  });
});
