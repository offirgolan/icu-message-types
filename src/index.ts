import type { StripWhitespace, Pop, Join } from './utils';

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
type ExtractArguments<S extends string> =
  /* Handle {arg0,selectordinal,...}} since it has nested {} */
  S extends `${infer A}{${infer B}}}${infer C}`
    ? ExtractArguments<A> | _ExtractComplexArguments<B> | ExtractArguments<C>
    : /* Handle remaining arguments {arg0}, {arg0, number}, {arg0, date, short}, etc. */
      S extends `${infer A}{${infer B}}${infer C}`
      ? ExtractArguments<A> | B | ExtractArguments<C>
      : never;

/**
 * Handle complex type argument extraction (i.e plural, select, and selectordinal) which
 * can have nested arguments.
 */
type _ExtractComplexArguments<S extends string> =
  /* Handle arg0,plural,... */
  S extends `${infer A},plural,${infer B}`
    ? ExtractArguments<`{${A},plural}`> | _ExtractNestedArguments<`${B}}`>
    : /* Handle arg0,select,... */
      S extends `${infer A},select,${infer B}`
      ? // Extract the select's arguments and store them as [a|b|other] so
        // we can extract them later.
        | ExtractArguments<`{${A},select[${Join<_ExtractSelectArguments<B>, '|'>}]}`>
          | _ExtractNestedArguments<`${B}}`>
      : /* Handle arg0,selectordinal,... */
        S extends `${infer A},selectordinal,${infer B}`
        ?
            | ExtractArguments<`{${A},selectordinal}`>
            | _ExtractNestedArguments<`${B}}`>
        : never;

/**
 * Extract nested arguments from complex types such as plural, select, and selectordinal.
 */
type _ExtractNestedArguments<S extends string> =
  S extends `${infer A}{${infer B}}${infer C}`
    ?
        | _ExtractNestedArguments<A>
        | ExtractArguments<`${B}}`>
        | _ExtractNestedArguments<C>
    : never;

/**
 * Extracts the top-level keys of {select} arguments as a tuple
 */
type _ExtractSelectArguments<
  S extends string,
  Depth extends any[] = [],
  Acc extends string = '',
  Result extends string[] = [],
> = S extends `${infer C}${infer Rest}`
  ? C extends '{'
    ? _ExtractSelectArguments<Rest, [...Depth, any], Acc, Result>
    : C extends '}'
      ? Depth extends [any] // closing outermost brace
        ? _ExtractSelectArguments<Rest, Pop<Depth>, '', [...Result, Acc]>
        : _ExtractSelectArguments<Rest, Pop<Depth>, Acc, Result>
      : Depth['length'] extends 0
        ? _ExtractSelectArguments<Rest, Depth, `${Acc}${C}`, Result>
        : _ExtractSelectArguments<Rest, Depth, Acc, Result>
  : Acc extends ''
    ? Result
    : [...Result, Acc];

/**
 * Normalize extract arguments to either `name` or `name,type`.
 */
type NormalizeArguments<TArg extends string> =
  /* Handle "name,type,other args" */
  TArg extends `${infer Name},${infer Type},${string}`
    ? `${Name},${Type}`
    : /* Handle "name,type" */
      TArg extends `${infer Name},${infer Type}`
      ? `${Name},${Type}`
      : /* Handle "name" */
        TArg;

/**
 * Converts the generated select arguments string ("a|b|other") into a union.
 */
type SelectArgumentsToUnion<S extends string> =
  S extends `${infer First}|${infer Rest}`
    ? First | SelectArgumentsToUnion<Rest>
    : S;

/**
 * Replace "other" with "any string"
 */
type ReplaceOtherArgument<U extends string> = U extends 'other'
  ? {} & string
  : U;

/**
 * Convert ICU type to TS type.
 */
type Value<T extends string> = T extends 'number' | 'plural' | 'selectordinal'
  ? number
  : T extends 'date' | 'time'
    ? Date | number
    : T extends `select[${infer A}]`
      ? ReplaceOtherArgument<SelectArgumentsToUnion<A>>
      : string;

/**
 * Create an object mapping the extracted key to its type.
 */
type MapArguments<S extends string> = {
  [key in S extends `${infer Key},${string}` ? Key : S]: Extract<
    S,
    `${key},${string}`
  > extends `${string},${infer V}`
    ? Value<V>
    : string;
};

/**
 * Create an object mapping all ICU message arguments to their types.
 */
export type ExtractMessageArguments<T extends string> = MapArguments<
  NormalizeArguments<ExtractArguments<Sanitize<T>>>
>;
