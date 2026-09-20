import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PhotographsContent } from "@/components/photographs/photographs-content";
import { photographsQueryKey } from "@/hooks/queries/usePhotographsQuery";
import type {
  GalleryFacets,
  PublicExternalMedia,
  PublicUserUploadMedia,
} from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

const replace = vi.fn();
const push = vi.fn();
let searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
  useSearchParams: () => searchParams,
}));

vi.mock("@/components/search", () => ({
  UnifiedSearch: () => <div data-testid="unified-search" />,
}));

const getGalleryMedia = vi.fn();
vi.mock("@/lib/api", () => ({
  getGalleryMedia: (...args: unknown[]) => getGalleryMedia(...args),
}));

function upload(
  overrides: Partial<PublicUserUploadMedia> = {}
): PublicUserUploadMedia {
  return {
    id: "p1",
    title: null,
    description: null,
    category: null,
    displayOrder: 0,
    mediaSource: "USER_UPLOAD",
    altText: null,
    createdAt: "2024-01-01T00:00:00Z",
    publicUrl: "https://cdn.example/a.jpg",
    originalName: "a.jpg",
    width: 388,
    height: 300,
    ...overrides,
  };
}

function film(
  overrides: Partial<PublicExternalMedia> = {}
): PublicExternalMedia {
  return {
    id: "f1",
    title: "Brava from the sea",
    description: null,
    category: null,
    displayOrder: 0,
    mediaSource: "EXTERNAL",
    altText: null,
    createdAt: "2024-01-01T00:00:00Z",
    mediaType: "VIDEO",
    platform: "YOUTUBE",
    externalId: "abc",
    url: "https://youtu.be/abc",
    thumbnailUrl: null,
    embedUrl: null,
    author: null,
    ...overrides,
  };
}

const FACETS: GalleryFacets = {
  total: 26,
  photographs: 17,
  films: 9,
  withPlace: 11,
  withoutPlace: 15,
  withoutDate: 14,
  uncredited: 26,
};

const TOWNS: TownStatusSummary[] = [
  {
    id: "t1",
    slug: "nova-sintra",
    name: "Nova Sintra",
    description: "",
    latitude: 14.8632,
    longitude: -24.7183,
    entryCount: 5,
    hasPhotograph: false,
    status: "PARTIAL",
    population: null,
    elevation: null,
    photographCount: 0,
    unconfirmedPhotographCount: 3,
  },
];

const LOCATED = [
  upload({ id: "loc-1", latitude: 14.86, longitude: -24.71 }),
  upload({ id: "loc-2", latitude: 14.87, longitude: -24.72 }),
];

function renderContent(
  overrides: Partial<React.ComponentProps<typeof PhotographsContent>> = {},
  seed: { items: PublicUserUploadMedia[]; totalItems: number } = {
    items: LOCATED,
    totalItems: 11,
  }
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const props = {
    facets: FACETS,
    towns: TOWNS,
    unlocated: [upload({ id: "un-1" }), upload({ id: "un-2" })],
    films: [film()],
    initialFilter: "place" as const,
    initialRegion: undefined,
    ...overrides,
  };

  client.setQueryData(
    photographsQueryKey(
      props.initialFilter,
      props.initialRegion
        ? {
            slug: "nova-sintra",
            name: "Nova Sintra",
            nearLat: 14.8632,
            nearLng: -24.7183,
          }
        : null
    ),
    { ...seed, totalPages: 1, currentPage: 0 }
  );

  return render(
    <QueryClientProvider client={client}>
      <PhotographsContent {...props} />
    </QueryClientProvider>
  );
}

/** Spec 034 T-30 / FR-009 — the archive's photographs, and what they lack. */
describe("PhotographsContent", () => {
  beforeEach(() => {
    searchParams = new URLSearchParams();
    getGalleryMedia.mockResolvedValue({
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("heads the screen and states the archive from the facets", () => {
    renderContent();

    expect(
      screen.getByRole("heading", { level: 1, name: "Photographs" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Twenty-six records: seventeen photographs and nine films. Eleven carry " +
          "coordinates read from the file. None carries a photographer."
      )
    ).toBeInTheDocument();
  });

  it("counts each chip from the whole archive, not the loaded page", () => {
    renderContent();

    for (const [label, count] of [
      ["With a place", "11"],
      ["No place", "15"],
      ["No date", "14"],
      ["Films", "9"],
    ]) {
      const chip = screen.getByRole("button", { name: new RegExp(label) });
      expect(within(chip).getByText(count)).toBeInTheDocument();
    }
  });

  it("writes the chosen filter into the URL", async () => {
    const user = userEvent.setup();
    renderContent();

    await user.click(screen.getByRole("button", { name: /No place/ }));

    expect(replace).toHaveBeenCalledWith("/photographs?filter=noplace", {
      scroll: false,
    });
  });

  it("shows the area pill and clears it back out of the URL", async () => {
    const user = userEvent.setup();
    renderContent({ initialRegion: "nova-sintra" });

    const pill = screen.getByRole("button", { name: /Area: Nova Sintra/ });
    await user.click(pill);

    expect(replace).toHaveBeenCalledWith("/photographs?filter=place", {
      scroll: false,
    });
  });

  it("follows the URL's region when it arrives without a remount", () => {
    // A settlement's "See the N unconfirmed photographs" link can land on a
    // `/photographs` already on screen. Mirrored state would ignore the region.
    const { rerender } = render(
      <QueryClientProvider client={new QueryClient()}>
        <PhotographsContent
          facets={FACETS}
          towns={TOWNS}
          unlocated={[]}
          films={[]}
          initialFilter="place"
          initialRegion={undefined}
        />
      </QueryClientProvider>
    );
    expect(
      screen.queryByRole("button", { name: /Area:/ })
    ).not.toBeInTheDocument();

    searchParams = new URLSearchParams("filter=place&region=nova-sintra");
    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <PhotographsContent
          facets={FACETS}
          towns={TOWNS}
          unlocated={[]}
          films={[]}
          initialFilter="place"
          initialRegion={undefined}
        />
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("button", { name: /Area: Nova Sintra/ })
    ).toBeInTheDocument();
  });

  it("counts what it shows against the filter's total", () => {
    renderContent();
    expect(screen.getByText("Showing 2 of 11")).toBeInTheDocument();
  });

  it("names the area in the showing line", () => {
    renderContent({ initialRegion: "nova-sintra" });
    expect(
      screen.getByText("Showing 2 of 11 near Nova Sintra")
    ).toBeInTheDocument();
  });

  it("shows the dashed empty state when nothing matches", () => {
    renderContent({}, { items: [], totalItems: 0 });

    expect(
      screen.getByText("Nothing in the archive matches that")
    ).toBeInTheDocument();
    expect(screen.getByText("Try another filter.")).toBeInTheDocument();
  });

  it("lists every unlocated record in the tray with the archive's own count", () => {
    renderContent();

    expect(
      screen.getByRole("heading", {
        name: "Fifteen photographs carry no coordinates",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Two of them are shown below\./)
    ).toBeInTheDocument();
  });

  it("sends Help place them into a record, not at the collection", () => {
    renderContent();

    // The identify sheet takes one subject; a button about a collection has none, so
    // this opens a record where the question sits next to the picture it is about.
    expect(
      screen.getByRole("link", { name: "Help place them" })
    ).toHaveAttribute("href", "/photographs/un-1");
  });

  it("opens a random unlocated record from Show me one that needs help", async () => {
    const user = userEvent.setup();
    renderContent();

    await user.click(
      screen.getByRole("button", { name: "Show me one that needs help" })
    );

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0][0]).toMatch(/^\/photographs\/un-[12]$/);
  });

  it("hides that offer when every record is placed", () => {
    renderContent({ unlocated: [] });

    expect(
      screen.queryByRole("button", { name: "Show me one that needs help" })
    ).not.toBeInTheDocument();
  });

  it("lists films with no length recorded", () => {
    renderContent();

    expect(screen.getByRole("heading", { name: "Films" })).toBeInTheDocument();
    // The archive holds nine films (FACETS.films) and this page loaded one; the
    // sentence counts the archive, not the page (FR-018).
    expect(
      screen.getByText("Nine, synced from YouTube. None records a length.")
    ).toBeInTheDocument();
    expect(screen.getByText("length not recorded")).toBeInTheDocument();
  });

  it("drops the tray and the duplicate films section while filtering films", () => {
    renderContent({ initialFilter: "films" }, { items: [], totalItems: 0 });

    // The chip above already says "Films"; a second heading would read as a second
    // list, and the tray is about photographs, which this view is not showing.
    expect(
      screen.queryByRole("heading", { name: "Films" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /carry no coordinates/ })
    ).not.toBeInTheDocument();
  });

  it("renders films as cards rather than photograph tiles", () => {
    renderContent(
      { initialFilter: "films" },
      { items: [film() as never], totalItems: 1 }
    );

    // A film has no file and no photographer; the photo tile would claim both.
    expect(screen.getByText("Brava from the sea")).toBeInTheDocument();
    expect(screen.getByText("length not recorded")).toBeInTheDocument();
    expect(screen.queryByText("no photographer")).not.toBeInTheDocument();
    expect(screen.queryByText("no title")).not.toBeInTheDocument();
  });

  it("opens search in place rather than linking at a page that does not exist", async () => {
    const user = userEvent.setup();
    renderContent();

    expect(screen.queryByTestId("unified-search")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Search the archive/ })
    );
    expect(screen.getByTestId("unified-search")).toBeInTheDocument();
  });
});
