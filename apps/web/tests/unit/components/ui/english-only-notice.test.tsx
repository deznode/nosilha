import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import en from "../../../../messages/en.json";
import pt from "../../../../messages/pt-PT.json";

const intl = vi.hoisted(() => ({ locale: "en" }));

vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>();
  return {
    ...actual,
    useLocale: () => intl.locale,
    useTranslations: (namespace?: string) =>
      actual.createTranslator({
        locale: intl.locale,
        messages: intl.locale === "en" ? en : pt,
        namespace,
      } as never),
  };
});

import { EnglishOnlyNotice } from "@/components/ui/english-only-notice";

/** Spec 041 FR-006 — one Portuguese line above an English-only body. */
describe("EnglishOnlyNotice", () => {
  afterEach(() => {
    intl.locale = "en";
  });

  it("renders nothing on English pages", () => {
    const { container } = render(<EnglishOnlyNotice />);
    expect(container).toBeEmptyDOMElement();
  });

  it("says the page is English only, in Portuguese, on Portuguese pages", () => {
    intl.locale = "pt-PT";
    render(<EnglishOnlyNotice />);

    const line = screen.getByText("Esta página só está disponível em inglês.");
    expect(line.tagName).toBe("P");
    expect(line).not.toHaveAttribute("lang");
  });

  it("has an English source string for the fallback", () => {
    expect(en.common.englishOnly).toBe(
      "This page is available in English only."
    );
  });
});
