"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Heart, Globe, Users, Code, Camera, Map } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { FeatureCard } from "@/components/ui/feature-card";
import { pageStagger, pageItem } from "@/lib/animation";

export function AboutPageContent() {
  const t = useTranslations("about");

  return (
    <div className="bg-surface font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          size="compact"
        />

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-canvas border-hairline rounded-card shadow-subtle mt-8 border p-8 sm:mt-16"
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-body mb-4 font-serif text-3xl font-bold">
                {t("hero.heading")}
              </h2>
              <p className="text-muted mb-4 text-lg">{t("hero.intro")}</p>
              <p className="text-muted">{t("hero.approach")}</p>
            </div>
            <div className="rounded-card relative h-64 overflow-hidden lg:h-80">
              <Image
                src="/images/about/community-collaboration.jpg"
                alt={t("hero.imageAlt")}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </motion.section>

        {/* Mission & Values */}
        <section className="mt-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-body mb-8 text-center font-serif text-2xl font-bold"
          >
            {t("mission.heading")}
          </motion.h3>

          <motion.div
            variants={pageStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            <motion.div variants={pageItem}>
              <FeatureCard
                icon={Heart}
                iconColor="text-ocean-blue"
                title={t("mission.communityFirst.title")}
                description={t("mission.communityFirst.description")}
                centered
                className="h-full"
              />
            </motion.div>

            <motion.div variants={pageItem}>
              <FeatureCard
                icon={Globe}
                iconColor="text-valley-green"
                title={t("mission.culturalPreservation.title")}
                description={t("mission.culturalPreservation.description")}
                centered
                className="h-full"
              />
            </motion.div>

            <motion.div variants={pageItem}>
              <FeatureCard
                icon={Users}
                iconColor="text-bougainvillea-pink"
                title={t("mission.openCollaboration.title")}
                description={t("mission.openCollaboration.description")}
                centered
                className="h-full"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Technical Approach */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-canvas border-hairline rounded-card shadow-subtle mt-16 border p-8"
        >
          <h3 className="text-body mb-6 font-serif text-2xl font-bold">
            {t("technical.heading")}
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="text-body mb-3 text-lg font-semibold">
                {t("technical.architecture.heading")}
              </h4>
              <p className="text-muted mb-4">
                {t("technical.architecture.body")}
              </p>
              <ul className="text-muted space-y-1 text-sm">
                <li>{t("technical.architecture.appRouter")}</li>
                <li>{t("technical.architecture.kotlin")}</li>
                <li>{t("technical.architecture.database")}</li>
                <li>{t("technical.architecture.ai")}</li>
              </ul>
            </div>

            <div>
              <h4 className="text-body mb-3 text-lg font-semibold">
                {t("technical.community.heading")}
              </h4>
              <p className="text-muted mb-4">{t("technical.community.body")}</p>
              <ul className="text-muted space-y-1 text-sm">
                <li>{t("technical.community.openSource")}</li>
                <li>{t("technical.community.mobileFirst")}</li>
                <li>{t("technical.community.multilingual")}</li>
                <li>{t("technical.community.accessibility")}</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Platform Features */}
        <section className="mt-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-body mb-8 text-center font-serif text-2xl font-bold"
          >
            {t("features.heading")}
          </motion.h3>

          <motion.div
            variants={pageStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <motion.div variants={pageItem}>
              <FeatureCard
                icon={Map}
                iconColor="text-ocean-blue"
                title={t("features.map.title")}
                description={t("features.map.description")}
                className="h-full"
              />
            </motion.div>

            <motion.div variants={pageItem}>
              <FeatureCard
                icon={Camera}
                iconColor="text-valley-green"
                title={t("features.galleries.title")}
                description={t("features.galleries.description")}
                className="h-full"
              />
            </motion.div>

            <motion.div variants={pageItem}>
              <FeatureCard
                icon={Code}
                iconColor="text-bougainvillea-pink"
                title={t("features.directory.title")}
                description={t("features.directory.description")}
                className="h-full"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Community Impact */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="from-ocean-blue/10 to-valley-green/10 rounded-card mt-16 bg-gradient-to-r p-8"
        >
          <h3 className="text-body mb-6 text-center font-serif text-2xl font-bold">
            {t("impact.heading")}
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-center">
              <div className="text-ocean-blue mb-2 text-3xl font-bold">
                {t("impact.openSourceValue")}
              </div>
              <div className="text-body mb-1 text-sm font-medium">
                {t("impact.openSourceLabel")}
              </div>
              <p className="text-muted text-xs">{t("impact.openSourceBody")}</p>
            </div>

            <div className="text-center">
              <div className="text-valley-green mb-2 text-3xl font-bold">
                <Heart className="mx-auto h-12 w-12" />
              </div>
              <div className="text-body mb-1 text-sm font-medium">
                {t("impact.volunteerLabel")}
              </div>
              <p className="text-muted text-xs">{t("impact.volunteerBody")}</p>
            </div>
          </div>
        </motion.section>

        {/* Get Involved */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-16 text-center"
        >
          <h3 className="text-body mb-4 font-serif text-2xl font-bold">
            {t("join.heading")}
          </h3>
          <p className="text-muted mb-8 text-lg">{t("join.body")}</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/contribute"
              className="bg-ocean-blue hover:bg-ocean-blue/90 shadow-subtle rounded-button px-4 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:scale-105"
            >
              {t("join.contribute")}
            </Link>
            <Link
              href="https://github.com/deznode/nosilha"
              className="border-valley-green text-valley-green hover:bg-valley-green rounded-button border-2 px-4 py-3 text-sm font-semibold transition-colors hover:text-white"
            >
              {t("join.github")}
            </Link>
            <Link
              href="/contact"
              className="border-bougainvillea-pink text-bougainvillea-pink hover:bg-bougainvillea-pink rounded-button border-2 px-4 py-3 text-sm font-semibold transition-colors hover:text-white"
            >
              {t("join.contact")}
            </Link>
            <Link
              href="/history"
              className="border-hairline text-body hover:bg-basalt-900 dark:hover:text-basalt-900 rounded-button border-2 px-4 py-3 text-sm font-semibold transition-colors hover:text-white dark:hover:bg-mist-100"
            >
              {t("join.learnMore")}
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
