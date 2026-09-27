/**
 * Small string primitives shared across the archive's copy and data adapters.
 */

/**
 * A non-empty trimmed string, or null.
 *
 * The archive treats blank and absent as the same thing — a field nobody has filled
 * in — so every reader of a nullable text field goes through here rather than testing
 * emptiness its own way.
 */
export function trimmed(value: string | null | undefined): string | null {
  const text = value?.trim();
  return text ? text : null;
}

/**
 * The start of a text, on one line and cut at a word, for a meta description or a
 * social card: a host's description can run to 2,048 characters and several lines.
 */
export function excerpt(value: string, max = 160): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
