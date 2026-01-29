"use client";

import { PageHeader } from "@/components/ui/page-header";

/**
 * PageHeader specimen for the design system gallery.
 * Showcases the animated page header component with various configurations.
 */
export function PageHeaderSpecimen() {
  return (
    <div className="space-y-10">
      {/* Default (Large, Centered) */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Default (Large, Centered)
        </h3>
        <p className="text-muted mb-6 text-sm">
          Default configuration with h1 heading, large size, centered text, and
          bougainvillea-pink accent bar.
        </p>
        <div className="bg-surface-alt rounded-card overflow-hidden p-8">
          <PageHeader
            title="Discover Brava Island"
            subtitle="Explore the cultural heritage and natural beauty of Cape Verde's most enchanting island."
          />
        </div>
      </div>

      {/* Size Variants */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Size Variants
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-surface-alt rounded-card overflow-hidden p-6">
            <PageHeader
              title="Large Size"
              subtitle="4xl/5xl text"
              size="large"
            />
            <p className="text-muted mt-4 text-center text-xs">
              size=&quot;large&quot; (default)
            </p>
          </div>
          <div className="bg-surface-alt rounded-card overflow-hidden p-6">
            <PageHeader
              title="Default Size"
              subtitle="3xl/4xl text"
              size="default"
            />
            <p className="text-muted mt-4 text-center text-xs">
              size=&quot;default&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Heading Levels */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Heading Levels
        </h3>
        <p className="text-muted mb-4 text-sm">
          Use <code>as=&quot;h2&quot;</code> when the page already has an H1
          element (e.g., in a sidebar layout).
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-surface-alt rounded-card overflow-hidden p-6">
            <PageHeader title="H1 Heading" size="default" />
            <p className="text-muted mt-4 text-center text-xs">
              as=&quot;h1&quot; (default)
            </p>
          </div>
          <div className="bg-surface-alt rounded-card overflow-hidden p-6">
            <PageHeader title="H2 Heading" as="h2" size="default" />
            <p className="text-muted mt-4 text-center text-xs">
              as=&quot;h2&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Alignment
        </h3>
        <div className="space-y-6">
          <div className="bg-surface-alt rounded-card overflow-hidden p-6">
            <PageHeader
              title="Centered Header"
              subtitle="Text and accent bar are centered (default)"
              size="default"
              centered={true}
            />
          </div>
          <div className="bg-surface-alt rounded-card overflow-hidden p-6">
            <PageHeader
              title="Left-Aligned Header"
              subtitle="Text and accent bar align to the left"
              size="default"
              centered={false}
            />
          </div>
        </div>
      </div>

      {/* Without Accent Bar */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Without Accent Bar
        </h3>
        <div className="bg-surface-alt rounded-card overflow-hidden p-6">
          <PageHeader
            title="Clean Header"
            subtitle="No accent bar for a more minimal look"
            size="default"
            showAccentBar={false}
          />
        </div>
      </div>

      {/* Animation Note */}
      <div className="bg-surface-alt rounded-card p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Animation</h3>
        <p className="text-muted text-sm">
          PageHeader uses Framer Motion for entrance animations:
        </p>
        <ul className="text-muted mt-2 list-inside list-disc space-y-1 text-sm">
          <li>Title and subtitle fade in + slide up (0.6s)</li>
          <li>Accent bar scales from center (0.6s, 0.3s delay)</li>
          <li>
            Animations respect <code>prefers-reduced-motion</code>
          </li>
        </ul>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Usage</h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`import { PageHeader } from "@/components/ui/page-header";`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">{`// Basic usage`}</code>
          <code className="text-muted block text-sm">
            {`<PageHeader title="Page Title" subtitle="Optional subtitle" />`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">{`// With options`}</code>
          <code className="text-muted block text-sm">{`<PageHeader`}</code>
          <code className="text-muted block pl-4 text-sm">
            {`title="Section Title"`}
          </code>
          <code className="text-muted block pl-4 text-sm">{`as="h2"`}</code>
          <code className="text-muted block pl-4 text-sm">
            {`size="default"`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`centered={false}`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`showAccentBar={false}`}
          </code>
          <code className="text-muted block text-sm">{`/>`}</code>
        </div>
      </div>
    </div>
  );
}
