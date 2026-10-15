import { describe, expect, it, vi } from "vitest";

import messages from "../../../messages/pt-PT.json";
import { formats, TIME_ZONE } from "@/i18n/formats";
import { statusLabel } from "@/lib/status";

// The global setup binds `next-intl` to English; these tests need the real thing.
const { createFormatter, createTranslator } =
  await vi.importActual<typeof import("next-intl")>("next-intl");

const intl = {
  locale: "pt-PT",
  timeZone: TIME_ZONE,
  formats,
  messages,
} as const;

/**
 * European Portuguese, not the bare `pt` tag: `Intl` reads `pt` as Brazilian, where
 * zero takes the singular and numbers group with a dot. Spec 041, T-19.
 */
describe("Portuguese formatting", () => {
  it("treats zero as plural", () => {
    expect(new Intl.PluralRules(intl.locale).select(0)).toBe("other");
  });

  it("writes dates and numbers the European way", () => {
    const format = createFormatter(intl);
    const date = new Date(Date.UTC(2024, 6, 12));

    expect(format.dateTime(date, "longDate")).toBe("12 de julho de 2024");
    expect(format.dateTime(date, "monthYear")).toBe("julho de 2024");
    // A no-break space groups the digits; which one depends on the ICU version.
    expect(format.number(12345)).toMatch(/^12\s345$/);
  });
});

describe("Portuguese status labels", () => {
  const t = createTranslator({ ...intl, namespace: "status" });

  it("agree with what they describe", () => {
    expect(statusLabel("documented", t, "settlement")).toBe("documentada");
    expect(statusLabel("documented", t, "record")).toBe("documentado");
  });
});
