import type { Metadata } from "next";
// We are replacing Geist with Lato from Google Fonts
import { Lato } from "next/font/google";
import "./globals.css";

// Configure the Lato font
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"], // Regular and Bold weights
  variable: "--font-lato", // CSS variable for easy use
});

// Update the site metadata for SEO and branding
export const metadata: Metadata = {
  title: {
    template: "%s | Nosilha.com", // Allows pages to set their own title, e.g., "History | Nosilha.com"
    default: "Nosilha.com - Your Digital Guide to Brava Island", // Default title for the homepage
  },
  description:
    "The definitive online tourism and cultural heritage hub for Brava Island, Cape Verde. Explore landmarks, businesses, history, and more.",
  // You can add more metadata here later, like openGraph images
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* We apply the font class to the body */}
      <body className={`${lato.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
