import type { StripWhitespace, ConsumeBalanced } from './utils';

/**
 * ICU Message argument formats.
 */
type MessageArgumentFormat =
  | 'number'
  | 'plural'
  | 'selectordinal'
  | 'date'
  | 'time'
  | 'select';

/**
 * Convert ICU argument format type to TS type.
 */
type Value<T extends MessageArgumentFormat> = T extends
  | 'number'
  | 'plural'
  | 'selectordinal'
  ? number
  : T extends 'date' | 'time'
    ? Date | number
    : T extends 'select'
      ? string
      : never;

/**
 * Message argument tuple with the key and value.
 */
type MessageArgument<
  K extends string,
  V extends Value<MessageArgumentFormat>,
> = K extends '' ? never : [K, V];

/**
 * Utility type to remove escaped characters.
 *
 * @example "'{word}" -> "word}"
 * @example "foo '{word1} {word2}'" -> "foo "
 */
type StripEscaped<S extends string> =
  S extends `${infer A}'${string}'${infer B}`
    ? StripEscaped<`${A}${B}`>
    : S extends `${infer A}'${string}${infer B}`
      ? StripEscaped<`${A}${B}`>
      : S;

/**
 * Utility type to sanitize a message string by:
 *  1. Stripping whitespace
 *  2. Stripping escaped characters
 */
type Sanitize<S extends string> = StripEscaped<StripWhitespace<S>>;

/**
 * Extract ICU message arguments from the given string.
 */
type ExtractArguments<S extends string> = S extends `${string}{${infer After}`
  ? ConsumeBalanced<After> extends [
      infer Inner extends string,
      infer Rest extends string,
    ]
    ?
        | (Inner extends `${string},${'select' | 'plural' | 'selectordinal'},${string}`
            ? ExtractComplexArgument<Inner>
            : ExtractSimpleArgument<Inner>)
        | ExtractArguments<Rest>
    : never
  : never;

/**
 * Handle simple argument format extraction (i.e number, date, and plain strings)
 */
type ExtractSimpleArgument<S extends string> = S extends
  | `${infer Name},${infer Format},${string}`
  | `${infer Name},${infer Format}`
  ? Format extends MessageArgumentFormat
    ? MessageArgument<Name, Value<Format>>
    : never
  : MessageArgument<S, string>;

/**
 * Handle complex type argument extraction (i.e plural, select, and selectordinal) which
 * can have nested arguments.
 */
type ExtractComplexArgument<S extends string> =
  S extends `${infer Name},${infer FormatAndRest}`
    ? FormatAndRest extends `${infer Format},${infer Rest}`
      ? Format extends 'plural' | 'selectordinal'
        ? MessageArgument<Name, Value<Format>> | ExtractNestedArguments<Rest>
        : Format extends 'select'
          ?
              | MessageArgument<
                  Name,
                  ReplaceOtherArgument<ExtractSelectMatches<Rest>>
                >
              | ExtractNestedArguments<Rest>
          : never
      : never
    : never;

/**
 * Extract nested arguments from complex types such as plural, select, and selectordinal.
 */
type ExtractNestedArguments<S extends string> =
  S extends `${string}{${infer After}`
    ? ConsumeBalanced<After> extends [
        infer Inner extends string,
        infer Rest extends string,
      ]
      ? ExtractArguments<Inner> | ExtractNestedArguments<Rest>
      : never
    : never;

/**
 * Extracts the top-level keys of {select} arguments as a union
 */
type ExtractSelectMatches<
  S extends string,
  Result = never,
> = S extends `${infer Before}{${infer After}`
  ? ConsumeBalanced<After> extends [string, infer Rest extends string]
    ? // only add `Before` if it's non-empty
      ExtractSelectMatches<Rest, Result | (Before extends '' ? never : Before)>
    : Result
  : // base case — only add `S` if it's non-empty
    Result | (S extends '' ? never : S);

/**
 * Replace "other" with any string
 */
type ReplaceOtherArgument<S extends string> = S extends 'other'
  ? {} & string
  : S;

/**
 * Create an object mapping the extracted key to its type.
 */
type MapArguments<T extends MessageArgument<any, any>> = {
  [K in T[0]]: Extract<T, MessageArgument<K, any>>[1];
};

/**
 * Message arguments for an ICU message string.
 *
 * @example
 * ```ts
 * type Args0 = ICUMessageArguments<'Hello, {firstName} {lastName}'>
 * // => { firstName: string; lastName: string }
 *
 * type Args1 = ICUMessageArguments<'The number is {num, number, ::.00}'>
 * // => { num: number }
 *
 * type Args2 = ICUMessageArguments<`{type, select, A {Selected: A} B {Selected: B} other {Selected: Other}}`>
 * // => { type: 'A' | 'B' | ({} & string)}
 * ```
 */
export type ICUMessageArguments<T extends string> = MapArguments<
  ExtractArguments<Sanitize<T>>
>;
