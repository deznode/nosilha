import type { APIRequestContext } from "@playwright/test";

/**
 * Reads the archive's real data for end-to-end specs.
 *
 * The specs run against the local API and its seed. Reading settlements and records
 * here, rather than hard-coding slugs, keeps a spec true when a settlement gains its
 * first record or a seed row is renamed.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface SettlementSummary {
  id: string | null;
  slug: string;
  name: string;
  entryCount: number;
  status: "DOCUMENTED" | "PARTIAL" | "NAME_ONLY";
}

export interface EntrySummary {
  slug: string;
  name: string;
  category: string;
  townId?: string | null;
}

async function readData<T>(request: APIRequestContext, path: string) {
  const response = await request.get(`${API_URL}${path}`);
  if (!response.ok()) {
    throw new Error(`GET ${path} answered ${response.status()}`);
  }
  const payload = (await response.json()) as { data: T };
  return payload.data;
}

export function settlements(request: APIRequestContext) {
  return readData<SettlementSummary[]>(request, "/api/v1/towns/status-summary");
}

export async function entries(request: APIRequestContext) {
  const page = await readData<{ items?: EntrySummary[] } | EntrySummary[]>(
    request,
    "/api/v1/directory/entries?page=0&size=100"
  );
  return Array.isArray(page) ? page : (page.items ?? []);
}

/**
 * A record together with the settlement that owns it, i.e. one that has a page.
 * `prefer` picks among them; without a match the first addressed record is used.
 */
export async function addressedRecord(
  request: APIRequestContext,
  prefer: (record: EntrySummary) => boolean = () => true
) {
  const [towns, records] = await Promise.all([
    settlements(request),
    entries(request),
  ]);
  const addressed = records.flatMap((record) => {
    const town = towns.find((candidate) => candidate.id === record.townId);
    return town ? [{ record, town, path: `/${town.slug}/${record.slug}` }] : [];
  });
  if (addressed.length === 0) {
    throw new Error("The seed holds no record that a settlement owns");
  }
  return addressed.find(({ record }) => prefer(record)) ?? addressed[0];
}

/** A settlement or record name, matched literally inside a RegExp. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
