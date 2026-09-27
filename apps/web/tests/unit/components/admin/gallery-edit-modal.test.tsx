import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  ExternalMedia,
  UpdateGalleryMediaRequest,
  UserUploadMedia,
} from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

const mutate = vi.fn();
vi.mock("@/hooks/queries/admin", () => ({
  useUpdateGalleryMedia: () => ({ mutate, isPending: false }),
}));

const towns: Partial<TownStatusSummary>[] = [
  { id: "town-nova-sintra", slug: "nova-sintra", name: "Nova Sintra" },
  { id: "town-furna", slug: "furna", name: "Furna" },
  // A settlement with no stored row cannot be linked, so it is not offered.
  { id: null, slug: "cachaço", name: "Cachaço" },
];
const useTownSummaries = vi.fn((_opts?: { enabled?: boolean }) => ({
  data: towns,
  isLoading: false,
}));
vi.mock("@/hooks/queries/useTownSummaries", () => ({
  useTownSummaries: (opts?: { enabled?: boolean }) => useTownSummaries(opts),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    success: () => ({ show: vi.fn() }),
    error: () => ({ show: vi.fn() }),
  }),
}));

import { GalleryEditModal } from "@/components/admin/queues/gallery-edit-modal";

function film(overrides: Partial<ExternalMedia> = {}): ExternalMedia {
  return {
    id: "film-1",
    title: "Brava 1972 (YouTube title)",
    description: "Home movie",
    category: "Film",
    displayOrder: 0,
    status: "ACTIVE",
    mediaSource: "EXTERNAL",
    showInGallery: true,
    altText: null,
    createdAt: "2026-01-01T00:00:00Z",
    mediaType: "VIDEO",
    platform: "YOUTUBE",
    externalId: "abc123",
    url: null,
    thumbnailUrl: null,
    embedUrl: null,
    author: "Channel",
    featured: false,
    displayTitle: null,
    placeId: null,
    ...overrides,
  } as ExternalMedia;
}

function upload(): UserUploadMedia {
  return {
    id: "photo-1",
    title: "Harbour",
    description: null,
    category: null,
    displayOrder: 0,
    status: "ACTIVE",
    mediaSource: "USER_UPLOAD",
    showInGallery: true,
    altText: null,
    createdAt: "2026-01-01T00:00:00Z",
    fileName: "a.jpg",
    originalName: "a.jpg",
    storageKey: "k",
    publicUrl: null,
    contentType: "image/jpeg",
    fileSize: 1,
  } as UserUploadMedia;
}

async function save(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Save Changes" }));
  await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
  return mutate.mock.calls[0][0] as {
    id: string;
    data: UpdateGalleryMediaRequest;
  };
}

describe("GalleryEditModal film curation fields", () => {
  beforeEach(() => {
    mutate.mockReset();
    useTownSummaries.mockClear();
  });

  it("does not show the film fields for a user upload", () => {
    render(<GalleryEditModal isOpen item={upload()} onClose={() => {}} />);

    expect(screen.queryByLabelText("Display title")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Filmed near")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(useTownSummaries).toHaveBeenLastCalledWith({ enabled: false });
  });

  it("shows display title, description and settlement for a film", () => {
    render(
      <GalleryEditModal
        isOpen
        item={film({
          displayTitle: "Nova Sintra, 1972",
          placeId: "town-furna",
        })}
        onClose={() => {}}
      />
    );

    expect(screen.getByLabelText("Display title")).toHaveValue(
      "Nova Sintra, 1972"
    );
    expect(
      screen.getByText(
        "Shown in the archive. Leave blank to use the source title."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toHaveValue("Home movie");

    const select = screen.getByLabelText("Filmed near");
    expect(select).toHaveValue("town-furna");
    const options = Array.from(select.querySelectorAll("option")).map(
      (o) => o.textContent
    );
    expect(options).toEqual(["Not recorded", "Furna", "Nova Sintra"]);
    expect(useTownSummaries).toHaveBeenLastCalledWith({ enabled: true });
  });

  it("omits the film fields when they did not change", async () => {
    const user = userEvent.setup();
    render(
      <GalleryEditModal
        isOpen
        item={film({
          displayTitle: "Nova Sintra, 1972",
          placeId: "town-furna",
        })}
        onClose={() => {}}
      />
    );

    const { data } = await save(user);
    expect(data).not.toHaveProperty("displayTitle");
    expect(data).not.toHaveProperty("placeId");
    expect(data).not.toHaveProperty("clearPlace");
  });

  it("sends a new display title", async () => {
    const user = userEvent.setup();
    render(<GalleryEditModal isOpen item={film()} onClose={() => {}} />);

    await user.type(screen.getByLabelText("Display title"), "Furna harbour");
    const { id, data } = await save(user);

    expect(id).toBe("film-1");
    expect(data.displayTitle).toBe("Furna harbour");
  });

  it('sends "" to clear a display title the admin emptied', async () => {
    const user = userEvent.setup();
    render(
      <GalleryEditModal
        isOpen
        item={film({ displayTitle: "Nova Sintra, 1972" })}
        onClose={() => {}}
      />
    );

    await user.clear(screen.getByLabelText("Display title"));
    const { data } = await save(user);

    expect(data.displayTitle).toBe("");
  });

  it("sends placeId when a settlement is chosen", async () => {
    const user = userEvent.setup();
    render(<GalleryEditModal isOpen item={film()} onClose={() => {}} />);

    await user.selectOptions(
      screen.getByLabelText("Filmed near"),
      "Nova Sintra"
    );
    const { data } = await save(user);

    expect(data.placeId).toBe("town-nova-sintra");
    expect(data).not.toHaveProperty("clearPlace");
  });

  it("sends clearPlace when the settlement is set back to Not recorded", async () => {
    const user = userEvent.setup();
    render(
      <GalleryEditModal
        isOpen
        item={film({ placeId: "town-furna" })}
        onClose={() => {}}
      />
    );

    await user.selectOptions(
      screen.getByLabelText("Filmed near"),
      "Not recorded"
    );
    const { data } = await save(user);

    expect(data.clearPlace).toBe(true);
    expect(data).not.toHaveProperty("placeId");
  });

  it("locks a published film's source title", () => {
    render(<GalleryEditModal isOpen item={film()} onClose={() => {}} />);
    expect(
      screen.getByLabelText("Source title (as listed by the host)")
    ).toHaveAttribute("readonly");
  });

  it("keeps a pending submission's title editable", () => {
    // A contributor typed it; it is not the host's listing until a curator says so.
    render(
      <GalleryEditModal
        isOpen
        item={film({ status: "PENDING_REVIEW" })}
        onClose={() => {}}
      />
    );
    expect(
      screen.getByLabelText("Source title (as listed by the host)")
    ).not.toHaveAttribute("readonly");
  });

  it("treats an external still as a plain record", () => {
    render(
      <GalleryEditModal
        isOpen
        item={film({ mediaType: "IMAGE" })}
        onClose={() => {}}
      />
    );
    expect(screen.queryByLabelText("Display title")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Filmed near")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Title/)).not.toHaveAttribute("readonly");
    expect(useTownSummaries).toHaveBeenLastCalledWith({ enabled: false });
  });
});

describe("GalleryEditModal text fields", () => {
  beforeEach(() => {
    mutate.mockReset();
  });

  it('sends "" to clear a description the admin emptied', async () => {
    const user = userEvent.setup();
    render(<GalleryEditModal isOpen item={film()} onClose={() => {}} />);

    await user.clear(screen.getByLabelText("Description"));
    const { data } = await save(user);

    expect(data.description).toBe("");
  });

  it("leaves an unchanged description and category out of the PATCH", async () => {
    const user = userEvent.setup();
    render(<GalleryEditModal isOpen item={film()} onClose={() => {}} />);

    const { data } = await save(user);

    expect(data.description).toBeUndefined();
    expect(data.category).toBeUndefined();
  });
});
