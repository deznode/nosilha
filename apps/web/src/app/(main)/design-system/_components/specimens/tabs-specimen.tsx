"use client";

import {
  Tab as HeadlessTab,
  TabGroup as HeadlessTabGroup,
  TabList as HeadlessTabList,
  TabPanel as HeadlessTabPanel,
  TabPanels as HeadlessTabPanels,
} from "@headlessui/react";
import clsx from "clsx";
import {
  MapPin,
  Image,
  FileText,
  MessageSquare,
  Mail,
  Camera,
  Home,
} from "lucide-react";
import {
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@/components/ui/tab-group";

/**
 * Tabs specimen for the design system gallery.
 * Showcases both the TabGroup wrapper component and raw HeadlessUI patterns.
 */
export function TabsSpecimen() {
  return (
    <div className="space-y-10">
      {/* TabGroup Component (Recommended) */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          TabGroup Component (Recommended)
        </h3>
        <p className="text-muted mb-4 text-sm">
          Reusable wrapper with built-in underline styling, icon support,
          badges, and color variants. Use this for most tab implementations.
        </p>
        <TabGroup>
          <TabList>
            <Tab icon={Home} color="blue">
              Overview
            </Tab>
            <Tab icon={FileText} badge={3} color="pink">
              Stories
            </Tab>
            <Tab icon={Mail} badge={12} color="green">
              Messages
            </Tab>
            <Tab icon={Camera} color="ochre">
              Gallery
            </Tab>
          </TabList>
          <TabPanels className="mt-4">
            <TabPanel>
              <div className="bg-surface-alt rounded-card p-4">
                <p className="text-body text-sm">
                  Overview content. The <strong>blue</strong> color is used for
                  primary navigation.
                </p>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="bg-surface-alt rounded-card p-4">
                <p className="text-body text-sm">
                  Stories content with <strong>3 items</strong> badge. The{" "}
                  <strong>pink</strong> color adds visual interest.
                </p>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="bg-surface-alt rounded-card p-4">
                <p className="text-body text-sm">
                  Messages with <strong>12 unread</strong> badge. The{" "}
                  <strong>green</strong> color indicates success/active state.
                </p>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="bg-surface-alt rounded-card p-4">
                <p className="text-body text-sm">
                  Gallery content. The <strong>ochre</strong> color provides
                  warm accent.
                </p>
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>

      {/* Color Variants */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Color Variants
        </h3>
        <p className="text-muted mb-4 text-sm">
          Four color options for tab underlines: blue, pink, green, ochre.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <TabGroup defaultIndex={0}>
              <TabList>
                <Tab color="blue">Blue</Tab>
              </TabList>
            </TabGroup>
            <code className="text-muted text-xs">color=&quot;blue&quot;</code>
          </div>
          <div className="space-y-2">
            <TabGroup defaultIndex={0}>
              <TabList>
                <Tab color="pink">Pink</Tab>
              </TabList>
            </TabGroup>
            <code className="text-muted text-xs">color=&quot;pink&quot;</code>
          </div>
          <div className="space-y-2">
            <TabGroup defaultIndex={0}>
              <TabList>
                <Tab color="green">Green</Tab>
              </TabList>
            </TabGroup>
            <code className="text-muted text-xs">color=&quot;green&quot;</code>
          </div>
          <div className="space-y-2">
            <TabGroup defaultIndex={0}>
              <TabList>
                <Tab color="ochre">Ochre</Tab>
              </TabList>
            </TabGroup>
            <code className="text-muted text-xs">color=&quot;ochre&quot;</code>
          </div>
        </div>
      </div>

      {/* TabGroup Usage */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">
          TabGroup Component Usage
        </h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@/components/ui/tab-group";`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">{`<TabGroup>`}</code>
          <code className="text-muted block pl-4 text-sm">{`<TabList>`}</code>
          <code className="text-muted block pl-8 text-sm">
            {`<Tab icon={Home} color="blue">Home</Tab>`}
          </code>
          <code className="text-muted block pl-8 text-sm">
            {`<Tab icon={Mail} badge={5} color="green">Messages</Tab>`}
          </code>
          <code className="text-muted block pl-4 text-sm">{`</TabList>`}</code>
          <code className="text-muted block pl-4 text-sm">{`<TabPanels>`}</code>
          <code className="text-muted block pl-8 text-sm">
            {`<TabPanel>Home content</TabPanel>`}
          </code>
          <code className="text-muted block pl-8 text-sm">
            {`<TabPanel>Messages content</TabPanel>`}
          </code>
          <code className="text-muted block pl-4 text-sm">{`</TabPanels>`}</code>
          <code className="text-muted block text-sm">{`</TabGroup>`}</code>
        </div>
      </div>

      <div className="border-hairline border-t pt-10">
        <h2 className="text-body mb-6 text-lg font-semibold">
          Raw HeadlessUI Patterns
        </h2>
        <p className="text-muted mb-6 text-sm">
          For custom styling needs, you can use HeadlessUI Tab directly.
        </p>
      </div>

      {/* Basic Tabs */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Underline Tabs (Raw)
        </h3>
        <p className="text-muted mb-4 text-sm">
          Clean underline indicator for section switching. Standard pattern for
          content organization.
        </p>
        <HeadlessTabGroup>
          <HeadlessTabList className="border-hairline flex gap-4 border-b">
            {["Overview", "Details", "Reviews", "Photos"].map((tab) => (
              <HeadlessTab
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
              </HeadlessTab>
            ))}
          </HeadlessTabList>
          <HeadlessTabPanels className="mt-4">
            {["Overview", "Details", "Reviews", "Photos"].map((tab) => (
              <HeadlessTabPanel key={tab} className="focus:outline-none">
                <div className="bg-surface-alt rounded-card p-4">
                  <p className="text-body text-sm">
                    Content for <strong>{tab}</strong> tab. This area can
                    contain any content including forms, lists, or rich media.
                  </p>
                </div>
              </HeadlessTabPanel>
            ))}
          </HeadlessTabPanels>
        </HeadlessTabGroup>
      </div>

      {/* Pill Tabs */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Pill Tabs
        </h3>
        <p className="text-muted mb-4 text-sm">
          Filled background style for more prominent tab navigation.
        </p>
        <HeadlessTabGroup>
          <HeadlessTabList className="bg-surface-alt inline-flex gap-1 rounded-lg p-1">
            {["All", "Published", "Draft", "Archived"].map((tab) => (
              <HeadlessTab
                key={tab}
                className={clsx(
                  "rounded-button px-4 py-2 text-sm font-medium transition-all",
                  "text-muted hover:text-body",
                  "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2",
                  "data-selected:bg-surface data-selected:text-body data-selected:shadow-sm"
                )}
              >
                {tab}
              </HeadlessTab>
            ))}
          </HeadlessTabList>
          <HeadlessTabPanels className="mt-4">
            {["All", "Published", "Draft", "Archived"].map((tab) => (
              <HeadlessTabPanel key={tab} className="focus:outline-none">
                <div className="border-hairline rounded-card border p-4">
                  <p className="text-muted text-sm">
                    Showing <strong>{tab.toLowerCase()}</strong> items
                  </p>
                </div>
              </HeadlessTabPanel>
            ))}
          </HeadlessTabPanels>
        </HeadlessTabGroup>
      </div>

      {/* Tabs with Icons */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Tabs with Icons (Raw)
        </h3>
        <p className="text-muted mb-4 text-sm">
          Icons provide visual cues for tab purpose.
        </p>
        <HeadlessTabGroup>
          <HeadlessTabList className="border-hairline flex gap-2 border-b">
            {[
              { label: "Location", icon: MapPin },
              { label: "Gallery", icon: Image },
              { label: "Story", icon: FileText },
              { label: "Comments", icon: MessageSquare },
            ].map((tab) => (
              <HeadlessTab
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
              </HeadlessTab>
            ))}
          </HeadlessTabList>
          <HeadlessTabPanels className="mt-4">
            {[
              { label: "Location", content: "Map and address information" },
              { label: "Gallery", content: "Photo gallery and media" },
              { label: "Story", content: "Historical narrative and context" },
              { label: "Comments", content: "Community discussion" },
            ].map((tab) => (
              <HeadlessTabPanel key={tab.label} className="focus:outline-none">
                <div className="bg-surface-alt rounded-card p-4">
                  <p className="text-body text-sm">{tab.content}</p>
                </div>
              </HeadlessTabPanel>
            ))}
          </HeadlessTabPanels>
        </HeadlessTabGroup>
      </div>

      {/* Vertical Tabs */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Vertical Tabs
        </h3>
        <p className="text-muted mb-4 text-sm">
          Vertical layout for settings pages or sidebars.
        </p>
        <HeadlessTabGroup vertical className="flex gap-6">
          <HeadlessTabList className="border-hairline flex w-48 flex-col gap-1 border-r pr-4">
            {["General", "Notifications", "Privacy", "Security"].map((tab) => (
              <HeadlessTab
                key={tab}
                className={clsx(
                  "rounded-button px-3 py-2 text-left text-sm font-medium transition-colors",
                  "text-muted hover:bg-surface-alt hover:text-body",
                  "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2",
                  "data-selected:bg-ocean-blue/10 data-selected:text-ocean-blue"
                )}
              >
                {tab}
              </HeadlessTab>
            ))}
          </HeadlessTabList>
          <HeadlessTabPanels className="flex-1">
            {["General", "Notifications", "Privacy", "Security"].map((tab) => (
              <HeadlessTabPanel key={tab} className="focus:outline-none">
                <h4 className="text-body mb-2 font-semibold">{tab} Settings</h4>
                <p className="text-muted text-sm">
                  Configure your {tab.toLowerCase()} preferences here.
                </p>
              </HeadlessTabPanel>
            ))}
          </HeadlessTabPanels>
        </HeadlessTabGroup>
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

      {/* Raw HeadlessUI Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">
          Raw HeadlessUI Usage
        </h3>
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
