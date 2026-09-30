import Image from "next/image";

import {
  FILM_PLATFORM_LABEL,
  filmThumbnailUrl,
  type ParsedFilmLink,
} from "../lib/parse-video-url";

/**
 * The recognised-link preview under the film URL field (F2/F3).
 *
 * YouTube shows its thumbnail straight from `i.ytimg.com` — no lookup, no
 * app-side fetch. Vimeo doesn't publish a thumbnail endpoint, so it never
 * requests an image at all: the designed ochre dashed frame stands in for
 * it. Spec 039, `.claude-design/design_handoff_contribution_flow`.
 */
export function FilmPreviewCard({ platform, externalId }: ParsedFilmLink) {
  const thumbnail = filmThumbnailUrl({ platform, externalId });

  return (
    <div className="border-hairline bg-card overflow-hidden rounded-[10px] border">
      {thumbnail ? (
        <div className="bg-surface-alt relative aspect-video">
          <Image
            src={thumbnail}
            alt="YouTube thumbnail"
            fill
            sizes="340px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="bg-surface aspect-video p-3.5">
          <div className="border-sobrado-ochre flex h-full flex-col items-center justify-center gap-1 rounded-md border-[1.5px] border-dashed text-center">
            <span className="text-sobrado-ochre font-mono text-[10.5px] font-semibold tracking-[.13em] uppercase">
              Vimeo
            </span>
            <span className="text-muted text-[13px]">
              Vimeo doesn&apos;t share a preview image
            </span>
          </div>
        </div>
      )}
      <div className="text-muted flex items-center justify-between px-3 py-2.5 text-[13px]">
        <span>
          <span className="text-valley-green font-semibold">✓</span>{" "}
          {FILM_PLATFORM_LABEL[platform]} link recognised
        </span>
        <span className="font-mono">{externalId}</span>
      </div>
    </div>
  );
}
