import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusDot } from "@/components/ui/status-dot";

describe("StatusDot", () => {
  it("renders the label next to the dot", () => {
    render(<StatusDot status="documented" label="documented" />);

    expect(screen.getByText("documented")).toBeVisible();
  });

  it.each([
    ["documented", "bg-valley-green"],
    ["partial", "bg-sunny-yellow"],
    ["gap", "bg-sobrado-ochre"],
  ] as const)("colours the %s dot with %s", (status, colourClass) => {
    const { container } = render(<StatusDot status={status} label="label" />);

    const dot = container.querySelector("[data-status-dot]");
    expect(dot).toHaveClass(colourClass);
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps the label for screen readers when it is visually hidden", () => {
    render(<StatusDot status="gap" label="name only" hideLabel />);

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
