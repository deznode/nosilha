import { beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env } as NodeJS.ProcessEnv;

function clearSupabaseEnv() {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.STORYBOOK;
  delete process.env.NEXT_PUBLIC_SUPABASE_USE_STUB;
}

function setNodeEnv(value: string) {
  process.env = { ...process.env, NODE_ENV: value } as NodeJS.ProcessEnv;
}

beforeEach(() => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  clearSupabaseEnv();
});

describe("supabase-client getClient", () => {
  it("allows using the stub client in production when Storybook flag is set", async () => {
    setNodeEnv("production");
    process.env.STORYBOOK = "true";

    const module = await import("../../../src/lib/supabase-client");
    expect(module.supabase).toBeDefined();
  });

  it("throws in production when env vars are missing and stub flag is disabled", async () => {
    setNodeEnv("production");

    await expect(import("../../../src/lib/supabase-client")).rejects.toThrow(
      /Supabase URL or anonymous key is not defined/
    );
  });
});
