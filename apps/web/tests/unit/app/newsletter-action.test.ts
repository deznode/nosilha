import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The newsletter action reads Resend's `{ data, error }` result: the SDK reports
 * API failures in `error` instead of throwing, so a rejected subscribe must not
 * be answered with "Thank you for subscribing!".
 */

const mocks = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock("resend", () => ({
  Resend: vi.fn(function Resend() {
    return { contacts: { create: mocks.create } };
  }),
}));

import { subscribeToNewsletter } from "@/app/actions/newsletter";

function form(email: string) {
  const data = new FormData();
  data.set("email", email);
  data.set("locale", "en");
  return data;
}

beforeEach(() => {
  mocks.create.mockReset();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("subscribeToNewsletter", () => {
  it("thanks the reader when Resend creates the contact", async () => {
    mocks.create.mockResolvedValue({ data: { id: "c1" }, error: null });

    await expect(subscribeToNewsletter(form("a@example.com"))).resolves.toEqual(
      { success: true, message: "Thank you for subscribing!" }
    );
  });

  it("reports a failure when Resend returns an error", async () => {
    mocks.create.mockResolvedValue({
      data: null,
      error: {
        statusCode: 400,
        message: "API key is invalid",
        name: "validation_error",
      },
    });

    await expect(subscribeToNewsletter(form("a@example.com"))).resolves.toEqual(
      {
        success: false,
        message: "Failed to subscribe. Please try again later.",
      }
    );
    expect(mocks.create).toHaveBeenCalledTimes(1);
  });

  it("asks the reader to wait when Resend rate-limits", async () => {
    mocks.create.mockResolvedValue({
      data: null,
      error: {
        statusCode: 429,
        message: "Too many requests",
        name: "rate_limit_exceeded",
      },
    });

    const result = await subscribeToNewsletter(form("a@example.com"));
    expect(result).toMatchObject({ success: false });
    expect(result.message).toMatch(/too many requests/i);
  });

  it("retries once when Resend returns a server error", async () => {
    mocks.create
      .mockResolvedValueOnce({
        data: null,
        error: { statusCode: 503, message: "Unavailable", name: "api_error" },
      })
      .mockResolvedValueOnce({ data: { id: "c2" }, error: null });

    await expect(
      subscribeToNewsletter(form("a@example.com"))
    ).resolves.toMatchObject({ success: true });
    expect(mocks.create).toHaveBeenCalledTimes(2);
  });

  it("answers a known address like a new one", async () => {
    mocks.create.mockResolvedValue({
      data: null,
      error: {
        statusCode: 409,
        message: "Contact already exists",
        name: "validation_error",
      },
    });

    await expect(
      subscribeToNewsletter(form("a@example.com"))
    ).resolves.toMatchObject({ success: true });
  });
});
