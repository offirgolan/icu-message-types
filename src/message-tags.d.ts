/**
 * Recursively extract matching tags. This enforces that the closing tag name
 * equals the previously-captured opening tag name.
 *
 * - Handles nested tags and multiple tags.
 * - If the opening tag has attributes like `<a href="...">`, it extracts "a".
 */
type ExtractTags<S extends string> =
  S extends `${string}<${infer TagAndRest}>${infer After}`
    ? // If there are attributes after the tag name, split them off:
      TagAndRest extends `${infer TagName} ${string}`
      ? After extends `${infer Inner}</${TagName}>${infer Rest}`
        ? TagName | ExtractTags<Inner> | ExtractTags<Rest>
        : ExtractTags<After>
      : After extends `${infer Inner}</${TagAndRest}>${infer Rest}`
        ? TagAndRest | ExtractTags<Inner> | ExtractTags<Rest>
        : ExtractTags<After>
    : never;

/**
 * Message tags for an ICU message string.
 *
 * @example
 * ```ts
 * type Tags0 = ICUMessageTags<'The price is <boldThis>{price, number, ::currency/USD precision-integer}</boldThis> with <link>{pct, number, ::percent} discount</link>'>
 * // => 'boldThis' | 'link'
 *
 * type Tags1 = ICUMessageTags<'The price is {price, number, ::currency/USD precision-integer}'>
 * // => never
 * ```
 */
export type ICUMessageTags<S extends string> = ExtractTags<S>;
