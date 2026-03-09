import type { Metadata } from "next";
import { YouTubeSyncPanel } from "@/components/admin/youtube-sync/youtube-sync-panel";

export const metadata: Metadata = {
  title: "YouTube Sync | Admin",
  description:
    "Configure and trigger YouTube channel sync to import videos into the gallery",
};

export default function YouTubeSyncPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-body text-2xl font-bold">YouTube Channel Sync</h1>
        <p className="text-muted mt-1 text-sm">
          Import videos from the @nosilha YouTube channel into the gallery
        </p>
      </div>
      <YouTubeSyncPanel />
    </div>
  );
}
