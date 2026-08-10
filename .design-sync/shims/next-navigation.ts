// design-sync shim for `next/navigation`.
//
// The real hooks read app-router contexts that only exist inside a Next.js
// runtime; called outside one they return null (and callers that do
// `pathname.startsWith(...)` then crash) or throw outright. These are inert
// stand-ins that keep preview cards rendering.
//
// A preview that needs a specific active route — nav highlighting, "is this
// tab current" styling — can set `window.__dsPathname` before rendering.
//
// Wired via compilerOptions.paths in .design-sync/tsconfig.sync.json.

declare global {
  interface Window {
    __dsPathname?: string;
    __dsSearchParams?: string;
  }
}

const noop = () => {};

export function useRouter() {
  return {
    push: noop,
    replace: noop,
    refresh: noop,
    back: noop,
    forward: noop,
    prefetch: noop,
  };
}

export function usePathname(): string {
  return (typeof window !== "undefined" && window.__dsPathname) || "/";
}

export function useSearchParams(): URLSearchParams {
  const raw = (typeof window !== "undefined" && window.__dsSearchParams) || "";
  return new URLSearchParams(raw);
}

export function useParams<T extends Record<string, string | string[]>>(): T {
  return {} as T;
}

export function useSelectedLayoutSegment(): string | null {
  return null;
}

export function useSelectedLayoutSegments(): string[] {
  return [];
}

export function useServerInsertedHTML(_cb: () => React.ReactNode): void {}

export const redirect = noop as (url: string, type?: unknown) => never;
export const permanentRedirect = noop as (url: string, type?: unknown) => never;
export const notFound = noop as () => never;
export const forbidden = noop as () => never;
export const unauthorized = noop as () => never;

export const RedirectType = { push: "push", replace: "replace" } as const;
export class ReadonlyURLSearchParams extends URLSearchParams {}
