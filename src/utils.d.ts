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
 * Pop the first item out of an array
 */
export type Pop<T extends any[]> = T extends [...infer R, any] ? R : [];

/**
 * Utility type to remove all spaces, new lines, and tabs from the provided string.
 */
export type StripWhitespace<S extends string> = Replace<
  Replace<Replace<S, '\t', ''>, '\n', ''>,
  ' ',
  ''
>;

/**
 * Consume characters until the matching closing brace for an already-seen "{"
 *
 * @param S
 * @returns When the outermost brace closes, it returns a tuple: `[Acc, Rest]`
 *   - Acc: the string between the outer {…} (balanced, with nested braces preserved).
 *   - Rest: the remainder of the string after the closing brace.
 */
export type ConsumeBalanced<
  S extends string, // remaining string after the initial "{"
  Acc extends string = '', // accumulator: the characters inside the braces
  Depth extends any[] = [any], // nesting depth, starts at 1 because we already saw one "{"
> = S extends `${infer C}${infer Rest}` // look at the next character
  ? C extends '{'
    ? // If it's an opening "{", go deeper: push onto Depth, append to Acc
      ConsumeBalanced<Rest, `${Acc}{`, [...Depth, any]>
    : C extends '}'
      ? Depth extends [any]
        ? // If it's a "}" and we're at the *outermost* depth
          // → stop, return a tuple [contentInside, remainderAfterClosing]
          [Acc, Rest]
        : // Else it’s a "}" but we’re deeper inside → pop Depth and continue
          ConsumeBalanced<Rest, `${Acc}}`, Pop<Depth>>
      : // Any other character → just accumulate it and keep going
        ConsumeBalanced<Rest, `${Acc}${C}`, Depth>
  : // End of string reached unexpectedly (no closing brace)
    [never, never];
