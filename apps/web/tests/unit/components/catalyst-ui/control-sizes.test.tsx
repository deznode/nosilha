import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";

/**
 * Spec 037 FR-010 — the blocking system change.
 *
 * Both components shipped at 36px with no size prop, and neither a host `style`
 * nor a passed `className` could override it: for `Button` the base classes are
 * emitted after `className` and win on equal specificity, and for `Input` the
 * caller's `className` lands on the outer wrapper and never reaches the real
 * `<input>` at all. The site chrome needs 44px, so height became a variant.
 *
 * The guard that matters here is the *default*: `sizes.md` is the string moved
 * verbatim out of the old base, so every existing call site must render exactly
 * what it did before.
 */
describe("Catalyst control sizes", () => {
  describe("Button", () => {
    const DEFAULT_PADDING =
      "px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6";

    it("keeps the original padding when size is omitted", () => {
      render(<Button>Save</Button>);
      const button = screen.getByRole("button", { name: "Save" });

      for (const cls of DEFAULT_PADDING.split(" ")) {
        expect(button.className).toContain(cls);
      }
      expect(button.className).not.toContain("h-11");
      // Alignment moved out of `base` into the size map; the default must keep it.
      expect(button.className).toContain("items-baseline");
    });

    it("pins 44px at every breakpoint for size=lg", () => {
      render(<Button size="lg">Contribute</Button>);
      const button = screen.getByRole("button", { name: "Contribute" });

      expect(button.className).toContain("h-11");
      // No `sm:` step-down — chrome controls must not shrink at wider widths.
      expect(button.className).not.toContain(
        "sm:py-[calc(--spacing(1.5)-1px)]"
      );
      // A fixed height with baseline alignment leaves the label 4px from the top
      // and 23px from the bottom of the control.
      expect(button.className).toContain("items-center");
      expect(button.className).not.toContain("items-baseline");
    });

    it("offers an on-dark action colour that is not ocean blue", () => {
      render(
        <Button size="lg" color="accentOnDark">
          Subscribe
        </Button>
      );
      const button = screen.getByRole("button", { name: "Subscribe" });

      expect(button.className).toContain(
        "--btn-bg:var(--color-accent-on-dark)"
      );
      expect(button.className).not.toContain("--color-primary");
    });
  });

  describe("Input", () => {
    it("keeps the original padding when size is omitted", () => {
      render(<Input aria-label="Email" />);
      const input = screen.getByLabelText("Email");

      expect(input.className).toContain("px-[calc(--spacing(3.5)-1px)]");
      expect(input.className).not.toContain("h-11");
    });

    it("pins 44px for size=lg", () => {
      render(<Input aria-label="Email" size="lg" />);
      expect(screen.getByLabelText("Email").className).toContain("h-11");
    });

    it("drops theme-reactive colours under appearance=onDark", () => {
      render(<Input aria-label="Email" size="lg" appearance="onDark" />);
      const input = screen.getByLabelText("Email");

      expect(input.className).toContain("bg-footer-input-bg");
      // The default pair assumes a light page and would resolve to its light
      // value on the footer's permanently dark ground.
      expect(input.className).not.toContain("dark:bg-background-primary/5");
    });
  });
});
