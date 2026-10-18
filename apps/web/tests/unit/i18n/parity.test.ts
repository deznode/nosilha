import { describe, expect, it } from "vitest";

import en from "../../../messages/en.json";
import pt from "../../../messages/pt-PT.json";

type Messages = { [key: string]: string | Messages };

/** Every message in a file, keyed by its dotted path. */
function flatten(messages: Messages, prefix = ""): Map<string, string> {
  const flat = new Map<string, string>();
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") flat.set(path, value);
    else for (const entry of flatten(value, path)) flat.set(...entry);
  }
  return flat;
}

const NESTED = new Set(["plural", "select", "selectordinal"]);

/**
 * The argument names and rich-text tags an ICU message uses, sorted. A message in
 * the other language must use the same ones, or a value passed by the code goes
 * missing or a tag goes unrendered.
 *
 * A straight apostrophe before `{`, `}` or another apostrophe starts an ICU escape;
 * escaped text is skipped.
 */
export function icuArguments(message: string): string[] {
  const found = new Set<string>();

  function scan(text: string): void {
    let i = 0;
    while (i < text.length) {
      const char = text[i];
      if (char === "'" && /['{}]/.test(text[i + 1] ?? "")) {
        if (text[i + 1] === "'") {
          i += 2;
          continue;
        }
        const end = text.indexOf("'", i + 1);
        i = end === -1 ? text.length : end + 1;
        continue;
      }
      if (char === "<") {
        const tag = /^<\/?([A-Za-z][\w-]*)\s*\/?>/.exec(text.slice(i));
        if (tag) {
          found.add(`<${tag[1]}>`);
          i += tag[0].length;
          continue;
        }
      }
      if (char !== "{") {
        i += 1;
        continue;
      }

      const close = matchingBrace(text, i);
      const body = text.slice(i + 1, close);
      const [name, type] = body.split(",").map((part) => part.trim());
      found.add(name);
      if (type && NESTED.has(type)) {
        // Options start after the second comma: `count, plural, one {…} other {…}`.
        const options = body.slice(
          body.indexOf(",", body.indexOf(",") + 1) + 1
        );
        let j = 0;
        while (j < options.length) {
          if (options[j] === "{") {
            const end = matchingBrace(options, j);
            scan(options.slice(j + 1, end));
            j = end + 1;
          } else j += 1;
        }
      }
      i = close + 1;
    }
  }

  scan(message);
  return [...found].sort();
}

function matchingBrace(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1;
    if (text[i] === "}" && --depth === 0) return i;
  }
  throw new Error(`Unbalanced braces in: ${text}`);
}

const english = flatten(en as Messages);
const portuguese = flatten(pt as Messages);

describe("message parity", () => {
  it("gives every English message a Portuguese version", () => {
    expect([...english.keys()].filter((key) => !portuguese.has(key))).toEqual(
      []
    );
  });

  it("has no Portuguese message without an English one", () => {
    expect([...portuguese.keys()].filter((key) => !english.has(key))).toEqual(
      []
    );
  });

  it("uses the same arguments and tags in both languages", () => {
    const mismatched = [...english]
      .filter(([key]) => portuguese.has(key))
      .filter(
        ([key, message]) =>
          icuArguments(message).join() !==
          icuArguments(portuguese.get(key)!).join()
      )
      .map(([key]) => key);

    expect(mismatched).toEqual([]);
  });
});

describe("icuArguments", () => {
  it("finds plain, nested and tag arguments", () => {
    expect(
      icuArguments(
        "{count, plural, =0 {None} one {{words} record in <b>{town}</b>} other {{words} records}}"
      )
    ).toEqual(["<b>", "count", "town", "words"]);
  });

  it("skips escaped braces", () => {
    expect(icuArguments("Use '{'name'}' literally, {real}")).toEqual(["real"]);
  });

  it("treats a lone apostrophe as text", () => {
    expect(icuArguments("It's {name}'s")).toEqual(["name"]);
  });
});
