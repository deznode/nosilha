import { PageMessages } from "@/i18n/page-messages";

/** The page is a client component, so the messages it reads are sent from here. */
export default function MediaContributionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageMessages
      namespaces={[
        "common",
        "contribute.confirmation",
        "contribute.duplicate",
        "contribute.film",
        "contribute.form",
        "contribute.media",
        "contribute.photo",
        "contribute.restored",
        "contribute.signIn",
        "contribute.town",
        "films",
        "map.engine",
        "photographs.metadataBadges",
        "photographs.photoType",
      ]}
    >
      {children}
    </PageMessages>
  );
}
