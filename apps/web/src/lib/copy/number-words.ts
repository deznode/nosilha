/**
 * Counts in prose, in the handoff's sentence forms ("Twenty-five settlements").
 * Spec 034 FR-005: every number in copy is a live aggregate, never a literal.
 */

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

/**
 * A whole number from 0 to 99 in lowercase words; anything else in digits.
 *
 * Zero is "zero", not "none": zero phrasing belongs to the sentence ("None carries a
 * photographer"), so callers supply it through `countSentence`.
 */
export function toWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (n < 20) return ONES[n];

  const tens = TENS[Math.floor(n / 10)];
  const ones = n % 10;
  return ones === 0 ? tens : `${tens}-${ONES[ones]}`;
}

/** Upper-cases the first character only. */
export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export interface CountForms {
  /** Singular template; `{n}` becomes the number in words. */
  one: string;
  /** Plural template; `{n}` becomes the number in words. */
  many: string;
  /** The whole sentence for zero, as written. */
  zero: string;
}

/**
 * A count as the opening of a sentence: `countSentence(25, { many: "{n} settlements" })`
 * gives "Twenty-five settlements". Zero returns `forms.zero` unchanged.
 */
export function countSentence(n: number, forms: CountForms): string {
  if (n === 0) return forms.zero;

  const template = n === 1 ? forms.one : forms.many;
  return capitalise(template.replace(/\{n\}/g, toWords(n)));
}
