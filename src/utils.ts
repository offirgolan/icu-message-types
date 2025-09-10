/**
 * Utility type to replace a string with another.
 */
export type Replace<
  S extends string,
  R extends string,
  W extends string,
> = S extends `${infer BS}${R}${infer AS}`
  ? Replace<`${BS}${W}${AS}`, R, W>
  : S;

/**
 * Join a tuple of strings with a separator
 */
export type Join<S extends string[], Sep extends string = ','> = S extends []
  ? ''
  : S extends [infer F extends string, ...infer R extends string[]]
    ? R['length'] extends 0
      ? F
      : `${F}${Sep}${Join<R, Sep>}`
    : string;

/**
 * Pop the first item out of an array
 */
export type Pop<T extends any[]> = T extends [...infer R, any] ? R : [];

/**
 * Utility type to remove all spaces and new lines from the provided string.
 */
export type StripWhitespace<S extends string> = Replace<
  Replace<S, '\n', ''>,
  ' ',
  ''
>;
