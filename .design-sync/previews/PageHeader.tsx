import { PageHeader } from "frontend";

/**
 * Page-level title. `size="large"` is the 4xl/5xl variant intended for the
 * top of a route.
 */
export function PageTitle() {
  return (
    <PageHeader
      size="large"
      title="Nos Ilha"
      subtitle="A community archive of Brava — its places, its people, and the songs that carried them."
    />
  );
}

/** Section header inside a page that already has an H1. */
export function SectionHeader() {
  return (
    <PageHeader
      as="h2"
      title="Heritage sites"
      subtitle="Churches, sobrados and the houses of Nova Sintra."
    />
  );
}

/** With the bougainvillea accent bar, centred — the landing treatment. */
export function CentredWithAccent() {
  return (
    <PageHeader
      centered
      showAccentBar
      title="Fajã d'Água"
      subtitle="The valley on Brava's western shore."
    />
  );
}

/** Compact, no subtitle — dense listing pages. */
export function CompactTitleOnly() {
  return <PageHeader size="compact" as="h2" title="Recently added" />;
}
