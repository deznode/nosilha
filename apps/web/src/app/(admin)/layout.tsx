import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

/**
 * Admin Layout - Admin/Sandbox pages with Header and Footer
 *
 * This layout wraps all routes in the (admin) route group,
 * providing the standard site chrome for admin and sandbox pages.
 */
export default function AdminLayout({
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
