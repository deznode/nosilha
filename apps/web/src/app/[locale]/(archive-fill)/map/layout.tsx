import { PageMessages } from "@/i18n/page-messages";

/** The page is a client component, so the messages it reads are sent from here. */
export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageMessages
      namespaces={[
        "categories",
        "common.filters",
        "errors",
        "map",
        "photographs",
        "status",
      ]}
    >
      {children}
    </PageMessages>
  );
}
