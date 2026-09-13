import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const signInWithPassword = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase-client", () => ({
  supabase: { auth: { signInWithPassword } },
}));

vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

import { SignInDialog } from "@/components/auth/sign-in-dialog";

const held = {
  photographer: "not known",
  source: "Maria Lopes",
  place: "",
};

function fillCredentials() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "maria@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "secret-pass" },
  });
}

describe("SignInDialog", () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
  });

  it("shows the held contribution, marking unrecorded fields", () => {
    render(
      <SignInDialog open onClose={vi.fn()} onSignedIn={vi.fn()} held={held} />
    );

    expect(
      screen.getByText("Your photograph is held, not lost")
    ).toBeInTheDocument();
    expect(screen.getByText("not known")).toBeInTheDocument();
    expect(screen.getByText("Maria Lopes")).toBeInTheDocument();
    expect(screen.getByText("not yet recorded")).toBeInTheDocument();
  });

  it("says plainly that creating an account leaves the page", () => {
    render(
      <SignInDialog open onClose={vi.fn()} onSignedIn={vi.fn()} held={held} />
    );

    expect(screen.getByRole("link", { name: "Create one" })).toHaveAttribute(
      "href",
      "/signup?returnUrl=%2Fcontribute%2Fmedia"
    );
    expect(screen.getByText(/the photograph is not kept/i)).toBeInTheDocument();
  });

  it("signs in with email and password and reports success", async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: null });
    const onSignedIn = vi.fn();
    render(
      <SignInDialog
        open
        onClose={vi.fn()}
        onSignedIn={onSignedIn}
        held={held}
      />
    );

    fillCredentials();
    fireEvent.click(screen.getByRole("button", { name: "Sign in and submit" }));

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledTimes(1));
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "maria@example.com",
      password: "secret-pass",
    });
  });

  it("shows the sign-in error and does not report success", async () => {
    signInWithPassword.mockResolvedValue({
      data: {},
      error: new Error("Invalid login credentials"),
    });
    const onSignedIn = vi.fn();
    render(
      <SignInDialog
        open
        onClose={vi.fn()}
        onSignedIn={onSignedIn}
        held={held}
      />
    );

    fillCredentials();
    fireEvent.click(screen.getByRole("button", { name: "Sign in and submit" }));

    expect(
      await screen.findByText("Invalid login credentials")
    ).toBeInTheDocument();
    expect(onSignedIn).not.toHaveBeenCalled();
  });
});
