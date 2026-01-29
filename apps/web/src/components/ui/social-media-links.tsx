import React from "react";

interface SocialMediaItem {
  name: string;
  href: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  ariaLabel: string;
}

const socialMediaData: SocialMediaItem[] = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/nosilha.cv",
    description:
      "Follow Nos Ilha on Facebook for community updates and cultural heritage stories",
    ariaLabel: "Visit Nos Ilha Facebook page",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com/nosilha",
    description:
      "Discover beautiful photos and moments from Brava Island on Instagram",
    ariaLabel: "Visit Nos Ilha Instagram profile",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@nosilha",
    description:
      "Watch videos about Brava Island's culture, history, and traditions on YouTube",
    ariaLabel: "Visit Nos Ilha YouTube channel",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M23.498 6.186a2.997 2.997 0 00-2.111-2.111C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.387.529A2.997 2.997 0 00.502 6.186C0 8.068 0 12 0 12s0 3.932.502 5.814a2.997 2.997 0 002.111 2.111c1.882.529 9.387.529 9.387.529s7.505 0 9.387-.529a2.997 2.997 0 002.111-2.111C24 15.932 24 12 24 12s0-3.932-.502-5.814zM9.6 15.6V8.4l6.264 3.6L9.6 15.6z" />
      </svg>
    ),
  },
];

interface SocialMediaLinksProps {
  className?: string;
  variant?: "default" | "compact";
}

export function SocialMediaLinks({
  className = "",
  variant = "default",
}: SocialMediaLinksProps) {
  if (variant === "compact") {
    // Compact version - similar to existing footer
    return (
      <div className={`flex space-x-6 ${className}`}>
        {socialMediaData.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-muted hover:text-ocean-blue transition-colors duration-200"
            aria-label={item.ariaLabel}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">{item.name}</span>
            <item.icon className="h-6 w-6" aria-hidden="true" />
          </a>
        ))}
      </div>
    );
  }

  // Default version - with harbor effect similar to popular pages
  return (
    <nav
      aria-label="Social media links"
      className={`bg-canvas py-12 sm:py-16 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {socialMediaData.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="group hover:bg-surface border-hairline hover:border-ocean-blue/30 hover:ring-ocean-blue/20 rounded-button hover:shadow-elevated flex flex-col items-center border p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:ring-2"
                aria-label={item.ariaLabel}
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Icon with background circle */}
                <div className="bg-ocean-blue group-hover:bg-ocean-blue/90 flex h-20 w-20 items-center justify-center rounded-lg transition-colors duration-300 sm:h-24 sm:w-24">
                  <item.icon
                    className="h-12 w-12 text-white transition-colors duration-300 sm:h-14 sm:w-14"
                    aria-hidden="true"
                  />
                </div>

                {/* Platform Name */}
                <h3 className="text-body group-hover:text-ocean-blue mt-4 text-lg font-semibold transition-colors duration-300">
                  {item.name}
                </h3>

                {/* Description */}
                <p className="text-muted group-hover:text-body mt-2 max-w-sm text-sm leading-6 transition-colors duration-300">
                  {item.description}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
