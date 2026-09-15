import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusDot } from "@/components/ui/status-dot";

describe("StatusDot", () => {
  it("renders the label next to the dot", () => {
    render(<StatusDot status="documented" label="documented" />);

    expect(screen.getByText("documented")).toBeVisible();
  });

  it.each([
    ["documented", "var(--brand-valley-green)"],
    ["partial", "var(--brand-ocean-blue)"],
    ["name", "var(--brand-sobrado-ochre)"],
  ] as const)("colours the %s dot from the status table", (status, colour) => {
    const { container } = render(<StatusDot status={status} label="label" />);

    const dot = container.querySelector("[data-status-dot]");
    expect(dot?.getAttribute("style")).toContain(colour);
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  it("colours the visible label with the same token as its dot", () => {
    render(<StatusDot status="partial" label="records, no photograph" />);

    expect(
      screen.getByText("records, no photograph").getAttribute("style")
    ).toContain("var(--brand-ocean-blue)");
  });

  it("never paints a status in sunny yellow", () => {
    const { container } = render(
      <>
        <StatusDot status="documented" label="a" />
        <StatusDot status="partial" label="b" />
        <StatusDot status="name" label="c" />
      </>
    );

    expect(container.innerHTML).not.toContain("yellow");
  });

  it("keeps the label for screen readers when it is visually hidden", () => {
    render(<StatusDot status="name" label="name only" hideLabel />);

    const label = screen.getByText("name only");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("sr-only");
  });

  it("forwards extra props to the root element", () => {
    render(
      <StatusDot
        status="partial"
        label="records, no photograph"
        data-testid="status"
        className="mb-2"
      />
    );

    expect(screen.getByTestId("status")).toHaveClass("mb-2");
  });
});
