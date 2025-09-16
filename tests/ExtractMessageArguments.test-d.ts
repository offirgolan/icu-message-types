import { expectTypeOf, test } from 'vitest';
import type { ExtractMessageArguments } from '../src';

test('no arguments', () => {
  expectTypeOf<ExtractMessageArguments<`hello world`>>().toEqualTypeOf<{}>();
  expectTypeOf<ExtractMessageArguments<`hello, world`>>().toEqualTypeOf<{}>();
});

test('string', () => {
  expectTypeOf<ExtractMessageArguments<`hello {name}`>>().toEqualTypeOf<{
    name: string;
  }>();

  expectTypeOf<
    ExtractMessageArguments<`hello {firstName} {lastName}`>
  >().toEqualTypeOf<{ firstName: string; lastName: string }>();
});

test('{number}', () => {
  expectTypeOf<
    ExtractMessageArguments<`I have {num, number} cats.`>
  >().toEqualTypeOf<{ num: number }>();

  expectTypeOf<
    ExtractMessageArguments<`The price of this bagel is {num, number, ::sign-always compact-short currency/GBP}`>
  >().toEqualTypeOf<{ num: number }>();

  expectTypeOf<
    ExtractMessageArguments<`Almost {num, number, ::percent} of them are black.`>
  >().toEqualTypeOf<{ num: number }>();

  expectTypeOf<
    ExtractMessageArguments<`The duration is {num, number, ::.##} seconds`>
  >().toEqualTypeOf<{ num: number }>();

  expectTypeOf<
    ExtractMessageArguments<`The very precise number is {num, number, ::.00}`>
  >().toEqualTypeOf<{ num: number }>();
});

test('{date}', () => {
  expectTypeOf<
    ExtractMessageArguments<`Sale begins {start, date, medium}`>
  >().toEqualTypeOf<{ start: Date | number }>();
});

test('{time}', () => {
  expectTypeOf<
    ExtractMessageArguments<`Coupon expires at {expire, time, short}`>
  >().toEqualTypeOf<{ expire: Date | number }>();
});

test('{select}', () => {
  expectTypeOf<
    ExtractMessageArguments<`{gender, select,
      male {He will respond shortly.}
      female {She will respond shortly.}
      other {They will respond shortly.}
    }`>
  >().toEqualTypeOf<{ gender: 'male' | 'female' | (string & {}) }>();

  expectTypeOf<
    ExtractMessageArguments<`{gender, select,
      male {He will respond shortly.}
      female {She will respond shortly.}
    }`>
  >().toEqualTypeOf<{ gender: 'male' | 'female' }>();

  expectTypeOf<
    ExtractMessageArguments<`{isTaxed, select,
      yes {An additional {tax, number, percent} tax will be collected.}
      other {No taxes apply.}
    }`>
  >().toEqualTypeOf<{ isTaxed: 'yes' | (string & {}); tax: number }>();
});

test('{plural}', () => {
  expectTypeOf<
    ExtractMessageArguments<`{itemCount, plural,
      one {Cart: {itemCount, number} item}
      other {Cart: {itemCount, number} items}
    }`>
  >().toEqualTypeOf<{ itemCount: number }>();

  expectTypeOf<
    ExtractMessageArguments<`{itemCount, plural,
      =0 {You have no items.}
      one {You have {itemCount, number} item.}
      other {You have {itemCount, number} items.}
    }`>
  >().toEqualTypeOf<{ itemCount: number }>();

  expectTypeOf<
    ExtractMessageArguments<`{itemCount, plural,
      =0 {You have no items.}
      one {You have # item.}
      other {You have # items.}
    }`>
  >().toEqualTypeOf<{ itemCount: number }>();
});

test('{selectordinal}', () => {
  expectTypeOf<
    ExtractMessageArguments<`It's my cat's {year, selectordinal,
      one {#st}
      two {#nd}
      few {#rd}
      other {#th}
    } birthday!`>
  >().toEqualTypeOf<{ year: number }>();
});

test('Rich Text Formatting', () => {
  expectTypeOf<
    ExtractMessageArguments<`Our price is <boldThis>{price, number, ::currency/USD precision-integer}</boldThis>
with <link>{pct, number, ::percent} discount</link>`>
  >().toEqualTypeOf<{ price: number; pct: number }>();
});

test('Quoting / Escaping', () => {
  expectTypeOf<
    ExtractMessageArguments<`This is not an interpolation: '{word}`>
  >().toEqualTypeOf<{}>();

  expectTypeOf<
    ExtractMessageArguments<`These are not interpolations: '{word1} {word2}'`>
  >().toEqualTypeOf<{}>();

  expectTypeOf<ExtractMessageArguments<`'<notATag>'`>>().toEqualTypeOf<{}>();

  expectTypeOf<
    ExtractMessageArguments<`'<notATag>hello</notATag>'`>
  >().toEqualTypeOf<{}>();

  expectTypeOf<
    ExtractMessageArguments<`This '{isn''t}' obvious.`>
  >().toEqualTypeOf<{}>();

  expectTypeOf<
    ExtractMessageArguments<`These are not interpolations: '{word1} {word2}', but these are {word3} {word4}`>
  >().toEqualTypeOf<{ word3: string; word4: string }>();
});

test('Nested Complex Arguments', () => {
  expectTypeOf<
    ExtractMessageArguments<`{gender, select,
      female {{num_items, select,
          one {She has one item.}
          other {She has # items.}
      } }
      male {{num_items, select,
          one {He has one item.}
          other {He has # items.}
      }}
      other {{num_items, select,
          one {They have one item.}
          other {They have # items.}
      }}
    }`>
  >().toEqualTypeOf<{
    gender: ({} & string) | 'female' | 'male';
    num_items: ({} & string) | 'one';
  }>();

  expectTypeOf<
    ExtractMessageArguments<`{gender_of_host, select,
      female {
        {num_guests, plural, offset:1
          =0 {{host} does not give a party.}
          =1 {{host} invites {guest} to her party.}
          =2 {{host} invites {guest} and one other person to her party.}
          other {{host} invites {guest} and # other people to her party.}}}
      male {
        {num_guests, plural, offset:1
          =0 {{host} does not give a party.}
          =1 {{host} invites {guest} to his party.}
          =2 {{host} invites {guest} and one other person to his party.}
          other {{host} invites {guest} and # other people to his party.}}}
      other {
        {num_guests, plural, offset:1
          =0 {{host} does not give a party.}
          =1 {{host} invites {guest} to their party.}
          =2 {{host} invites {guest} and one other person to their party.}
          other {{host} invites {guest} and # other people to their party.}}}
    }`>
  >().toEqualTypeOf<{
    gender_of_host: ({} & string) | 'female' | 'male';
    num_guests: number;
    host: string;
  }>();
});
