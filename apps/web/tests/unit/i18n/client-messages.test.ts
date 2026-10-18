import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import messages from "../../../messages/en.json";
import {
  ADMIN_MESSAGES,
  pickMessages,
  ROOT_MESSAGES,
} from "@/i18n/client-messages";
import { clientTranslations, SRC, translationNamespaces } from "./client-graph";

const APP = join(SRC, "app");
const LOCALE_ROOT = join(APP, "[locale]");
const ADMIN_ROOT = join(APP, "(admin)");

function sourceFiles(dir: string, pattern: RegExp): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path, pattern);
    return pattern.test(name) ? [path] : [];
  });
}

const ROUTE_FILE =
  /^(page|layout|template|default|error|not-found|loading)\.tsx$/;
const routeFiles = (dir: string) => sourceFiles(dir, ROUTE_FILE).sort();
const isPage = (file: string) => file.endsWith("/page.tsx");

/** The message paths a file's client components read, without redundant children. */
function required(files: string[]): string[] {
  const paths = new Set(
    files.flatMap((file) =>
      clientTranslations(file).map((use) => use.namespace ?? "(none)")
    )
  );
  return [...paths]
    .filter((path) => ![...paths].some((other) => path.startsWith(`${other}.`)))
    .sort();
}

const covers = (declared: readonly string[], path: string) =>
  declared.some((d) => path === d || path.startsWith(`${d}.`));

/** The `namespaces` a file passes to `PageMessages`, or null when it has none. */
function declared(file: string): string[] | null {
  const match = readFileSync(file, "utf8").match(
    /<PageMessages\s+namespaces=\{\[([^\]]*)\]\}/
  );
  if (!match) return null;
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();
}

/**
 * The file whose `PageMessages` serves a route file: itself, else the nearest layout
 * above it. A `loading.tsx` or `error.tsx` beside a providing layout is served by it.
 */
function provider(file: string): string | null {
  if (declared(file)) return file;
  for (let dir = dirname(file); dir !== LOCALE_ROOT; dir = dirname(dir)) {
    const layout = join(dir, "layout.tsx");
    if (layout === file) continue;
    try {
      if (declared(layout)) return layout;
    } catch {
      // no layout in this folder
    }
  }
  return null;
}

const name = (file: string) => relative(APP, file);

describe("client messages", () => {
  const files = routeFiles(LOCALE_ROOT);
  const pages = files.filter(isPage);

  it("sends from the root exactly what the layouts and boundaries read", () => {
    const shell = files.filter((file) => !isPage(file) && !provider(file));
    expect([...ROOT_MESSAGES].sort()).toEqual(required(shell));
  });

  it("covers every page without its own messages from the root", () => {
    const short = pages
      .filter((page) => !provider(page))
      .flatMap((page) =>
        required([page])
          .filter((path) => !covers(ROOT_MESSAGES, path))
          .map((path) => `${name(page)}: ${path}`)
      );
    expect(short).toEqual([]);
  });

  it("gives each PageMessages exactly what the files under it read", () => {
    const providers = new Map<string, string[]>();
    for (const file of files) {
      const owner = provider(file);
      if (owner) providers.set(owner, [...(providers.get(owner) ?? []), file]);
    }
    expect(providers.size).toBeGreaterThan(0);
    for (const [file, served] of providers) {
      expect({ file: name(file), namespaces: declared(file) }).toEqual({
        file: name(file),
        namespaces: required(served),
      });
    }
  });

  it("sends the admin area exactly what its pages and layout read", () => {
    expect([...ADMIN_MESSAGES].sort()).toEqual(
      required(routeFiles(ADMIN_ROOT))
    );
  });

  it("names a namespace in every useTranslations call, and it exists", () => {
    const bad = sourceFiles(SRC, /\.tsx?$/).flatMap((file) =>
      translationNamespaces(file)
        .filter(
          (namespace) =>
            !namespace ||
            Object.keys(pickMessages(messages, [namespace])).length === 0
        )
        .map((namespace) => `${relative(SRC, file)}: ${namespace ?? "(none)"}`)
    );
    expect(bad).toEqual([]);
  });

  it("lists only paths that exist in en.json", () => {
    const missing = [...ROOT_MESSAGES, ...ADMIN_MESSAGES].filter(
      (path) => Object.keys(pickMessages(messages, [path])).length === 0
    );
    expect(missing).toEqual([]);
  });
});

describe("pickMessages", () => {
  const source = {
    auth: { form: { email: "Email" }, signInDialog: { title: "Sign in" } },
    chrome: { home: "Home" },
    films: { title: "Films" },
  };

  it("keeps whole namespaces and parts of them, nested as in the source", () => {
    expect(pickMessages(source, ["chrome", "auth.signInDialog"])).toEqual({
      chrome: { home: "Home" },
      auth: { signInDialog: { title: "Sign in" } },
    });
  });

  it("merges two parts of one namespace", () => {
    expect(pickMessages(source, ["auth.form", "auth.signInDialog"])).toEqual({
      auth: source.auth,
    });
  });

  it("skips paths that don't exist", () => {
    expect(pickMessages(source, ["missing", "auth.missing"])).toEqual({});
  });

  it("skips a path through a null value", () => {
    const withNull = { auth: null } as unknown as typeof source;
    expect(pickMessages(withNull, ["auth.form"])).toEqual({});
  });
});
