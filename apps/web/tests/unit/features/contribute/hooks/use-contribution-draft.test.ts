import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const draftStore = vi.hoisted(() => ({
  probe: vi.fn(),
  save: vi.fn(),
  load: vi.fn(),
  clear: vi.fn(),
}));

vi.mock("@/features/contribute/lib/contribution-draft", () => ({
  contributionDraftStore: draftStore,
}));

import {
  resolveResume,
  useContributionDraft,
  type ResumeOutcome,
  type ResumeRequest,
} from "@/features/contribute/hooks/use-contribution-draft";

const DRAFT = {
  kind: "photo" as const,
  form: { title: "Festa" },
  file: null,
  savedAt: 1,
};

beforeEach(() => {
  for (const fn of Object.values(draftStore)) fn.mockReset();
  draftStore.load.mockResolvedValue(DRAFT);
  draftStore.clear.mockResolvedValue(undefined);
});

describe("resolveResume — the full matrix", () => {
  it.each([
    ["draft + session", DRAFT, true, false, { kind: "restored", draft: DRAFT }],
    [
      "draft, no session",
      DRAFT,
      false,
      false,
      { kind: "cancelled", draft: DRAFT },
    ],
    [
      "draft + session but Google errored",
      DRAFT,
      true,
      true,
      { kind: "restored", draft: DRAFT },
    ],
    [
      "draft, no session, Google errored",
      DRAFT,
      false,
      true,
      { kind: "cancelled", draft: DRAFT },
    ],
    ["no draft (or expired), session", null, true, false, { kind: "noDraft" }],
    ["no draft, session, Google errored", null, true, true, { kind: "none" }],
    ["no draft (or expired), no session", null, false, false, { kind: "none" }],
    [
      "no draft, no session, Google errored",
      null,
      false,
      true,
      { kind: "none" },
    ],
  ] as const)("%s", (_name, draft, signedIn, authError, expected) => {
    expect(resolveResume(draft, signedIn, authError)).toEqual(expected);
  });
});

describe("useContributionDraft", () => {
  function setup(
    props: {
      request?: ResumeRequest | null;
      authLoading?: boolean;
      signedIn?: boolean;
    } = {}
  ) {
    const onResolved = vi.fn<(o: ResumeOutcome) => void>();
    const hook = renderHook(
      (p: {
        request: ResumeRequest | null;
        authLoading: boolean;
        signedIn: boolean;
      }) => useContributionDraft({ ...p, onResolved }),
      {
        initialProps: {
          request:
            props.request === undefined ? { authError: false } : props.request,
          authLoading: props.authLoading ?? false,
          signedIn: props.signedIn ?? false,
        },
      }
    );
    return { ...hook, onResolved };
  }

  const settle = () => act(async () => {});

  it("draft + session resolves restored", async () => {
    const { onResolved } = setup({ signedIn: true });
    await settle();
    expect(onResolved).toHaveBeenCalledTimes(1);
    expect(onResolved).toHaveBeenCalledWith({ kind: "restored", draft: DRAFT });
  });

  it("draft, no session resolves cancelled", async () => {
    const { onResolved } = setup({ signedIn: false });
    await settle();
    expect(onResolved).toHaveBeenCalledWith({
      kind: "cancelled",
      draft: DRAFT,
    });
  });

  it("an expired draft (load resolves null) with a session resolves noDraft", async () => {
    draftStore.load.mockResolvedValue(null);
    const { onResolved } = setup({ signedIn: true });
    await settle();
    expect(onResolved).toHaveBeenCalledWith({ kind: "noDraft" });
  });

  it("an expired draft with no session, or a Google error, resolves none", async () => {
    draftStore.load.mockResolvedValue(null);
    const a = setup({ signedIn: false });
    await settle();
    expect(a.onResolved).toHaveBeenCalledWith({ kind: "none" });

    const b = setup({ signedIn: true, request: { authError: true } });
    await settle();
    expect(b.onResolved).toHaveBeenCalledWith({ kind: "none" });
  });

  it("reads nothing while there is no request", async () => {
    const { onResolved } = setup({ request: null, signedIn: true });
    await settle();
    expect(draftStore.load).not.toHaveBeenCalled();
    expect(onResolved).not.toHaveBeenCalled();
  });

  it("waits for the session to load before reading, then decides with it", async () => {
    const { rerender, onResolved } = setup({ authLoading: true });
    await settle();
    expect(draftStore.load).not.toHaveBeenCalled();
    expect(onResolved).not.toHaveBeenCalled();

    rerender({
      request: { authError: false },
      authLoading: false,
      signedIn: true,
    });
    await settle();
    expect(onResolved).toHaveBeenCalledTimes(1);
    expect(onResolved).toHaveBeenCalledWith({ kind: "restored", draft: DRAFT });
  });

  it("drops the result when the request goes away mid-read", async () => {
    let resolveLoad!: (d: typeof DRAFT) => void;
    draftStore.load.mockReturnValue(
      new Promise((resolve) => {
        resolveLoad = resolve;
      })
    );
    const { rerender, onResolved } = setup({ signedIn: true });

    rerender({ request: null, authLoading: false, signedIn: true });
    await act(async () => {
      resolveLoad(DRAFT);
    });
    expect(onResolved).not.toHaveBeenCalled();
  });

  it("calls the latest onResolved, not the one from the first render", async () => {
    let resolveLoad!: (d: typeof DRAFT) => void;
    draftStore.load.mockReturnValue(
      new Promise((resolve) => {
        resolveLoad = resolve;
      })
    );
    const first = vi.fn();
    const second = vi.fn();
    const request = { authError: false };
    const { rerender } = renderHook(
      ({ cb }) =>
        useContributionDraft({
          request,
          authLoading: false,
          signedIn: true,
          onResolved: cb,
        }),
      { initialProps: { cb: first } }
    );
    rerender({ cb: second });
    await act(async () => {
      resolveLoad(DRAFT);
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("clear removes the saved draft from the store", async () => {
    const { result } = setup({ request: null });
    await act(async () => {
      await result.current.clear();
    });
    expect(draftStore.clear).toHaveBeenCalledTimes(1);
  });
});
