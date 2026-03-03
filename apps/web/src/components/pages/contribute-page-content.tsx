"use client";

import Link from "next/link";
import { Camera, FileText, Map, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";

export function ContributePageContent() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Contribute to Nos Ilha"
          subtitle="Help us build the most comprehensive guide to Brava Island by sharing your knowledge, photos, and experiences."
        />

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-background-primary mt-16 rounded-lg p-8 shadow-sm"
        >
          <div className="text-center">
            <Heart className="text-ocean-blue mx-auto h-16 w-16" />
            <h2 className="text-text-primary mt-4 font-serif text-2xl font-bold">
              Together, We Build Something Beautiful
            </h2>
            <p className="text-text-secondary mt-4 text-lg">
              Nos Ilha is powered by community contributions. Every photo,
              story, and piece of information helps preserve and share the
              beauty of Brava Island.
            </p>
          </div>
        </motion.section>

        {/* Contribution Types */}
        <section className="mt-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-text-primary mb-8 font-serif text-2xl font-bold"
          >
            Ways to Contribute
          </motion.h3>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {/* Photo Contributions */}
            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Camera className="text-ocean-blue mb-4 h-10 w-10" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Share Your Photos
              </h4>
              <p className="text-text-secondary mb-4">
                Help us showcase the beauty of Brava by contributing your
                photographs of landscapes, businesses, landmarks, and cultural
                events.
              </p>
              <ul className="text-text-secondary mb-4 space-y-1 text-sm">
                <li>• High-resolution images preferred</li>
                <li>• Include location and date information</li>
                <li>• Respect privacy and property rights</li>
              </ul>
              <Link
                href="/contribute/directory"
                className="text-ocean-blue hover:text-ocean-blue/80 group inline-flex items-center"
              >
                Start Contributing{" "}
                <span className="ml-1 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </motion.div>

            {/* Information Updates */}
            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <FileText className="text-valley-green mb-4 h-10 w-10" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Update Information
              </h4>
              <p className="text-text-secondary mb-4">
                Know about a new business, updated hours, or changes to a
                landmark? Help keep our directory accurate and current.
              </p>
              <ul className="text-text-secondary mb-4 space-y-1 text-sm">
                <li>• Business hours and contact info</li>
                <li>• New restaurants or accommodations</li>
                <li>• Seasonal closures or changes</li>
              </ul>
              <Link
                href="mailto:info@nosilha.com"
                className="text-valley-green hover:text-valley-green/80 group inline-flex items-center"
              >
                Send Update{" "}
                <span className="ml-1 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </motion.div>

            {/* Local Stories */}
            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Map className="text-bougainvillea-pink mb-4 h-10 w-10" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Share Local Stories
              </h4>
              <p className="text-text-secondary mb-4">
                Contribute historical information, cultural insights, or
                personal stories that help visitors understand Brava&apos;s rich
                heritage.
              </p>
              <ul className="text-text-secondary mb-4 space-y-1 text-sm">
                <li>• Historical accounts and legends</li>
                <li>• Cultural traditions and customs</li>
                <li>• Personal experiences and tips</li>
              </ul>
              <Link
                href="/history"
                className="text-bougainvillea-pink hover:text-bougainvillea-pink/80 group inline-flex items-center"
              >
                Explore Stories{" "}
                <span className="ml-1 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Guidelines Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-background-primary mt-16 rounded-lg p-8 shadow-sm"
        >
          <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            Contribution Guidelines
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="text-text-primary mb-3 text-lg font-semibold">
                Photo Guidelines
              </h4>
              <ul className="text-text-secondary space-y-2">
                <li>• Submit only your original photographs</li>
                <li>• Ensure images are clear and well-lit</li>
                <li>• Include accurate location information</li>
                <li>• Respect private property and people&apos;s privacy</li>
                <li>• Avoid overly commercial or promotional content</li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary mb-3 text-lg font-semibold">
                Information Standards
              </h4>
              <ul className="text-text-secondary space-y-2">
                <li>• Provide accurate and up-to-date information</li>
                <li>• Include reliable sources when possible</li>
                <li>• Be respectful of local culture and traditions</li>
                <li>• Write in clear, helpful language</li>
                <li>• Avoid biased or promotional language</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
            Have Questions?
          </h3>
          <p className="text-text-secondary mb-6 text-lg">
            We&apos;re here to help you contribute to the Nos Ilha community.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="mailto:info@nosilha.com"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              Contact Us
            </Link>
            <Link
              href="/"
              className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
