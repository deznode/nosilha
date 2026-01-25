"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import clsx from "clsx";
import { MapPin, Image, FileText, MessageSquare } from "lucide-react";

/**
 * Tabs specimen for the design system gallery.
 * Showcases HeadlessUI Tab component with various styles and configurations.
 */
export function TabsSpecimen() {
  return (
    <div className="space-y-10">
      {/* Basic Tabs */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Underline Tabs (Default)
        </h3>
        <p className="text-muted mb-4 text-sm">
          Clean underline indicator for section switching. Standard pattern for
          content organization.
        </p>
        <TabGroup>
          <TabList className="border-hairline flex gap-4 border-b">
            {["Overview", "Details", "Reviews", "Photos"].map((tab) => (
              <Tab
                key={tab}
                className={clsx(
                  "relative px-1 pb-3 text-sm font-medium transition-colors",
                  "text-muted hover:text-body",
                  "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  "data-selected:text-ocean-blue",
                  "after:bg-ocean-blue after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:opacity-0",
                  "data-selected:after:opacity-100"
                )}
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanels className="mt-4">
            {["Overview", "Details", "Reviews", "Photos"].map((tab) => (
              <TabPanel key={tab} className="focus:outline-none">
                <div className="bg-surface-alt rounded-card p-4">
                  <p className="text-body text-sm">
                    Content for <strong>{tab}</strong> tab. This area can
                    contain any content including forms, lists, or rich media.
                  </p>
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>

      {/* Pill Tabs */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Pill Tabs
        </h3>
        <p className="text-muted mb-4 text-sm">
          Filled background style for more prominent tab navigation.
        </p>
        <TabGroup>
          <TabList className="bg-surface-alt inline-flex gap-1 rounded-lg p-1">
            {["All", "Published", "Draft", "Archived"].map((tab) => (
              <Tab
                key={tab}
                className={clsx(
                  "rounded-button px-4 py-2 text-sm font-medium transition-all",
                  "text-muted hover:text-body",
                  "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2",
                  "data-selected:bg-surface data-selected:text-body data-selected:shadow-sm"
                )}
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanels className="mt-4">
            {["All", "Published", "Draft", "Archived"].map((tab) => (
              <TabPanel key={tab} className="focus:outline-none">
                <div className="border-hairline rounded-card border p-4">
                  <p className="text-muted text-sm">
                    Showing <strong>{tab.toLowerCase()}</strong> items
                  </p>
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>

      {/* Tabs with Icons */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Tabs with Icons
        </h3>
        <p className="text-muted mb-4 text-sm">
          Icons provide visual cues for tab purpose.
        </p>
        <TabGroup>
          <TabList className="border-hairline flex gap-2 border-b">
            {[
              { label: "Location", icon: MapPin },
              { label: "Gallery", icon: Image },
              { label: "Story", icon: FileText },
              { label: "Comments", icon: MessageSquare },
            ].map((tab) => (
              <Tab
                key={tab.label}
                className={clsx(
                  "relative flex items-center gap-2 px-3 pb-3 text-sm font-medium transition-colors",
                  "text-muted hover:text-body",
                  "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  "data-selected:text-ocean-blue",
                  "after:bg-ocean-blue after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:opacity-0",
                  "data-selected:after:opacity-100"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Tab>
            ))}
          </TabList>
          <TabPanels className="mt-4">
            {[
              { label: "Location", content: "Map and address information" },
              { label: "Gallery", content: "Photo gallery and media" },
              { label: "Story", content: "Historical narrative and context" },
              { label: "Comments", content: "Community discussion" },
            ].map((tab) => (
              <TabPanel key={tab.label} className="focus:outline-none">
                <div className="bg-surface-alt rounded-card p-4">
                  <p className="text-body text-sm">{tab.content}</p>
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>

      {/* Vertical Tabs */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Vertical Tabs
        </h3>
        <p className="text-muted mb-4 text-sm">
          Vertical layout for settings pages or sidebars.
        </p>
        <TabGroup vertical className="flex gap-6">
          <TabList className="border-hairline flex w-48 flex-col gap-1 border-r pr-4">
            {["General", "Notifications", "Privacy", "Security"].map((tab) => (
              <Tab
                key={tab}
                className={clsx(
                  "rounded-button px-3 py-2 text-left text-sm font-medium transition-colors",
                  "text-muted hover:bg-surface-alt hover:text-body",
                  "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2",
                  "data-selected:bg-ocean-blue/10 data-selected:text-ocean-blue"
                )}
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanels className="flex-1">
            {["General", "Notifications", "Privacy", "Security"].map((tab) => (
              <TabPanel key={tab} className="focus:outline-none">
                <h4 className="text-body mb-2 font-semibold">{tab} Settings</h4>
                <p className="text-muted text-sm">
                  Configure your {tab.toLowerCase()} preferences here.
                </p>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>

      {/* Controlled Example Note */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Controlled vs Uncontrolled
        </h3>
        <div className="bg-surface-alt rounded-card space-y-2 p-4">
          <div className="flex items-start gap-3">
            <span className="text-ocean-blue text-lg">•</span>
            <p className="text-body text-sm">
              <strong>Uncontrolled</strong> - TabGroup manages state internally
              (shown above)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-ocean-blue text-lg">•</span>
            <p className="text-body text-sm">
              <strong>Controlled</strong> - Use{" "}
              <code className="bg-surface rounded px-1 text-xs">
                selectedIndex
              </code>{" "}
              and{" "}
              <code className="bg-surface rounded px-1 text-xs">onChange</code>{" "}
              props
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-ocean-blue text-lg">•</span>
            <p className="text-body text-sm">
              <strong>Default selection</strong> - Use{" "}
              <code className="bg-surface rounded px-1 text-xs">
                defaultIndex
              </code>{" "}
              prop
            </p>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Usage</h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">{`<TabGroup>`}</code>
          <code className="text-muted block pl-4 text-sm">{`<TabList>`}</code>
          <code className="text-muted block pl-8 text-sm">
            {`<Tab className="data-selected:text-ocean-blue">Tab 1</Tab>`}
          </code>
          <code className="text-muted block pl-8 text-sm">
            {`<Tab className="data-selected:text-ocean-blue">Tab 2</Tab>`}
          </code>
          <code className="text-muted block pl-4 text-sm">{`</TabList>`}</code>
          <code className="text-muted block pl-4 text-sm">{`<TabPanels>`}</code>
          <code className="text-muted block pl-8 text-sm">
            {`<TabPanel>Content 1</TabPanel>`}
          </code>
          <code className="text-muted block pl-8 text-sm">
            {`<TabPanel>Content 2</TabPanel>`}
          </code>
          <code className="text-muted block pl-4 text-sm">{`</TabPanels>`}</code>
          <code className="text-muted block text-sm">{`</TabGroup>`}</code>
        </div>
      </div>
    </div>
  );
}
