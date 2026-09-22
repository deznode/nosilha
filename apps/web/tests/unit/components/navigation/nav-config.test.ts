import { describe, expect, it } from "vitest";

import {
  BOTTOM_BAR_DESTINATIONS,
  DESTINATIONS,
  FOOTER_LEGAL_DESTINATIONS,
  SHEET_DESTINATION_LIST,
  TABLET_INLINE_DESTINATIONS,
  TABLET_OVERFLOW_DESTINATIONS,
  isDestinationActive,
  languages,
  navigation,
} from "@/components/navigation/nav-config";

const keysOf = (destinations: { key: string }[]) =>
  destinations.map((d) => d.key);

/**
 * Spec 037 FR-001 — one canonical destination list.
 *
 * Before this, five surfaces kept their own lists and disagreed: `Stay` existed
 * only in the archive bar, `Films` was missing from the bottom bar entirely, and
 * the footer carried a third set of legal links. These tests pin the membership
 * and ordering each surface declares, so a future edit to one cannot silently
 * reintroduce the divergence.
 */
describe("nav-config", () => {
  describe("resolution", () => {
    it("returns destinations in the order the keys declare", () => {
      expect(TABLET_INLINE_DESTINATIONS.map((d) => d.label)).toEqual([
        "Settlements",
        "Culture",
        "Map",
      ]);
    });

    it("gives every destination an href", () => {
      for (const destination of Object.values(DESTINATIONS)) {
        expect(destination.href).toMatch(/^\//);
      }
    });
  });

  describe("surface membership", () => {
    it("puts four icon destinations plus a synthetic More in the bottom bar", () => {
      expect(BOTTOM_BAR_DESTINATIONS.map((d) => d.label)).toEqual([
        "Home",
        "Settlements",
        "Culture",
        "Map",
      ]);
      // The bar renders an icon per item, so every bottom-bar destination needs
      // one. `resolveWithIcons` throws at module load if that ever stops holding,
      // which is what lets the renderer drop its non-null assertion.
      for (const item of BOTTOM_BAR_DESTINATIONS) {
        expect(item.icon).toBeDefined();
      }
    });

    it("carries Stay in the canonical list", () => {
      expect(DESTINATIONS.stay.href).toBe("/stay");
      expect(keysOf(TABLET_OVERFLOW_DESTINATIONS)).toContain("stay");
      expect(keysOf(SHEET_DESTINATION_LIST)).toContain("stay");
    });

    it("carries Films, which the old bottom bar omitted entirely", () => {
      expect(keysOf(SHEET_DESTINATION_LIST)).toContain("films");
      expect(keysOf(TABLET_OVERFLOW_DESTINATIONS)).toContain("films");
    });

    it("keeps the tablet inline and overflow sets disjoint", () => {
      const inline = new Set(keysOf(TABLET_INLINE_DESTINATIONS));
      expect(
        keysOf(TABLET_OVERFLOW_DESTINATIONS).some((key) => inline.has(key))
      ).toBe(false);
    });

    it("gives the footer only legal and about destinations", () => {
      expect(FOOTER_LEGAL_DESTINATIONS.map((d) => d.label)).toEqual([
        "About",
        "Contact",
        "Privacy",
        "Terms",
      ]);
    });
  });

  describe("isDestinationActive", () => {
    it("matches an exact destination only on its own path", () => {
      expect(isDestinationActive(DESTINATIONS.home, "/")).toBe(true);
      expect(isDestinationActive(DESTINATIONS.home, "/settlements")).toBe(
        false
      );
    });

    it("matches a prefix destination on its detail routes", () => {
      expect(
        isDestinationActive(DESTINATIONS.photographs, "/photographs/abc-123")
      ).toBe(true);
      expect(isDestinationActive(DESTINATIONS.films, "/films/abc-123")).toBe(
        true
      );
    });

    it("lights Culture on both of its routes", () => {
      expect(isDestinationActive(DESTINATIONS.culture, "/history")).toBe(true);
      expect(isDestinationActive(DESTINATIONS.culture, "/people")).toBe(true);
      expect(
        isDestinationActive(DESTINATIONS.culture, "/people/some-one")
      ).toBe(true);
    });

    it("does not match a sibling route that merely shares a prefix string", () => {
      // `/settlements-archive` starts with `/settlements` as a string but is not
      // beneath it as a path.
      expect(
        isDestinationActive(DESTINATIONS.settlements, "/settlements-archive")
      ).toBe(false);
    });

    it.each(["/nova-sintra", "/nova-sintra/casa-eugenio-tavares"])(
      "activates nothing on a town route (%s)",
      (pathname) => {
        const active = Object.values(DESTINATIONS).filter((d) =>
          isDestinationActive(d, pathname)
        );
        expect(active).toEqual([]);
      }
    );
  });

  describe("derived desktop navigation", () => {
    it("reuses the canonical hrefs rather than restating them", () => {
      const links = navigation.filter(
        (item): item is { name: string; href: string } => "href" in item
      );
      expect(links.find((l) => l.name === "Settlements")?.href).toBe(
        DESTINATIONS.settlements.href
      );
      expect(links.find((l) => l.name === "Films")?.href).toBe(
        DESTINATIONS.films.href
      );
    });

    it("keeps the Culture dropdown, which only the desktop bar uses", () => {
      const culture = navigation.find((item) => item.name === "Culture");
      expect(culture).toMatchObject({ type: "dropdown" });
    });
  });

  describe("languages", () => {
    it("enables only English", () => {
      expect(languages.filter((l) => !l.disabled).map((l) => l.code)).toEqual([
        "EN",
      ]);
    });
  });
});
