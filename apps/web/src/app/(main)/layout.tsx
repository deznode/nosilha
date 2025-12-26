import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

/**
 * Main Layout - Standard pages with Header and Footer
 *
 * This layout wraps all routes in the (main) route group,
 * providing the standard site chrome (header, footer, navigation).
 *
 * Routes that need full-page takeover (like auth) should use
 * their own route group without this layout.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header className="print:hidden" />
      <main id="main-content" className="animate-fade-in flex-grow pt-16">
        {children}
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
