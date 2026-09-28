import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DESKTOP_QUERY,
  ResponsiveSheet,
} from "@/features/contribute/components/responsive-sheet";

import { mockMatchMedia } from "../../../../setup/match-media-mock";

let media: ReturnType<typeof mockMatchMedia>;

afterEach(() => media?.restore());

function renderSheet(onClose = vi.fn()) {
  render(
    <>
      <button>Trigger</button>
      <ResponsiveSheet open onClose={onClose} label="Confirm it's you">
        <button>Email me a code</button>
      </ResponsiveSheet>
    </>
  );
  return onClose;
}

describe("ResponsiveSheet", () => {
  it("renders one bottom sheet on phones", () => {
    media = mockMatchMedia({ [DESKTOP_QUERY]: false });
    renderSheet();

    const dialogs = screen.getAllByRole("dialog", { name: "Confirm it's you" });
    expect(dialogs).toHaveLength(1);
    expect(dialogs[0].className).toContain("rounded-t-[16px]");
    expect(screen.getAllByText("Email me a code")).toHaveLength(1);
  });

  it("renders one centred dialog from md up", () => {
    media = mockMatchMedia({ [DESKTOP_QUERY]: true });
    renderSheet();

    const dialogs = screen.getAllByRole("dialog", { name: "Confirm it's you" });
    expect(dialogs).toHaveLength(1);
    expect(screen.getAllByText("Email me a code")).toHaveLength(1);
  });

  it.each([false, true])("closes on Escape (desktop: %s)", async (desktop) => {
    media = mockMatchMedia({ [DESKTOP_QUERY]: desktop });
    const onClose = renderSheet();

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });
});
