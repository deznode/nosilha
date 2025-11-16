import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Banner from "@/components/ui/banner";

const baseProps = {
  title: "Celebrating Morna",
  message: "Honoring Eugénio Tavares and the poets of Brava.",
};

describe("Banner", () => {
  it("renders title, message, and emoji accents", () => {
    render(<Banner {...baseProps} />);

    expect(
      screen.getByText(baseProps.title, { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText(baseProps.message)).toBeInTheDocument();
  });

  it("dismisses when close button is clicked", () => {
    render(<Banner {...baseProps} />);

    const dismissButton = screen.getByRole("button", {
      name: /dismiss banner/i,
    });
    fireEvent.click(dismissButton);

    expect(
      screen.queryByText(baseProps.title, { exact: false })
    ).not.toBeInTheDocument();
  });

  it("renders as a link when linkUrl is provided", () => {
    const url = "https://nosilha.com/story";
    render(<Banner {...baseProps} linkUrl={url} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", url);
  });
});
