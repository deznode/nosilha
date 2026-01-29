interface SectionWrapperProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Reusable section container for design system gallery.
 * Provides consistent spacing, typography, and anchor linking.
 */
export function SectionWrapper({
  id,
  title,
  description,
  children,
}: SectionWrapperProps) {
  return (
    <section id={id} className="scroll-mt-24 py-12 first:pt-0">
      <div className="mb-8">
        <h2 className="text-body font-serif text-2xl font-semibold md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="text-muted mt-2 text-base">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
