"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Instagram, Play, Layers2 } from "lucide-react";
import clsx from "clsx";

import type { InstagramPost } from "@/lib/instagram";

const headerVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const featuredVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay: 0.1 },
  },
};

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const gridItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

interface InstagramFeedSectionProps {
  posts: InstagramPost[];
}

function getImageUrl(post: InstagramPost): string {
  return post.media_type === "VIDEO" && post.thumbnail_url
    ? post.thumbnail_url
    : post.media_url;
}

function MediaTypeIcon({ type }: { type: InstagramPost["media_type"] }) {
  if (type === "VIDEO") {
    return (
      <div className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5">
        <Play className="h-4 w-4 fill-white text-white" />
      </div>
    );
  }
  if (type === "CAROUSEL_ALBUM") {
    return (
      <div className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5">
        <Layers2 className="h-4 w-4 text-white" />
      </div>
    );
  }
  return null;
}

export function InstagramFeedSection({ posts }: InstagramFeedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (posts.length === 0) return null;

  const pick = (normal: Variants) =>
    shouldReduceMotion ? reducedMotionVariants : normal;

  // First post is featured; next 6 fill the grid (2x3 desktop, 2x2 mobile)
  const [featured, ...gridPosts] = posts;
  const desktopGrid = gridPosts.slice(0, 6);

  return (
    <section className="bg-surface-alt overflow-hidden py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={pick(headerVariants)}
          className="mb-10"
        >
          <h2 className="font-heading text-heading text-3xl font-bold sm:text-4xl">
            Our Island, Our Story
          </h2>
          <p className="text-muted mt-2 text-base">Snapshots from home</p>
          <div className="mt-3 flex items-center gap-2">
            <Instagram className="text-brand h-5 w-5" />
            <span className="text-muted text-sm font-semibold tracking-widest uppercase">
              @nosilha
            </span>
          </div>
        </motion.div>

        {/* Bento grid: featured spans left 2 cols × 3 rows, thumbnails fill right */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={pick(gridContainerVariants)}
          className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:grid-rows-3"
        >
          {/* Featured post */}
          <motion.a
            href={featured.permalink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              featured.caption ? undefined : "Featured Instagram post"
            }
            variants={pick(featuredVariants)}
            className="focus-ring group rounded-container col-span-2 overflow-hidden lg:row-span-3"
          >
            <div className="rounded-container shadow-floating relative aspect-[4/3] h-full overflow-hidden md:aspect-[16/9] lg:aspect-auto">
              <Image
                src={getImageUrl(featured)}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <MediaTypeIcon type={featured.media_type} />

              {/* Always-visible caption overlay on featured post */}
              {featured.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-5 pt-12 pb-5">
                  <p className="line-clamp-3 text-sm leading-relaxed text-white/90">
                    {featured.caption}
                  </p>
                </div>
              )}
            </div>
          </motion.a>

          {/* Thumbnail grid items */}
          {desktopGrid.map((post, index) => (
            <motion.a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.caption ? undefined : "Instagram post"}
              variants={pick(gridItemVariants)}
              className={clsx(
                "focus-ring border-hairline rounded-card shadow-medium group relative aspect-square overflow-hidden border",
                index >= 4 && "hidden sm:block"
              )}
            >
              <Image
                src={getImageUrl(post)}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <MediaTypeIcon type={post.media_type} />

              {/* Hover caption overlay */}
              {post.caption && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="line-clamp-3 p-3 text-xs leading-relaxed text-white/90 sm:text-sm">
                    {post.caption}
                  </p>
                </div>
              )}
            </motion.a>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={pick(headerVariants)}
          className="mt-10 text-center"
        >
          <a
            href="https://instagram.com/nosilha"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand hover:bg-brand/90 focus-ring rounded-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            <Instagram className="h-4 w-4" />
            Follow @nosilha on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
