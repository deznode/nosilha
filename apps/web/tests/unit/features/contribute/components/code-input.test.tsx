import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { CodeInput } from "@/features/contribute/components/code-input";

function Harness({
  onComplete,
  initial = "",
  invalid = false,
}: {
  onComplete: (code: string) => void;
  initial?: string;
  invalid?: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <CodeInput
        value={value}
        onChange={setValue}
        onComplete={onComplete}
        invalid={invalid}
        errorId={invalid ? "err" : undefined}
      />
      {invalid && <p id="err">That code doesn&apos;t match.</p>}
    </>
  );
}

const boxes = () => screen.getAllByTestId("code-box");

describe("CodeInput", () => {
  it("is one real numeric one-time-code input", () => {
    render(<Harness onComplete={vi.fn()} />);
    const input = screen.getByLabelText("6-digit code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("maxlength", "6");
    expect(input).toHaveAttribute("pattern", "[0-9]*");
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(boxes()).toHaveLength(6);
  });

  it("strips non-digits", async () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    await userEvent.type(screen.getByLabelText("6-digit code"), "4a8-1");
    expect(boxes().map((b) => b.textContent)).toEqual([
      "4",
      "8",
      "1",
      "",
      "",
      "",
    ]);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("submits when the sixth digit is typed", async () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    await userEvent.type(screen.getByLabelText("6-digit code"), "481902");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("481902");
  });

  it("paste fills all six and submits, even with separators", async () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} initial="12" />);
    const input = screen.getByLabelText("6-digit code");
    input.focus();
    await userEvent.paste("482 913");
    expect(
      boxes()
        .map((b) => b.textContent)
        .join("")
    ).toBe("482913");
    expect(onComplete).toHaveBeenCalledWith("482913");
  });

  it("draws the focused box in blue and all six in red when invalid", () => {
    const { rerender } = render(<Harness onComplete={vi.fn()} initial="48" />);
    fireEvent.focus(screen.getByLabelText("6-digit code"));
    expect(boxes()[2].className).toContain("border-ocean-blue");
    expect(boxes()[0].className).toContain("border-edge");

    rerender(<Harness onComplete={vi.fn()} initial="481902" invalid />);
    for (const box of boxes()) {
      expect(box.className).toContain("border-status-error");
    }
    expect(screen.getByLabelText("6-digit code")).toHaveAttribute(
      "aria-describedby",
      "err"
    );
  });

  it("pasting exactly 123456 fills the boxes and submits once", async () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    screen.getByLabelText("6-digit code").focus();
    await userEvent.paste("123456");
    expect(
      boxes()
        .map((b) => b.textContent)
        .join("")
    ).toBe("123456");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("keeps the typed code when a wrong result flips it to invalid", async () => {
    function VerifyHarness() {
      const [value, setValue] = useState("");
      const [invalid, setInvalid] = useState(false);
      return (
        <CodeInput
          value={value}
          onChange={setValue}
          onComplete={() => setInvalid(true)}
          invalid={invalid}
        />
      );
    }
    render(<VerifyHarness />);
    const input = screen.getByLabelText("6-digit code");

    await userEvent.type(input, "481902");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveValue("481902");
    expect(
      boxes()
        .map((b) => b.textContent)
        .join("")
    ).toBe("481902");
  });

  it("keeps the entered value in the wrong state", () => {
    render(<Harness onComplete={vi.fn()} initial="481902" invalid />);
    expect(screen.getByLabelText("6-digit code")).toHaveValue("481902");
    expect(boxes().map((b) => b.textContent)).toEqual([
      "4",
      "8",
      "1",
      "9",
      "0",
      "2",
    ]);
    expect(screen.getByText("That code doesn't match.")).toBeInTheDocument();
  });
});
