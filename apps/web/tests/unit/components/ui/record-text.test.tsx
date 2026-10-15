import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const intl = vi.hoisted(() => ({ locale: "en" }));

vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>();
  return { ...actual, useLocale: () => intl.locale };
});

import { RecordText, recordLang } from "@/components/ui/record-text";

/** Spec 041 FR-005 — record text keeps its English, marked only off English. */
describe("RecordText", () => {
  afterEach(() => {
    intl.locale = "en";
  });

  it("adds no lang attribute on English pages", () => {
    render(<RecordText>Sea level</RecordText>);

    const text = screen.getByText("Sea level");
    expect(text.tagName).toBe("SPAN");
    expect(text).not.toHaveAttribute("lang");
  });

  it("marks the text as English on Portuguese pages", () => {
    intl.locale = "pt-PT";
    render(<RecordText>1,536 (2010 census)</RecordText>);

    expect(screen.getByText("1,536 (2010 census)")).toHaveAttribute(
      "lang",
      "en"
    );
  });

  it("renders the element it is given, with its props, and nothing visible added", () => {
    intl.locale = "pt-PT";
    const { container } = render(
      <RecordText
        as="p"
        className="text-pretty"
        style={{ margin: 0 }}
        data-testid="caption"
      >
        Fishermen at Furna
      </RecordText>
    );

    const caption = screen.getByTestId("caption");
    expect(caption.tagName).toBe("P");
    expect(caption).toHaveClass("text-pretty");
    expect(caption).toHaveStyle({ margin: "0px" });
    expect(caption).toHaveAttribute("lang", "en");
    expect(container.textContent).toBe("Fishermen at Furna");
  });

  it("adds no lang when the slot holds interface text instead of a record", () => {
    intl.locale = "pt-PT";
    render(<RecordText when={false}>Untitled</RecordText>);

    expect(screen.getByText("Untitled")).not.toHaveAttribute("lang");
  });

  it("derives lang from the page locale: en off English, none on English", () => {
    expect(recordLang("en")).toBeUndefined();
    expect(recordLang("pt-PT")).toBe("en");
  });
});
