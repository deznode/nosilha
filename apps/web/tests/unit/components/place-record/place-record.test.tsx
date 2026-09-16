import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PlaceRecord } from "@/components/place-record/place-record";
import { useIdentifyStore } from "@/stores/identifyStore";
import type { DirectoryEntry } from "@/types/directory";
import type { PublicUserUploadMedia } from "@/types/gallery";

const toastShow = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    success: () => ({ show: toastShow }),
    error: () => ({ show: toastShow }),
  }),
}));

vi.mock("@/features/map/components/mini-map", () => ({
  MiniMap: ({ status, height }: { status: string; height: number }) => (
    <div data-testid="mini-map" data-status={status} data-height={height} />
  ),
}));

function entry(overrides: Partial<DirectoryEntry> = {}): DirectoryEntry {
  return {
    id: "e1",
    slug: "igreja-nossa-senhora-do-monte",
    name: "Igreja Nossa Senhora do Monte",
    category: "Heritage",
    imageUrl: "https://cdn.example/igreja.jpg",
    town: "Nossa Senhora do Monte",
    latitude: 14.856,
    longitude: -24.728,
    description: "Historic pilgrimage church established c. 1826.",
    rating: null,
    reviewCount: 0,
    createdAt: "",
    updatedAt: "",
    tags: [],
    details: {
      established: "c. 1826",
      conditionStatus: "under reconstruction since 2023",
      festival: "second weekend of August",
      architect: null,
    },
    heroImage: {
      mediaId: "m1",
      url: "https://cdn.example/igreja.jpg",
      photographerCredit: null,
      archiveSource: null,
    },
    completeness: {
      documented: 6,
      total: 9,
      missingFields: ["photographer", "openingHours", "architect"],
    },
    ...overrides,
  } as DirectoryEntry;
}

function photo(
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
    publicUrl: "https://cdn.example/p1.jpg",
    originalName: "p1.jpg",
    width: 388,
    height: 300,
    ...overrides,
  };
}

function renderRecord(
  overrides: Partial<React.ComponentProps<typeof PlaceRecord>> = {}
) {
  return render(
    <PlaceRecord
      entry={entry()}
      townSlug="nossa-senhora-do-monte"
      photographs={[]}
      siblings={[]}
      {...overrides}
    />
  );
}

/** Spec 034 T-28 / FR-013 — a record and the questions its gaps ask. */
describe("PlaceRecord", () => {
  beforeEach(() => {
    useIdentifyStore.setState({ context: null });
  });

  it("heads the record with its settlement and category", () => {
    renderRecord();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Igreja Nossa Senhora do Monte",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nossa Senhora do Monte · Heritage")
    ).toBeInTheDocument();
  });

  it("credits the hero, or says the credit is missing", () => {
    renderRecord();
    expect(screen.getByText("photographer not recorded")).toBeInTheDocument();
  });

  it("says a record has no photograph rather than heading it with a blank band", () => {
    renderRecord({ entry: entry({ imageUrl: null, heroImage: null }) });

    expect(screen.getByText("no photograph recorded")).toBeInTheDocument();
  });

  it("counts the recorded fields the way the API does", () => {
    renderRecord();
    expect(screen.getByText("six of nine fields recorded")).toBeInTheDocument();
  });

  it("renders the heritage grid with its recorded values", () => {
    renderRecord();

    expect(screen.getByText("Established")).toBeInTheDocument();
    expect(screen.getByText("c. 1826")).toBeInTheDocument();
    expect(screen.getByText("second weekend of August")).toBeInTheDocument();
    // Twice, as in the prototype: once as a field, once under the locator map.
    expect(screen.getAllByText("14.8560, −24.7280")).toHaveLength(2);
  });

  it("asks the prototype's question for each empty row", async () => {
    const user = userEvent.setup();
    renderRecord();

    expect(
      screen.getByRole("button", { name: "When can a visitor go in?" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Who built it?" })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Who took the photograph above?" })
    );

    expect(useIdentifyStore.getState().context).toEqual({
      contentType: "entry",
      contentId: "e1",
      field: "photographer",
      pageTitle: "Igreja Nossa Senhora do Monte",
    });
  });

  it("explains the hero and offers the archive a photograph", async () => {
    const user = userEvent.setup();
    renderRecord();

    expect(
      screen.getByText(
        "None yet. The photograph above came in as the record's hero image, not as an archive record."
      )
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Give a photograph to the archive" })
    );

    expect(useIdentifyStore.getState().context).toMatchObject({
      field: "photograph",
      contentType: "entry",
    });
  });

  it("lists the archive's photographs of the place instead of the empty panel", () => {
    renderRecord({ photographs: [photo(), photo({ id: "p2" })] });

    expect(
      screen.getByText("Two photographs of this place are in the archive.")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Give a photograph to the archive" })
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Untitled/ })[0]
    ).toHaveAttribute("href", "/photographs/p1");
  });

  it("says when a record is the only one in its settlement", () => {
    renderRecord();

    expect(
      screen.getByRole("heading", {
        name: "Also recorded in Nossa Senhora do Monte",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Nothing else. This is the only record in the settlement."
      )
    ).toBeInTheDocument();
  });

  it("links its siblings under the same settlement", () => {
    renderRecord({
      siblings: [
        entry({ id: "e2", slug: "praca", name: "Praça Eugénio Tavares" }),
      ],
    });

    expect(screen.getByRole("link", { name: /Praça/ })).toHaveAttribute(
      "href",
      "/nossa-senhora-do-monte/praca"
    );
  });

  it("closes the record with the prototype's action row", () => {
    renderRecord();

    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy link" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Suggest a correction" })
    ).toBeInTheDocument();
  });

  it("does not print 0,0 under the locator map for an unplaced record", () => {
    renderRecord({ entry: entry({ latitude: 0, longitude: 0 }) });

    expect(screen.queryByText(/0\.0000/)).not.toBeInTheDocument();
  });

  it("calls a Stay record Stay in its field grid, not Hotel", () => {
    renderRecord({
      entry: entry({
        category: "Hotel",
        details: { amenities: [] },
        completeness: undefined,
      }) as DirectoryEntry,
    });

    expect(screen.getAllByText("Stay").length).toBeGreaterThan(0);
    expect(screen.queryByText("Hotel")).not.toBeInTheDocument();
  });

  it("locates the record and explains why it carries no rating", () => {
    renderRecord();

    expect(screen.getByTestId("mini-map")).toHaveAttribute(
      "data-height",
      "220"
    );
    expect(
      screen.getByText(
        "Heritage records carry no rating. Ratings appear only where a visitor can stay."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Rating")).not.toBeInTheDocument();
  });

  it("gives accommodation a rating row and no rating note", () => {
    renderRecord({
      entry: entry({
        category: "Hotel",
        rating: 4.5,
        details: { amenities: [] },
        completeness: undefined,
      }) as DirectoryEntry,
    });

    expect(screen.getByText("Rating")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.queryByText(/carry no rating/)).not.toBeInTheDocument();
  });

  it("draws one bar segment per field", () => {
    const { container } = renderRecord();
    const bar = container.querySelector("[aria-hidden].flex.gap-\\[3px\\]");

    expect(bar?.children).toHaveLength(9);
  });
});
