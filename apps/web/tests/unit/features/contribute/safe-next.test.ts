import { describe, it, expect } from "vitest";
import { safeNext } from "@/features/contribute/lib/safe-next";

const ORIGIN = "https://nosilha.com";

describe("safeNext", () => {
  it("accepts a same-origin path with a query string", () => {
    expect(safeNext("/contribute/media?resume=1", ORIGIN)).toBe(
      "/contribute/media?resume=1"
    );
  });

  it("accepts a bare path", () => {
    expect(safeNext("/contribute/media", ORIGIN)).toBe("/contribute/media");
  });

  it("preserves a hash fragment", () => {
    expect(safeNext("/history/brava#section", ORIGIN)).toBe(
      "/history/brava#section"
    );
  });

  it("rejects a protocol-relative URL", () => {
    expect(safeNext("//evil.com", ORIGIN)).toBe("/");
  });

  it("rejects a backslash trick", () => {
    expect(safeNext("/\\evil.com", ORIGIN)).toBe("/");
  });

  it("rejects an absolute URL to another origin", () => {
    expect(safeNext("https://evil.com", ORIGIN)).toBe("/");
  });

  it("rejects a javascript: URL", () => {
    expect(safeNext("javascript:alert(1)", ORIGIN)).toBe("/");
  });

  it("rejects an empty string", () => {
    expect(safeNext("", ORIGIN)).toBe("/");
  });

  it("rejects null and undefined", () => {
    expect(safeNext(null, ORIGIN)).toBe("/");
    expect(safeNext(undefined, ORIGIN)).toBe("/");
  });

  it("works given a dev-server origin (browser and route-handler contexts alike)", () => {
    expect(
      safeNext("/contribute/media?resume=1", "http://localhost:3000")
    ).toBe("/contribute/media?resume=1");
  });
});
