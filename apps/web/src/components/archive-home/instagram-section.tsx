import { clsx } from "clsx";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RecordText } from "@/components/ui/record-text";
import type { ReactNode } from "react";

import {
  INSTAGRAM_FEED_SIZE,
  INSTAGRAM_PROFILE_URL,
  badgeLabel,
  fittingCaption,
  getInstagramFeed,
  relativeAge,
  tileAccessibleName,
  tileImageUrl,
  type InstagramFeed,
  type InstagramPost,
  type InstagramTranslator,
} from "@/lib/instagram";

import { InstagramTileImage } from "./instagram-tile-image";

/**
 * "From Instagram" on the archive's front door. Design handoff
 * `design_handoff_instagram`, turn 2 (spec 036).
 *
 * A sibling of the Films strip: the account's latest posts, then the line that
 * connects the account to the archive. It never hides — an expired token went
 * unnoticed for months because the old section quietly disappeared. The home passes
 * it through as a slot so it keeps the feed's cache scope, not the page's hour.
 */
export async function InstagramSection() {
  const { feed, fetchedAt } = await getInstagramFeed();
  return <InstagramSectionView feed={feed} now={fetchedAt} />;
}

/** The tile grid, shared with the skeleton so the two cannot drift apart. */
const TILE_GRID =
  "grid grid-cols-2 gap-[12px] min-[700px]:grid-cols-3 min-[700px]:gap-[20px]";

/** The last post fills the mobile 2×2; three columns have no room for it. */
const lastTileOnly = (index: number) =>
  clsx(index === INSTAGRAM_FEED_SIZE - 1 && "min-[700px]:hidden");

export async function InstagramSectionView({
  feed,
  now,
}: {
  feed: InstagramFeed;
  now: number;
}) {
  const [t, locale] = await Promise.all([
    getTranslations("archiveHome.instagram"),
    getLocale(),
  ]);
  const tile = { t, locale, now };
  const posts: InstagramPost[] = feed.status === "ok" ? feed.posts : [];

  // One shell for every state: the section never hides, so the header, the closing
  // ask and the link out are written once and only the middle varies.
  const body =
    posts.length === 0 ? null : posts.length === 1 ? (
      <SinglePost post={posts[0]} {...tile} />
    ) : (
      <div className={TILE_GRID}>
        {posts.slice(0, INSTAGRAM_FEED_SIZE).map((post, index) => (
          <InstagramTile
            key={post.id}
            post={post}
            {...tile}
            className={lastTileOnly(index)}
          />
        ))}
      </div>
    );

  return (
    <SectionFrame compact={posts.length <= 1}>
      <SectionHeader t={t} followLink />
      {posts.length > 1 ? (
        <Standfirst t={t} />
      ) : (
        <SecondLine
          className={
            posts.length === 1 ? "mb-[20px]" : "mb-[16px] max-w-[52ch]"
          }
        >
          {posts.length === 1
            ? t("onePost")
            : feed.status === "unavailable"
              ? t("unavailable")
              : t("empty")}
        </SecondLine>
      )}
      {body}
      <ClosingAsk t={t} rule={body !== null} />
      <FollowLink t={t} className="mt-[14px] inline-block min-[700px]:hidden" />
    </SectionFrame>
  );
}

/**
 * The cold-fetch fallback. Header and standfirst render at once; the tiles pulse.
 */
export async function InstagramSectionLoading() {
  const t = await getTranslations("archiveHome.instagram");
  return (
    <SectionFrame>
      <SectionHeader t={t} />
      <SecondLine className="mb-[16px] min-[700px]:mb-[22px]">
        {t("loadingLine")}
      </SecondLine>
      <div aria-hidden className={TILE_GRID}>
        {Array.from({ length: INSTAGRAM_FEED_SIZE }, (_, index) => (
          <div key={index} className={lastTileOnly(index)}>
            <div
              className="animate-pulse-subtle aspect-[4/5] rounded-[9px] border min-[700px]:rounded-[10px]"
              style={{
                background: "var(--background-secondary)",
                borderColor: "var(--border-subtle)",
              }}
            />
            <SkeletonBar height={11} width="85%" marginTop={13} />
            <SkeletonBar height={9} width="40%" marginTop={7} />
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

function SectionFrame({
  compact = false,
  children,
}: {
  /** The empty, unavailable and single-post states sit in a shorter frame. */
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby="instagram-heading"
      className={clsx(
        "rounded-card border p-[20px]",
        compact
          ? "min-[700px]:px-[30px] min-[700px]:py-[26px]"
          : "min-[700px]:p-[30px]"
      )}
      style={{
        background: "var(--card)",
        borderColor: "var(--border-subtle)",
        marginBottom: "56px",
      }}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  t,
  followLink = false,
}: {
  t: InstagramTranslator;
  followLink?: boolean;
}) {
  return (
    <div className="min-[700px]:mb-[6px] min-[700px]:flex min-[700px]:flex-wrap min-[700px]:items-baseline min-[700px]:gap-[14px]">
      <h2
        id="instagram-heading"
        className="mb-[2px] font-serif text-[24px] min-[700px]:mb-0 min-[700px]:text-[30px]"
        style={{ fontWeight: 400, marginTop: 0, letterSpacing: "-0.015em" }}
      >
        {t("heading")}
      </h2>
      <span
        className="mb-[10px] block text-[12.5px] min-[700px]:mb-0 min-[700px]:inline min-[700px]:text-[13px]"
        style={{ color: "var(--foreground-secondary)" }}
      >
        @nosilha
      </span>
      {/* On mobile the link sits below the closing ask instead. */}
      {followLink && (
        <FollowLink t={t} className="ml-auto hidden min-[700px]:inline" />
      )}
    </div>
  );
}

function FollowLink({
  t,
  className,
}: {
  t: InstagramTranslator;
  className: string;
}) {
  return (
    <a
      href={INSTAGRAM_PROFILE_URL}
      target="_blank"
      rel="noopener"
      className={clsx("text-[13px] hover:underline", className)}
      style={{ color: "var(--brand-ocean-blue)" }}
    >
      {t("follow")}
    </a>
  );
}

function SecondLine({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <p
      className={clsx(
        "text-[13px] leading-[1.5] text-pretty min-[700px]:text-[14px] min-[700px]:leading-[1.55]",
        className
      )}
      style={{ marginTop: 0, color: "var(--foreground-secondary)" }}
    >
      {children}
    </p>
  );
}

/**
 * Load-bearing copy: it is what stops a visitor reading these tiles as archive
 * records. The 390 artboard carries its own, shorter wording.
 */
function Standfirst({ t }: { t: InstagramTranslator }) {
  return (
    <SecondLine className="mb-[16px] max-w-[62ch] min-[700px]:mb-[22px]">
      <span className="min-[700px]:hidden">{t("standfirstShort")}</span>
      <span className="hidden min-[700px]:inline">{t("standfirstLong")}</span>
    </SecondLine>
  );
}

/** Why the section is allowed on the page; it survives an empty feed. */
function ClosingAsk({
  t,
  rule = false,
}: {
  t: InstagramTranslator;
  rule?: boolean;
}) {
  return (
    <p
      className={clsx(
        "text-[13px] leading-[1.5] text-pretty min-[700px]:text-[13.5px] min-[700px]:leading-[1.55]",
        rule &&
          "mt-[18px] border-t pt-[14px] min-[700px]:mt-[24px] min-[700px]:pt-[18px]"
      )}
      style={{
        marginBottom: 0,
        color: "var(--foreground-secondary)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {t.rich("closingAsk", {
        strong: (chunks) => (
          <strong style={{ fontWeight: 500, color: "var(--foreground)" }}>
            {chunks}
          </strong>
        ),
        link: (chunks) => (
          <Link
            href="/contribute/media"
            className="hover:underline"
            style={{ color: "var(--brand-ocean-blue)" }}
          >
            {chunks}
          </Link>
        ),
      })}
    </p>
  );
}

/** What every tile needs to name its post: the words, the locale and "now". */
interface TileCopy {
  t: InstagramTranslator;
  locale: string;
  now: number;
}

/** The badge is described by the anchor, so both derive its id from the post. */
const badgeElementId = (post: InstagramPost) => `instagram-badge-${post.id}`;

/**
 * A post's anchor. It carries the whole accessible name, which would otherwise
 * swallow the badge — hence the `aria-describedby` wiring, written once here.
 */
function PostLink({
  post,
  t,
  locale,
  now,
  className,
  children,
}: TileCopy & {
  post: InstagramPost;
  className: string;
  children: ReactNode;
}) {
  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener"
      aria-label={tileAccessibleName(t, post, now, locale)}
      aria-describedby={badgeLabel(t, post) ? badgeElementId(post) : undefined}
      className={clsx("group focus-ring", className)}
    >
      {children}
    </a>
  );
}

function InstagramTile({
  post,
  className,
  ...copy
}: TileCopy & {
  post: InstagramPost;
  className?: string;
}) {
  const caption = fittingCaption(post);

  return (
    <PostLink
      post={post}
      {...copy}
      className={clsx(
        "block rounded-[9px] min-[700px]:rounded-[10px]",
        className
      )}
    >
      <TileImage
        t={copy.t}
        post={post}
        sizes="(max-width: 699px) 50vw, 380px"
        compact
      />
      {caption && (
        <RecordText
          as="div"
          className="mt-[10px] hidden truncate text-[13px] leading-[1.45] min-[700px]:block"
          style={{ color: "var(--foreground)" }}
        >
          {caption}
        </RecordText>
      )}
      <PostAge
        {...copy}
        post={post}
        className={clsx("mt-[8px]", caption && "min-[700px]:mt-[5px]")}
      />
    </PostLink>
  );
}

/** A lone post: the tile on the left, its whole caption and date beside it. */
function SinglePost({ post, ...copy }: TileCopy & { post: InstagramPost }) {
  return (
    <PostLink
      post={post}
      {...copy}
      className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-[16px] rounded-[10px] min-[700px]:grid-cols-[180px_minmax(0,1fr)] min-[700px]:gap-[20px]"
    >
      <TileImage t={copy.t} post={post} sizes="180px" />
      <div>
        {post.caption && (
          <RecordText
            as="div"
            className="text-[14px] leading-[1.5] break-words whitespace-pre-line"
            style={{ color: "var(--foreground)" }}
          >
            {post.caption}
          </RecordText>
        )}
        <PostAge post={post} {...copy} className="mt-[6px]" />
      </div>
    </PostLink>
  );
}

function PostAge({
  post,
  t,
  locale,
  now,
  className,
}: TileCopy & {
  post: InstagramPost;
  className: string;
}) {
  return (
    <div
      className={clsx("text-[11.5px]", className)}
      style={{ color: "var(--foreground-secondary)" }}
    >
      {relativeAge(t, post.timestamp, now, locale)}
    </div>
  );
}

function TileImage({
  t,
  post,
  sizes,
  compact = false,
}: {
  t: InstagramTranslator;
  post: InstagramPost;
  sizes: string;
  /** A grid tile steps its badge down on mobile; the lone post does not. */
  compact?: boolean;
}) {
  const badge = badgeLabel(t, post);
  // `fetchInstagramPosts` drops the imageless, but the view is also rendered
  // directly in tests: without an image the frame stands in for the tile.
  const src = tileImageUrl(post);

  return (
    <div
      className="relative aspect-[4/5] overflow-hidden rounded-[9px] border min-[700px]:rounded-[10px]"
      style={{
        background: "var(--background-secondary)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {src && <InstagramTileImage src={src} sizes={sizes} />}
      {badge && (
        <span
          id={badgeElementId(post)}
          className={clsx(
            "absolute bg-[rgba(20,17,13,.62)] leading-none dark:bg-[rgba(0,0,0,.55)]",
            compact
              ? "top-[7px] right-[7px] rounded-[5px] px-[6px] py-[4px] text-[10.5px] min-[700px]:top-[9px] min-[700px]:right-[9px] min-[700px]:rounded-[6px] min-[700px]:px-[7px] min-[700px]:py-[5px] min-[700px]:text-[11px] min-[700px]:backdrop-blur-[3px]"
              : "top-[9px] right-[9px] rounded-[6px] px-[7px] py-[5px] text-[11px] backdrop-blur-[3px]"
          )}
          style={{ color: "#F4F0E8" }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function SkeletonBar({
  height,
  width,
  marginTop,
}: {
  height: number;
  width: string;
  marginTop: number;
}) {
  return (
    <div
      className="animate-pulse-subtle rounded-[4px]"
      style={{
        height,
        width,
        marginTop,
        background: "var(--background-secondary)",
      }}
    />
  );
}
