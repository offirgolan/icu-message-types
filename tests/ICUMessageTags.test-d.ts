import { expectTypeOf, test } from 'vitest';
import type { ICUMessageTags } from '../src/message-tags';

test('No Tags', () => {
  expectTypeOf<ICUMessageTags<`hello world`>>().toEqualTypeOf<never>();
});

test('No Matching Tags', () => {
  expectTypeOf<
    ICUMessageTags<`hello <boldThis>world`>
  >().toEqualTypeOf<never>();
  expectTypeOf<ICUMessageTags<`hello </boldThis>`>>().toEqualTypeOf<never>();
  expectTypeOf<
    ICUMessageTags<`hello <link>world</boldThis>`>
  >().toEqualTypeOf<never>();
});

test('Self-Closing Tags', () => {
  // Self-closing tags (should not match)
  expectTypeOf<ICUMessageTags<`hello <br/> world`>>().toEqualTypeOf<never>();
  expectTypeOf<
    ICUMessageTags<`hello <img src="test"/> world`>
  >().toEqualTypeOf<never>();
});

test('Tags', () => {
  expectTypeOf<
    ICUMessageTags<`
      Our price is <boldThis>{price, number, ::currency/USD precision-integer}</boldThis>
      with <link>{pct, number, ::percent} discount</link>
    `>
  >().toEqualTypeOf<'boldThis' | 'link'>();

  expectTypeOf<
    ICUMessageTags<`Our price is
      <boldThis>
        {price, number, ::currency/USD precision-integer} with
        <link>{pct, number, ::percent} discount</link>
      </boldThis>
    `>
  >().toEqualTypeOf<'boldThis' | 'link'>();

  expectTypeOf<
    ICUMessageTags<`Our price is <boldThis></boldThis> <link></link>`>
  >().toEqualTypeOf<'boldThis' | 'link'>();
});

test('Tags with Attributes', () => {
  // Simple attributes
  expectTypeOf<
    ICUMessageTags<`<a href="link">text</a>`>
  >().toEqualTypeOf<'a'>();
  expectTypeOf<
    ICUMessageTags<`<button onclick="handler()" class="btn">Click</button>`>
  >().toEqualTypeOf<'button'>();

  // Multiple attributes with quotes
  expectTypeOf<
    ICUMessageTags<`<div class="container" id="main" data-test='value'>content</div>`>
  >().toEqualTypeOf<'div'>();
});
