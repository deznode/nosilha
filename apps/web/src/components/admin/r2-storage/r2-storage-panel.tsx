"use client";

import { Database, Upload, AlertTriangle } from "lucide-react";
import {
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@/components/ui/tab-group";
import { BrowseTab } from "./browse-tab";
import { BulkUploadTab } from "./bulk-upload-tab";
import { OrphansTab } from "./orphans-tab";

/**
 * R2 Storage Management Panel
 *
 * Provides admin controls for R2 bucket management with 3 sub-tabs:
 * - Browse: List and inspect objects in the R2 bucket
 * - Bulk Upload: Drag-and-drop multi-file upload with progress
 * - Orphans: Detect and manage orphaned R2 objects
 */
export function R2StoragePanel() {
  return (
    <div className="border-hairline bg-surface rounded-card border p-4 sm:p-6">
      <h3 className="text-body mb-4 text-lg font-semibold">
        R2 Storage Management
      </h3>
      <TabGroup>
        <TabList>
          <Tab icon={Database} color="blue">
            Browse
          </Tab>
          <Tab icon={Upload} color="green">
            Bulk Upload
          </Tab>
          <Tab icon={AlertTriangle} color="ochre">
            Orphans
          </Tab>
        </TabList>
        <TabPanels className="mt-4">
          <TabPanel>
            <BrowseTab />
          </TabPanel>
          <TabPanel>
            <BulkUploadTab />
          </TabPanel>
          <TabPanel>
            <OrphansTab />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
