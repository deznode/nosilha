import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AnimatedButton } from "@/components/ui/animated-button";

vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

describe("AnimatedButton", () => {
  it("renders sm at the prototype's 13px with 9px 16px padding", () => {
    render(<AnimatedButton size="sm">Send</AnimatedButton>);

    expect(screen.getByRole("button")).toHaveClass(
      "text-[13px]",
      "px-4",
      "py-[9px]"
    );
  });

  it("renders md at the prototype's 14px with 11px 20px padding", () => {
    render(<AnimatedButton size="md">Send</AnimatedButton>);

    expect(screen.getByRole("button")).toHaveClass(
      "text-sm",
      "px-5",
      "py-[11px]"
    );
  });

  it("defaults to md", () => {
    render(<AnimatedButton>Send</AnimatedButton>);

    expect(screen.getByRole("button")).toHaveClass("px-5", "py-[11px]");
  });

  it("keeps the 8px radius and weight 500 at every size", () => {
    render(
      <>
        <AnimatedButton size="sm">Small</AnimatedButton>
        <AnimatedButton size="md">Medium</AnimatedButton>
        <AnimatedButton size="lg">Large</AnimatedButton>
      </>
    );

    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveClass("rounded-lg", "font-medium");
      expect(button).not.toHaveClass("rounded-button");
    }
  });

  it("fills the primary variant from the semantic primary token", () => {
    render(<AnimatedButton variant="primary">Send</AnimatedButton>);

    expect(screen.getByRole("button")).toHaveClass(
      "bg-primary",
      "text-primary-foreground"
    );
  });
});
