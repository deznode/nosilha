import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PhotoDetail } from "@/components/photographs/photo-detail/photo-detail";
import { useIdentifyStore } from "@/stores/identifyStore";
import type { PhotoSequence, PublicUserUploadMedia } from "@/types/gallery";
import { mockMatchMedia } from "../../../../setup/match-media-mock";

const NARROW = "(max-width: 860px)";

const toastShow = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    success: () => ({ show: toastShow }),
    error: () => ({ show: toastShow }),
  }),
}));

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function upload(
  overrides: Partial<PublicUserUploadMedia> = {}
): PublicUserUploadMedia {
  return {
    id: "p1",
    title: null,
    description: null,
    category: "Landscape",
    displayOrder: 0,
    mediaSource: "USER_UPLOAD",
    altText: null,
    createdAt: "2024-01-01T00:00:00Z",
    publicUrl: "https://cdn.example/DJI_0177.JPG",
    originalName: "DJI_0177.JPG",
    width: 388,
    height: 287,
    latitude: 14.8632,
    longitude: -24.7183,
    dateTaken: "2024-07-12T10:00:00Z",
    cameraMake: "DJI",
    cameraModel: "FC3582",
    ...overrides,
  };
}

const SEQUENCE: PhotoSequence = {
  id: "p1",
  position: 3,
  total: 11,
  previousId: "p0",
  nextId: "p2",
};

/** Spec 034 T-31 / FR-010, FR-012 — one photograph, its facts and its questions. */
describe("PhotoDetail", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia({ [NARROW]: false });
    useIdentifyStore.setState({ context: null });
  });

  afterEach(() => {
    media.restore();
    vi.clearAllMocks();
  });

  it("heads the record with its category, title and filename", () => {
    render(<PhotoDetail media={upload()} sequence={SEQUENCE} />);

    // Twice, as in the prototype: the eyebrow and the Category row.
    expect(screen.getAllByText("Landscape")).toHaveLength(2);
    expect(
      screen.getByRole("heading", { level: 1, name: "Untitled" })
    ).toBeInTheDocument();
    expect(screen.getByText("DJI_0177.JPG")).toBeInTheDocument();
  });

  it("lists what the file recorded and where it came from", () => {
    render(<PhotoDetail media={upload()} sequence={SEQUENCE} />);

    expect(screen.getByText("July 12, 2024")).toBeInTheDocument();
    expect(screen.getAllByText("· read from the file")[0]).toBeInTheDocument();
    expect(screen.getByText("DJI FC3582")).toBeInTheDocument();
    expect(screen.getByText("14.8632, −24.7183")).toBeInTheDocument();
  });

  it("says so when the file is all there is", () => {
    render(
      <PhotoDetail
        media={upload({
          dateTaken: undefined,
          cameraMake: undefined,
          cameraModel: undefined,
          latitude: undefined,
          longitude: undefined,
          category: null,
        })}
        sequence={null}
      />
    );

    expect(
      screen.getByText("nothing recorded but the file itself")
    ).toBeInTheDocument();
  });

  it("asks for each missing field, carrying the media id", async () => {
    const user = userEvent.setup();
    render(<PhotoDetail media={upload()} sequence={SEQUENCE} />);

    await user.click(
      screen.getByRole("button", { name: "Do you know who took this?" })
    );

    expect(useIdentifyStore.getState().context).toEqual({
      contentType: "media",
      contentId: "p1",
      mediaId: "p1",
      field: "photographerCredit",
      pageTitle: "Untitled",
    });
  });

  it("drops the missing block when nothing is missing", () => {
    render(
      <PhotoDetail
        media={upload({
          title: "Lomba Tantun",
          photographerCredit: "Ana Lopes",
          locationName: "Lomba Tantun",
        })}
        sequence={SEQUENCE}
      />
    );

    expect(screen.queryByText("What is missing")).not.toBeInTheDocument();
  });

  it("places the record in the sequence and offers both steps", () => {
    render(<PhotoDetail media={upload()} sequence={SEQUENCE} />);

    expect(
      screen.getByText(
        "Photograph 3 of 11 with coordinates · use the arrow keys"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Previous photograph" })
    ).toHaveAttribute("href", "/photographs/p0");
    expect(
      screen.getByRole("link", { name: "Next photograph" })
    ).toHaveAttribute("href", "/photographs/p2");
  });

  it("says an unlocated record has no place and offers no map", () => {
    render(
      <PhotoDetail
        media={upload({ latitude: undefined, longitude: undefined })}
        sequence={{
          id: "p1",
          position: null,
          total: 11,
          previousId: null,
          nextId: null,
        }}
      />
    );

    expect(
      screen.getByText("This one has no place recorded")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Show on map" })
    ).not.toBeInTheDocument();
  });

  it("selects the pin on the map for a located record", () => {
    render(<PhotoDetail media={upload()} sequence={SEQUENCE} />);

    expect(screen.getByRole("link", { name: "Show on map" })).toHaveAttribute(
      "href",
      "/map?mode=photographs&sel=p%3Ap1"
    );
  });

  it("offers Share alongside the other actions", () => {
    render(<PhotoDetail media={upload()} sequence={SEQUENCE} />);

    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View full size" })
    ).toBeInTheDocument();
  });

  it("steps with the arrow keys and leaves on Escape", async () => {
    const user = userEvent.setup();
    render(<PhotoDetail media={upload()} sequence={SEQUENCE} />);

    await user.keyboard("{ArrowLeft}");
    expect(push).toHaveBeenLastCalledWith("/photographs/p0");

    await user.keyboard("{ArrowRight}");
    expect(push).toHaveBeenLastCalledWith("/photographs/p2");

    await user.keyboard("{Escape}");
    expect(push).toHaveBeenLastCalledWith("/photographs");
  });

  it("does not steal the arrow keys from a field the reader is typing in", async () => {
    const user = userEvent.setup();
    render(
      <>
        <PhotoDetail media={upload()} sequence={SEQUENCE} />
        <input aria-label="Where was this taken?" />
      </>
    );

    await user.click(screen.getByLabelText("Where was this taken?"));
    await user.keyboard("{ArrowLeft}{ArrowRight}{Escape}");

    // Arrow keys move the caret inside an answer; navigating would discard it.
    expect(push).not.toHaveBeenCalled();
  });

  it("stands down entirely while the identify sheet is open", async () => {
    const user = userEvent.setup();
    render(<PhotoDetail media={upload()} sequence={SEQUENCE} />);

    useIdentifyStore.setState({
      context: {
        contentType: "media",
        contentId: "p1",
        field: "photographerCredit",
        pageTitle: "Untitled",
      },
    });

    await user.keyboard("{ArrowRight}{Escape}");

    // Escape belongs to the sheet; stepping away would close it and leave the record.
    expect(push).not.toHaveBeenCalled();
  });

  it("ignores an arrow key with a modifier, which is a browser shortcut", async () => {
    const user = userEvent.setup();
    render(<PhotoDetail media={upload()} sequence={SEQUENCE} />);

    await user.keyboard("{Meta>}{ArrowLeft}{/Meta}");
    expect(push).not.toHaveBeenCalled();
  });

  it("steps nowhere when the sequence has no neighbours", async () => {
    const user = userEvent.setup();
    render(
      <PhotoDetail
        media={upload()}
        sequence={{
          id: "p1",
          position: 1,
          total: 1,
          previousId: null,
          nextId: null,
        }}
      />
    );

    await user.keyboard("{ArrowRight}");
    expect(push).not.toHaveBeenCalled();
  });

  it("removes the listener when the route is hidden or unmounted", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <PhotoDetail media={upload()} sequence={SEQUENCE} />
    );

    unmount();
    await user.keyboard("{Escape}");

    expect(push).not.toHaveBeenCalled();
  });

  it("stacks and shortens the image when narrow", () => {
    media.restore();
    media = mockMatchMedia({ [NARROW]: true });

    const { container } = render(
      <PhotoDetail media={upload()} sequence={SEQUENCE} />
    );
    const stage = container.querySelector('[style*="1 1 100%"]') as HTMLElement;
    const frame = container.querySelector('[style*="44vh"]') as HTMLElement;

    expect(stage).toBeTruthy();
    expect(frame).toBeTruthy();
    expect(container.querySelector('[style*="sticky"]')).toBeNull();
  });

  it("sticks the stage under the archive bar on a desktop", () => {
    const { container } = render(
      <PhotoDetail media={upload()} sequence={SEQUENCE} />
    );
    const stage = container.querySelector('[style*="sticky"]') as HTMLElement;

    expect(stage.style.top).toBe("65px");
    expect(container.querySelector('[style*="74vh"]')).toBeTruthy();
  });
});
