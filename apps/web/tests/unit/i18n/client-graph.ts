import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

/**
 * A static import graph of `src`, for finding which `useTranslations` namespaces each
 * route renders in the browser.
 *
 * A route file is walked as server code until it reaches a `"use client"` module;
 * from there on every import is browser code, and its `useTranslations` calls need
 * their namespace in the client provider. Server components that call
 * `useTranslations` read the server's messages and are not counted.
 *
 * It reads source with regular expressions, not a parser. Barrel files (made only of
 * `export … from` lines) are followed by imported name, so importing one component
 * from `@/components/gallery` does not pull in the whole folder.
 */

export const WEB_ROOT = resolve(__dirname, "../../..");
export const SRC = join(WEB_ROOT, "src");

const EXTENSIONS = [".tsx", ".ts", "/index.tsx", "/index.ts"];

const sourceCache = new Map<string, string>();
function read(file: string): string {
  let source = sourceCache.get(file);
  if (source === undefined) {
    source = readFileSync(file, "utf8");
    sourceCache.set(file, source);
  }
  return source;
}

function resolveSpecifier(from: string, specifier: string): string | null {
  let base: string;
  if (specifier.startsWith("@/")) base = join(SRC, specifier.slice(2));
  else if (specifier.startsWith(".")) base = resolve(dirname(from), specifier);
  else return null; // a package

  if (/\.tsx?$/.test(base) && existsSync(base) && statSync(base).isFile()) {
    return base;
  }
  if (/\.\w+$/.test(base) && !/\.tsx?$/.test(base)) return null; // css, json…
  for (const extension of EXTENSIONS) {
    if (existsSync(base + extension)) return base + extension;
  }
  return null;
}

/** `null` names = the whole module (default, namespace, side effect or dynamic). */
type Edge = { file: string; names: string[] | null };

function parseNames(clause: string): string[] {
  return clause
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith("type "))
    .map((part) => part.split(/\s+as\s+/)[0].trim());
}

function imports(file: string): Edge[] {
  const source = read(file);
  const edges: Edge[] = [];
  const add = (specifier: string, names: string[] | null) => {
    const target = resolveSpecifier(file, specifier);
    if (target) edges.push({ file: target, names });
  };

  // import X, { a, b } from "…" / import * as X from "…" / export { a } from "…"
  for (const match of source.matchAll(
    /\b(import|export)\s+(?!type\s)([^;'"]*?)\s+from\s+["']([^"']+)["']/g
  )) {
    const [, , clause, specifier] = match;
    const braces = clause.match(/\{([^}]*)\}/);
    const outside = clause
      .replace(/\{[^}]*\}/, "")
      .replace(/,/g, "")
      .trim();
    if (outside)
      add(specifier, null); // default or namespace import, or export *
    else if (braces) {
      const names = parseNames(braces[1]);
      if (names.length) add(specifier, names);
    }
  }
  // import "…" and import("…")
  for (const match of source.matchAll(
    /\bimport\s*(?:\(\s*)?["']([^"']+)["']/g
  )) {
    add(match[1], null);
  }
  return edges;
}

function isBarrel(file: string): boolean {
  const code = read(file)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(
      /export\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+["'][^"']+["'];?/g,
      ""
    )
    .trim();
  return code === "" && /export/.test(read(file));
}

/** Does this module (or a barrel it re-exports) export `name`? */
function exportsName(file: string, name: string, seen = new Set<string>()) {
  if (seen.has(file)) return false;
  seen.add(file);
  const source = read(file);
  const declared = new RegExp(
    `export\\s+(?:default\\s+)?(?:async\\s+)?(?:const|let|function\\*?|class|enum)\\s+${name}\\b`
  );
  if (declared.test(source)) return true;
  for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    const exported = match[1].split(",").map((part) =>
      part
        .trim()
        .split(/\s+as\s+/)
        .pop()!
        .trim()
    );
    if (exported.includes(name)) return true;
  }
  for (const match of source.matchAll(
    /export\s+\*\s+from\s+["']([^"']+)["']/g
  )) {
    const target = resolveSpecifier(file, match[1]);
    if (target && exportsName(target, name, seen)) return true;
  }
  return false;
}

/** The modules a barrel hands `names` on from. */
function throughBarrel(file: string, names: string[]): Edge[] {
  const source = read(file);
  const edges: Edge[] = [];
  for (const match of source.matchAll(
    /export\s+(type\s+)?(\*|\{[^}]*\})\s+from\s+["']([^"']+)["']/g
  )) {
    const [, typeOnly, clause, specifier] = match;
    if (typeOnly) continue;
    const target = resolveSpecifier(file, specifier);
    if (!target) continue;
    if (clause === "*") {
      const wanted = names.filter((name) => exportsName(target, name));
      if (wanted.length) edges.push({ file: target, names: wanted });
      continue;
    }
    const wanted: string[] = [];
    for (const part of clause.slice(1, -1).split(",")) {
      const trimmed = part.trim();
      if (!trimmed || trimmed.startsWith("type ")) continue;
      const [local, exported = local] = trimmed
        .split(/\s+as\s+/)
        .map((s) => s.trim());
      if (names.includes(exported)) wanted.push(local);
    }
    if (wanted.length) {
      // `default as X` means the whole module.
      edges.push({
        file: target,
        names: wanted.includes("default") ? null : wanted,
      });
    }
  }
  return edges;
}

const isClientModule = (file: string) =>
  /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(
    read(file)
  );
const isServerActions = (file: string) =>
  /^\s*["']use server["']/.test(read(file));

/** Namespaces passed to `useTranslations` in this file (`null` = no literal). */
export function translationNamespaces(file: string): (string | null)[] {
  return [...read(file).matchAll(/\buseTranslations\(\s*(?:"([^"]*)")?/g)].map(
    (match) => match[1] ?? null
  );
}

export type ClientUse = { namespace: string | null; file: string };

/**
 * Every `useTranslations` namespace the browser needs when `entry` renders, with the
 * file that asks for it.
 */
export function clientTranslations(entry: string): ClientUse[] {
  const uses: ClientUse[] = [];
  const visited = new Set<string>();

  const visit = (file: string, client: boolean, names: string[] | null) => {
    if (isServerActions(file)) return;
    const inClient = client || isClientModule(file);
    if (names && isBarrel(file)) {
      for (const edge of throughBarrel(file, names))
        visit(edge.file, inClient, edge.names);
      return;
    }
    const key = `${inClient}:${file}`;
    if (visited.has(key)) return;
    visited.add(key);
    if (inClient) {
      for (const namespace of translationNamespaces(file)) {
        uses.push({ namespace, file: relative(SRC, file) });
      }
    }
    for (const edge of imports(file)) visit(edge.file, inClient, edge.names);
  };

  visit(entry, false, null);
  return uses;
}
