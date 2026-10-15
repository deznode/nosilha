/**
 * Counts in prose, in the handoff's sentence forms ("Twenty-five settlements").
 * Spec 034 FR-005: every number in copy is a live aggregate, never a literal.
 *
 * Every function takes a locale (spec 041) and defaults to English, so English
 * output is unchanged. Portuguese number words agree in gender with the noun they
 * count (`um registo`, `uma fotografia`), so the caller passes the noun's gender.
 */

import { BCP47_TAGS, DEFAULT_LOCALE, type Locale } from "@/i18n/config";

/** Grammatical gender of the counted noun. English ignores it. */
export type Gender = "masculine" | "feminine";

export interface WordOptions {
  locale?: Locale;
  gender?: Gender;
}

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

// European Portuguese spellings (catorze, dezasseis, dezassete, dezanove).
const PT_ONES = [
  "zero",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
  "dez",
  "onze",
  "doze",
  "treze",
  "catorze",
  "quinze",
  "dezasseis",
  "dezassete",
  "dezoito",
  "dezanove",
];

const PT_FEMININE: Record<number, string> = { 1: "uma", 2: "duas" };

const PT_TENS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];

function ptUnit(n: number, gender: Gender): string {
  return (gender === "feminine" && PT_FEMININE[n]) || PT_ONES[n];
}

/**
 * A whole number from 0 to 99 in lowercase words; anything else in digits.
 *
 * Zero is "zero", not "none": zero phrasing belongs to the sentence ("None carries a
 * photographer"), so callers supply it through `countSentence`.
 */
export function toWords(
  n: number,
  { locale = DEFAULT_LOCALE, gender = "masculine" }: WordOptions = {}
): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);

  if (locale === "pt-PT") {
    if (n < 20) return ptUnit(n, gender);
    const tens = PT_TENS[Math.floor(n / 10)];
    const ones = n % 10;
    return ones === 0 ? tens : `${tens} e ${ptUnit(ones, gender)}`;
  }

  if (n < 20) return ONES[n];

  const tens = TENS[Math.floor(n / 10)];
  const ones = n % 10;
  return ones === 0 ? tens : `${tens}-${ONES[ones]}`;
}

/**
 * The form that agrees with `n` — "photograph"/"photographs", "is"/"are", "holds"/"hold".
 *
 * Here rather than in each screen's copy module: agreement is a formatting primitive,
 * not a per-screen editorial choice, and every copy module was rewriting it inline.
 */
export function plural(
  n: number,
  one: string,
  many: string,
  locale: Locale = DEFAULT_LOCALE
): string {
  return new Intl.PluralRules(BCP47_TAGS[locale]).select(n) === "one"
    ? one
    : many;
}

/**
 * `a`, `a and b`, `a, b and c`, with the last pair joined by `word`.
 *
 * English keeps its own join: `Intl.ListFormat("en-US")` puts a comma before "and",
 * which would change today's English. Other locales use `Intl.ListFormat`, which
 * supplies the word itself (`e`, `ou` in Portuguese).
 */
export function joinList(
  parts: string[],
  word: "and" | "or",
  locale: Locale = DEFAULT_LOCALE
): string {
  if (parts.length <= 1) return parts.join("");
  if (locale !== "en") {
    return new Intl.ListFormat(BCP47_TAGS[locale], {
      type: word === "and" ? "conjunction" : "disjunction",
    }).format(parts);
  }
  return `${parts.slice(0, -1).join(", ")} ${word} ${parts[parts.length - 1]}`;
}

/** Upper-cases the first character only. */
export function capitalise(
  text: string,
  locale: Locale = DEFAULT_LOCALE
): string {
  return text.charAt(0).toLocaleUpperCase(BCP47_TAGS[locale]) + text.slice(1);
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
export function countSentence(
  n: number,
  forms: CountForms,
  options: WordOptions = {}
): string {
  if (n === 0) return forms.zero;

  const template = plural(n, forms.one, forms.many, options.locale);
  return capitalise(
    template.replace(/\{n\}/g, toWords(n, options)),
    options.locale
  );
}
