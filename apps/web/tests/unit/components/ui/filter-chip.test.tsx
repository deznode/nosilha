import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FilterChip } from "@/components/ui/filter-chip";

describe("FilterChip", () => {
  it("shows a positive count beside the label", () => {
    render(<FilterChip label="Has records" count={3} />);

    expect(screen.getByRole("button")).toHaveTextContent("Has records3");
  });

  it("hides a zero count by default, so existing callers are unchanged", () => {
    render(<FilterChip label="Nothing yet" count={0} />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows a legitimate zero when asked", () => {
    render(<FilterChip label="Nothing yet" count={0} showZero />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("shows nothing when there is no count, even with showZero", () => {
    render(<FilterChip label="All settlements" showZero />);

    expect(screen.getByRole("button")).toHaveTextContent(/^All settlements$/);
  });

  it("does not forward showZero to the DOM", () => {
    render(<FilterChip label="Nothing yet" count={0} showZero />);

    expect(screen.getByRole("button")).not.toHaveAttribute("showZero");
    expect(screen.getByRole("button")).not.toHaveAttribute("showzero");
  });
});
