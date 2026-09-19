/**
 * The film frame's three designed states. Spec 035 FR-008, artboard 2b.
 *
 * They fill the same 16:9 box as the player, so the page never moves around a missing
 * one. The blocked state carries the section's single outbound link: when the host
 * refuses the embed, the host is the only remaining way to watch.
 */

export type PlayerFrameState = "loading" | "blocked" | "removed";

/** The "mist" ink and marks the handoff draws over the dark frame. */
const MIST = "rgba(244,240,232,.82)";
const MIST_MARK = "rgba(244,240,232,.5)";
const MIST_BORDER = "rgba(244,240,232,.4)";

export const FRAME_DARK = "#15110D";

const STATES: Record<
  PlayerFrameState,
  { bg: string; mark: string; markColor: string; textColor: string }
> = {
  loading: {
    bg: FRAME_DARK,
    mark: "◌",
    markColor: MIST_MARK,
    textColor: MIST,
  },
  blocked: {
    bg: FRAME_DARK,
    mark: "⊘",
    markColor: MIST_MARK,
    textColor: MIST,
  },
  removed: {
    bg: "var(--background-secondary)",
    mark: "—",
    markColor: "var(--brand-sobrado-ochre)",
    textColor: "var(--foreground)",
  },
};

export function PlayerStateFrame({
  state,
  hostLabel,
  watchUrl,
}: {
  state: PlayerFrameState;
  /** "YouTube", "Vimeo", or how the frame names an archive file. */
  hostLabel: string;
  watchUrl: string | null;
}) {
  const look = STATES[state];
  const line =
    state === "loading"
      ? `Loading from ${hostLabel}`
      : state === "blocked"
        ? "This film will not play here. The host restricts where it can be embedded."
        : "This film is no longer available from its host. Its record stays in the archive.";

  return (
    <div
      role={state === "loading" ? "status" : undefined}
      className="absolute inset-0 flex flex-col items-center justify-center text-center"
      style={{ background: look.bg, gap: "10px", padding: "18px" }}
    >
      <span
        aria-hidden="true"
        style={{ fontSize: "20px", color: look.markColor }}
      >
        {look.mark}
      </span>
      <span
        style={{
          fontSize: "12.5px",
          lineHeight: 1.5,
          color: look.textColor,
          maxWidth: "30ch",
        }}
      >
        {line}
      </span>
      {state === "blocked" && watchUrl && (
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring"
          style={{
            fontSize: "12px",
            color: MIST,
            border: `1px solid ${MIST_BORDER}`,
            borderRadius: "8px",
            padding: "7px 12px",
          }}
        >
          Watch on {hostLabel}
        </a>
      )}
    </div>
  );
}
