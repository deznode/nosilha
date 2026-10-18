import { PageMessages } from "@/i18n/page-messages";

/** The page is a client component, so the messages it reads are sent from here. */
export default function StorySubmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageMessages namespaces={["auth.inlinePrompt", "common"]}>
      {children}
    </PageMessages>
  );
}
