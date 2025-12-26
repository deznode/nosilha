"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Globe, Users, Code, Camera, Map } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";

export function AboutPageContent() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
          title="About Nos Ilha"
          subtitle="A community-driven platform celebrating the cultural heritage and natural beauty of Brava Island, Cape Verde."
        />

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-background-primary border-border-primary mt-16 rounded-lg border p-8 shadow-sm"
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-text-primary mb-4 font-serif text-3xl font-bold">
                Preserving Heritage, Building Community
              </h2>
              <p className="text-text-secondary mb-4 text-lg">
                Nos Ilha is a cultural heritage hub—a digital bridge connecting
                Brava Island with the world. Through technology and community
                collaboration, we&apos;re preserving and celebrating the
                island&apos;s rich cultural memory while connecting the global
                diaspora to their roots and welcoming visitors who seek
                authentic heritage experiences.
              </p>
              <p className="text-text-secondary">
                Our volunteer-driven, open-source approach ensures that the
                platform remains true to its community roots while leveraging
                modern technology to showcase the authentic beauty of Brava
                Island.
              </p>
            </div>
            <div className="relative h-64 overflow-hidden rounded-lg lg:h-80">
              <Image
                src="/images/about/community-collaboration.jpg"
                alt="Community members collaborating on preserving Brava Island's heritage"
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
            className="text-text-primary mb-8 text-center font-serif text-2xl font-bold"
          >
            Our Mission & Values
          </motion.h3>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Heart className="text-ocean-blue mx-auto mb-4 h-12 w-12" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Community First
              </h4>
              <p className="text-text-secondary">
                Every feature we build serves the local community of Brava
                Island, with input from residents, business owners, and cultural
                experts.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Globe className="text-valley-green mx-auto mb-4 h-12 w-12" />
              <h4 className="text-text-primary mb-2 font-semibold">
                Cultural Preservation
              </h4>
              <p className="text-text-secondary">
                We document and preserve Brava&apos;s unique history,
                traditions, and stories for future generations and global
                audiences.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Users className="text-bougainvillea-pink mx-auto mb-4 h-12 w-12" />
              <h4 className="text-text-primary mb-2 font-semibold">
                Open Collaboration
              </h4>
              <p className="text-text-secondary">
                As an open-source project, we welcome contributions from
                developers, content creators, and cultural enthusiasts
                worldwide.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Technical Approach */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-background-primary border-border-primary mt-16 rounded-lg border p-8 shadow-sm"
        >
          <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            Technical Excellence in Service of Culture
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="text-text-primary mb-3 text-lg font-semibold">
                Modern Architecture
              </h4>
              <p className="text-text-secondary mb-4">
                Built with Next.js 16, React 19, and Spring Boot, our platform
                combines cutting-edge web technology with robust backend
                services to deliver a fast, accessible experience for all users.
              </p>
              <ul className="text-text-secondary space-y-1 text-sm">
                <li>• Next.js App Router with Server Components</li>
                <li>• Spring Boot with Kotlin backend</li>
                <li>• PostgreSQL database with Google Cloud integration</li>
                <li>• AI-powered image analysis and metadata</li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary mb-3 text-lg font-semibold">
                Community-Driven Development
              </h4>
              <p className="text-text-secondary mb-4">
                Every technical decision is made with community needs in mind,
                ensuring the platform remains accessible, culturally
                appropriate, and genuinely useful for both locals and visitors.
              </p>
              <ul className="text-text-secondary space-y-1 text-sm">
                <li>• Open-source codebase on GitHub</li>
                <li>• Mobile-first responsive design</li>
                <li>• Multilingual support planning</li>
                <li>• Accessibility compliance (WCAG AA)</li>
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
            className="text-text-primary mb-8 text-center font-serif text-2xl font-bold"
          >
            Platform Features
          </motion.h3>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Map className="text-ocean-blue mb-3 h-8 w-8" />
              <h4 className="text-text-primary mb-2 font-semibold">
                Interactive Map
              </h4>
              <p className="text-text-secondary text-sm">
                Navigate Brava Island with our detailed interactive map
                featuring businesses, landmarks, and cultural sites.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Camera className="text-valley-green mb-3 h-8 w-8" />
              <h4 className="text-text-primary mb-2 font-semibold">
                Photo Galleries
              </h4>
              <p className="text-text-secondary text-sm">
                Community-contributed photo galleries showcase the island&apos;s
                natural beauty and cultural events.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Code className="text-bougainvillea-pink mb-3 h-8 w-8" />
              <h4 className="text-text-primary mb-2 font-semibold">
                Directory System
              </h4>
              <p className="text-text-secondary text-sm">
                Comprehensive directory of restaurants, hotels, landmarks, and
                cultural sites with detailed information.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Community Impact */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="from-ocean-blue/10 to-valley-green/10 mt-16 rounded-lg bg-gradient-to-r p-8"
        >
          <h3 className="text-text-primary mb-6 text-center font-serif text-2xl font-bold">
            Community Impact
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-center">
              <div className="text-ocean-blue mb-2 text-3xl font-bold">
                100%
              </div>
              <div className="text-text-primary mb-1 text-sm font-medium">
                Open Source
              </div>
              <p className="text-text-secondary text-xs">
                All code is publicly available, ensuring transparency and
                community ownership.
              </p>
            </div>

            <div className="text-center">
              <div className="text-valley-green mb-2 text-3xl font-bold">
                <Heart className="mx-auto h-12 w-12" />
              </div>
              <div className="text-text-primary mb-1 text-sm font-medium">
                Volunteer-Powered
              </div>
              <p className="text-text-secondary text-xs">
                Driven by passionate volunteers dedicated to preserving Brava
                Island&apos;s cultural heritage.
              </p>
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
          <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
            Join Our Community
          </h3>
          <p className="text-text-secondary mb-8 text-lg">
            Whether you&apos;re a developer, photographer, writer, or cultural
            enthusiast, there&apos;s a place for you in the Nos Ilha community.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/contribute"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              Contribute Content
            </Link>
            <Link
              href="https://github.com/bravdigital/nosilha"
              className="border-valley-green text-valley-green hover:bg-valley-green rounded-md border-2 px-4 py-3 text-sm font-semibold transition-colors hover:text-white"
            >
              View on GitHub
            </Link>
            <Link
              href="/contact"
              className="border-bougainvillea-pink text-bougainvillea-pink hover:bg-bougainvillea-pink rounded-md border-2 px-4 py-3 text-sm font-semibold transition-colors hover:text-white"
            >
              Get in Touch
            </Link>
            <Link
              href="/history"
              className="border-border-primary text-text-primary hover:bg-text-primary hover:text-background-primary rounded-md border-2 px-4 py-3 text-sm font-semibold transition-colors"
            >
              Learn More
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
