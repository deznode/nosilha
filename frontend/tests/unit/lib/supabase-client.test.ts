import { beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

function clearSupabaseEnv() {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.STORYBOOK;
  delete process.env.NEXT_PUBLIC_SUPABASE_USE_STUB;
}

beforeEach(() => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV };
  clearSupabaseEnv();
});

describe("supabase-client getClient", () => {
  it("allows using the stub client in production when Storybook flag is set", async () => {
    process.env.NODE_ENV = "production";
    process.env.STORYBOOK = "true";

    const module = await import("../../../src/lib/supabase-client");
    expect(module.supabase).toBeDefined();
  });

  it("throws in production when env vars are missing and stub flag is disabled", async () => {
    process.env.NODE_ENV = "production";

    await expect(import("../../../src/lib/supabase-client")).rejects.toThrow(
      /Supabase URL or anonymous key is not defined/
    );
  });
});
