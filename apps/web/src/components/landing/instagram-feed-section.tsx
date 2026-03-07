"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Instagram, Play, Layers2 } from "lucide-react";

import type { InstagramPost } from "@/lib/instagram";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
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

export function InstagramFeedSection({ posts }: InstagramFeedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (posts.length === 0) return null;

  const activeContainerVariants = shouldReduceMotion
    ? reducedMotionVariants
    : containerVariants;
  const activeItemVariants = shouldReduceMotion
    ? reducedMotionVariants
    : itemVariants;

  return (
    <section className="overflow-hidden py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={activeContainerVariants}
          className="mb-10 text-center"
        >
          <motion.div
            variants={activeItemVariants}
            className="mb-4 flex items-center justify-center gap-3"
          >
            <Instagram className="text-brand h-6 w-6" />
            <span className="text-muted text-sm font-semibold tracking-widest uppercase">
              @nosilha
            </span>
          </motion.div>
          <motion.h2
            variants={activeItemVariants}
            className="font-heading text-heading text-3xl font-bold sm:text-4xl"
          >
            Follow Our Journey
          </motion.h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={activeContainerVariants}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3"
        >
          {posts.map((post) => (
            <motion.a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              variants={activeItemVariants}
              className="bg-surface-alt group rounded-badge relative aspect-square overflow-hidden"
            >
              <Image
                src={
                  post.media_type === "VIDEO" && post.thumbnail_url
                    ? post.thumbnail_url
                    : post.media_url
                }
                alt={post.caption?.slice(0, 120) || "Instagram post"}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Media type icon overlay */}
              {post.media_type === "VIDEO" && (
                <div className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5">
                  <Play className="h-4 w-4 fill-white text-white" />
                </div>
              )}
              {post.media_type === "CAROUSEL_ALBUM" && (
                <div className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5">
                  <Layers2 className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Hover overlay with caption */}
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
          variants={activeContainerVariants}
          className="mt-10 text-center"
        >
          <motion.a
            variants={activeItemVariants}
            href="https://instagram.com/nosilha"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand hover:bg-brand/90 focus-ring rounded-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            <Instagram className="h-4 w-4" />
            Follow us on Instagram
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
