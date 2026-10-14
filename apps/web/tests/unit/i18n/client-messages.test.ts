import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import messages from "../../../messages/en.json";
import { CLIENT_NAMESPACES, pickClientMessages } from "@/i18n/client-messages";

const SRC = join(__dirname, "../../../src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

/** Every `useTranslations(...)` call in `src`, with the namespace it passes. */
function useTranslationsCalls(): { file: string; namespace: string | null }[] {
  return sourceFiles(SRC).flatMap((path) => {
    const source = readFileSync(path, "utf8");
    return [...source.matchAll(/\buseTranslations\(\s*(?:"([^"]*)")?/g)].map(
      (match) => ({
        file: relative(SRC, path),
        namespace: match[1] ?? null,
      })
    );
  });
}

describe("client messages", () => {
  const listed = new Set<string>(CLIENT_NAMESPACES);

  it("lists every namespace a useTranslations call reads", () => {
    const missing = useTranslationsCalls()
      .filter(
        ({ namespace }) => !namespace || !listed.has(namespace.split(".")[0])
      )
      .map(
        ({ file, namespace }) => `${file}: ${namespace ?? "(no namespace)"}`
      );

    expect(missing).toEqual([]);
  });

  it("lists only namespaces that exist in en.json", () => {
    expect(
      CLIENT_NAMESPACES.filter((namespace) => !(namespace in messages))
    ).toEqual([]);
  });

  it("passes only the listed namespaces to the browser", () => {
    expect(Object.keys(pickClientMessages(messages))).toEqual(
      CLIENT_NAMESPACES.filter((namespace) => namespace in messages)
    );
  });
});
