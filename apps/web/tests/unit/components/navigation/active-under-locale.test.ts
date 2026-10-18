import { describe, expect, it } from "vitest";

import {
  DESKTOP_BAR_DESTINATIONS,
  isDestinationActive,
} from "@/components/navigation/nav-config";
import { LOCALES } from "@/i18n/config";
import { splitLocalePath } from "@/i18n/paths";

const settlements = DESKTOP_BAR_DESTINATIONS.find(
  (destination) => destination.href === "/settlements"
)!;

/**
 * Spec 041 T-04 / FR-002 — the bars compare against the address without its locale
 * prefix, which is what `usePathname` from `@/i18n/navigation` returns.
 */
describe("active destination under a locale prefix", () => {
  it.each(["/settlements", "/pt/settlements"])(
    "marks Settlements active on %s",
    (address) => {
      const { pathname } = splitLocalePath(address, LOCALES);

      expect(isDestinationActive(settlements, pathname)).toBe(true);
    }
  );

  it.each(["/films", "/pt/films", "/pt"])(
    "does not mark Settlements active on %s",
    (address) => {
      const { pathname } = splitLocalePath(address, LOCALES);

      expect(isDestinationActive(settlements, pathname)).toBe(false);
    }
  );

  it("would miss a Portuguese address if it were compared with its prefix", () => {
    expect(isDestinationActive(settlements, "/pt/settlements")).toBe(false);
  });
});
