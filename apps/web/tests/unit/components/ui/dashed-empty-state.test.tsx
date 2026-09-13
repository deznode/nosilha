import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashedEmptyState } from "@/components/ui/dashed-empty-state";

describe("DashedEmptyState", () => {
  it("renders the title, description and actions", () => {
    render(
      <DashedEmptyState
        title="Nothing has been recorded in Lagoa yet"
        description="We have the settlement's name, its coordinates and a description."
        actions={
          <>
            <button type="button">Add a place here</button>
            <button type="button">Send a photograph</button>
          </>
        }
      />
    );

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Nothing has been recorded in Lagoa yet",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "We have the settlement's name, its coordinates and a description."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add a place here" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send a photograph" })
    ).toBeInTheDocument();
  });

  it("draws a dashed border, not a filled grey box", () => {
    const { container } = render(
      <DashedEmptyState title="Nothing yet" description="No records." />
    );

    const panel = container.firstElementChild;
    expect(panel).toHaveClass("border-dashed");
    expect(panel?.className).not.toMatch(/\bbg-/);
  });

  it("omits the action row when there are no actions", () => {
    const { container } = render(
      <DashedEmptyState title="Nothing yet" description="No records." />
    );

    expect(container.querySelector("[data-empty-state-actions]")).toBeNull();
  });

  it("lets the caller choose the heading level", () => {
    render(
      <DashedEmptyState
        title="Nothing yet"
        description="No records."
        titleAs="h2"
      />
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Nothing yet"
    );
  });
});
