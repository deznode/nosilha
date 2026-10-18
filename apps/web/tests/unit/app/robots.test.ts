import { afterEach, describe, expect, it, vi } from "vitest";

/** `PORTUGUESE_ENABLED` is read once at module load, so each case loads afresh. */
async function loadRobots(portuguese: boolean) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ENABLE_PT", portuguese ? "true" : "false");
  const { default: robots } = await import("@/app/robots");
  const rules = robots().rules;
  return Array.isArray(rules) ? rules : [rules];
}

const ENGLISH = [
  "/admin/",
  "/api/",
  "/login",
  "/signup",
  "/test",
  "/profile",
  "/settings",
  "/sandbox/",
  "/_next/",
];

afterEach(() => {
  vi.unstubAllEnvs();
});

/** Spec 041 T-08 / FR-008. */
describe("robots", () => {
  it("is unchanged while Portuguese is off", async () => {
    const [all, googlebot] = await loadRobots(false);

    expect(all.disallow).toEqual([...ENGLISH, "/.*"]);
    expect(googlebot.disallow).toEqual(ENGLISH);
  });

  it("repeats the disallowed pages under /pt when Portuguese is on", async () => {
    const [, googlebot] = await loadRobots(true);

    expect(googlebot.disallow).toEqual([
      ...ENGLISH,
      "/pt/admin/",
      "/pt/login",
      "/pt/signup",
      "/pt/test",
      "/pt/profile",
      "/pt/settings",
      "/pt/sandbox/",
    ]);
  });

  it("does not invent /pt addresses for route handlers or Next internals", async () => {
    const [all] = await loadRobots(true);

    expect(all.disallow).not.toContain("/pt/api/");
    expect(all.disallow).not.toContain("/pt/_next/");
  });
});
