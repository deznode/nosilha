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
