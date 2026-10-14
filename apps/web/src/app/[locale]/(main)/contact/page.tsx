import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { withLocaleMetadata } from "@/lib/metadata";
import { cacheLife } from "next/cache";
import { ContactPageContent } from "@/components/pages/contact-page-content";

export default async function ContactPage() {
  "use cache";
  cacheLife("max");
  return <ContactPageContent />;
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return withLocaleMetadata(
    {
      title: "Contact Us | Nos Ilha - Get in Touch",
      description:
        "Contact the Nos Ilha team for inquiries, contributions, technical support, or to learn more about our community-driven platform for Brava Island.",
      openGraph: {
        title: "Contact Nos Ilha",
        description:
          "Get in touch with the Nos Ilha community for support, contributions, or general inquiries about Brava Island.",
        images: ["/images/contact/contact-hero.jpg"],
      },
    },
    {
      path: "/contact",
      locale: await getLocale(),
    }
  );
}
