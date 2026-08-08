import { vi } from "vitest";
import type { ReactNode, PropsWithChildren } from "react";

/**
 * Shared framer-motion mock for unit tests.
 *
 * Keeps the real module intact and replaces only the animation surface, so a
 * component that later reaches for `useAnimation`/`useScroll` keeps working
 * instead of failing with "no export named …". Motion-only props are stripped
 * before they reach the DOM to avoid React unknown-attribute warnings.
 *
 * `vi.mock` factories are hoisted, so import this dynamically:
 *
 * ```ts
 * vi.mock("framer-motion", async () => {
 *   const { createFramerMotionMock } = await import(
 *     "../../../setup/framer-motion-mock"
 *   );
 *   return createFramerMotionMock();
 * });
 * ```
 */
const MOTION_ONLY_PROPS = [
  "variants",
  "initial",
  "animate",
  "exit",
  "whileHover",
  "whileTap",
  "whileInView",
  "viewport",
  "layout",
  "layoutId",
  "transition",
  "drag",
  "dragConstraints",
];

function stripMotionProps(props: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !MOTION_ONLY_PROPS.includes(key))
  );
}

export async function createFramerMotionMock() {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");

  const element = (Tag: "div" | "span" | "section" | "li" | "button") => {
    const Motion = ({
      children,
      ...props
    }: PropsWithChildren<Record<string, unknown>>) => (
      <Tag {...stripMotionProps(props)}>{children}</Tag>
    );
    Motion.displayName = `motion.${Tag}`;
    return Motion;
  };

  return {
    ...actual,
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    motion: {
      div: element("div"),
      span: element("span"),
      section: element("section"),
      li: element("li"),
      button: element("button"),
    },
    useReducedMotion: () => true,
  };
}
