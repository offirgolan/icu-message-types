import { expectTypeOf, test } from 'vitest';
import type { ICUMessageArguments } from '../src/message-arguments';

test('{string}', () => {
  expectTypeOf<ICUMessageArguments<`hello {name}`>>().toEqualTypeOf<{
    name: string;
  }>();

  expectTypeOf<
    ICUMessageArguments<`hello {firstName} {lastName}`>
  >().toEqualTypeOf<{ firstName: string; lastName: string }>();
});

test('{number}', () => {
  expectTypeOf<
    ICUMessageArguments<`I have {num, number} cats.`>
  >().toEqualTypeOf<{ num: number }>();

  expectTypeOf<
    ICUMessageArguments<`The price of this bagel is {num, number, ::sign-always compact-short currency/GBP}`>
  >().toEqualTypeOf<{ num: number }>();

  expectTypeOf<
    ICUMessageArguments<`Almost {num, number, ::percent} of them are green.`>
  >().toEqualTypeOf<{ num: number }>();

  expectTypeOf<
    ICUMessageArguments<`The duration is {num, number, ::.##} seconds`>
  >().toEqualTypeOf<{ num: number }>();

  expectTypeOf<
    ICUMessageArguments<`The very precise number is {num, number, ::.00}`>
  >().toEqualTypeOf<{ num: number }>();
});

test('{date}', () => {
  expectTypeOf<
    ICUMessageArguments<`Sale begins {start, date, medium}`>
  >().toEqualTypeOf<{ start: Date | number }>();
});

test('{time}', () => {
  expectTypeOf<
    ICUMessageArguments<`Coupon expires at {expire, time, short}`>
  >().toEqualTypeOf<{ expire: Date | number }>();
});

test('{select}', () => {
  expectTypeOf<
    ICUMessageArguments<`{theme, select,
      light {The interface will be bright.}
      dark {The interface will be dark.}
      other {The interface will use default colors.}
    }`>
  >().toEqualTypeOf<{ theme: 'light' | 'dark' | (string & {}) }>();

  expectTypeOf<
    ICUMessageArguments<`{theme, select,
      light {The interface will be bright.}
      dark {The interface will be dark.}
    }`>
  >().toEqualTypeOf<{ theme: 'light' | 'dark' }>();

  expectTypeOf<
    ICUMessageArguments<`{isTaxed, select,
      yes {An additional {tax, number, percent} tax will be collected by {person}.}
      other {No taxes apply.}
    }`>
  >().toEqualTypeOf<{
    isTaxed: 'yes' | (string & {});
    tax: number;
    person: string;
  }>();

  // Select with only "other"
  expectTypeOf<
    ICUMessageArguments<`{choice, select, other {Only other option}}`>
  >().toEqualTypeOf<{ choice: {} & string }>();

  // Select with numeric-looking keys
  expectTypeOf<
    ICUMessageArguments<`{num, select, 123 {Numeric key} other {Other}}`>
  >().toEqualTypeOf<{ num: '123' | ({} & string) }>();

  // Select with special character keys
  expectTypeOf<
    ICUMessageArguments<`{special, select, key-with-dashes {Dashed} key_with_underscores {Underscored} other {Other}}`>
  >().toEqualTypeOf<{
    special: 'key-with-dashes' | 'key_with_underscores' | ({} & string);
  }>();
});

test('{plural}', () => {
  expectTypeOf<
    ICUMessageArguments<`{itemCount, plural,
      one {Cart: {itemCount, number} item}
      other {Cart: {itemCount, number} items}
    }`>
  >().toEqualTypeOf<{ itemCount: number }>();

  expectTypeOf<
    ICUMessageArguments<`{itemCount, plural,
      =0 {You have no items.}
      one {You have {itemCount, number} item.}
      other {You have {itemCount, number} items.}
    }`>
  >().toEqualTypeOf<{ itemCount: number }>();

  expectTypeOf<
    ICUMessageArguments<`{itemCount, plural,
      =0 {You have no items.}
      one {You have # item.}
      other {You have # items.}
    }`>
  >().toEqualTypeOf<{ itemCount: number }>();
});

test('{selectordinal}', () => {
  expectTypeOf<
    ICUMessageArguments<`It's my cat's {year, selectordinal,
      one {#st}
      two {#nd}
      few {#rd}
      other {#th}
    } birthday!`>
  >().toEqualTypeOf<{ year: number }>();
});

test('No Arguments', () => {
  expectTypeOf<ICUMessageArguments<``>>().toEqualTypeOf<never>();
  expectTypeOf<ICUMessageArguments<`hello world`>>().toEqualTypeOf<never>();
  expectTypeOf<ICUMessageArguments<`hello, world`>>().toEqualTypeOf<never>();
});

test('Malformed Inputs', () => {
  // Unclosed braces
  expectTypeOf<ICUMessageArguments<`hello {name`>>().toEqualTypeOf<never>();
  expectTypeOf<ICUMessageArguments<`hello name}`>>().toEqualTypeOf<never>();

  // Empty argument name
  expectTypeOf<ICUMessageArguments<`hello {}`>>().toEqualTypeOf<never>();
  expectTypeOf<
    ICUMessageArguments<`hello {, number}`>
  >().toEqualTypeOf<never>();

  // Invalid format syntax
  expectTypeOf<ICUMessageArguments<`hello {name,}`>>().toEqualTypeOf<never>();
  expectTypeOf<ICUMessageArguments<`hello {name, }`>>().toEqualTypeOf<never>();
});

test('Unknown Format', () => {
  expectTypeOf<
    ICUMessageArguments<`hello {firstName, foo} {middleName} {lastName, bar}`>
  >().toEqualTypeOf<{ middleName: string }>();
});

test('Rich Text Formatting', () => {
  expectTypeOf<
    ICUMessageArguments<`Our price is <boldThis>{price, number, ::currency/USD precision-integer}</boldThis>
with <link>{pct, number, ::percent} discount</link>`>
  >().toEqualTypeOf<{ price: number; pct: number }>();
});

test('Quoting / Escaping', () => {
  expectTypeOf<
    ICUMessageArguments<`This is not an interpolation: '{word}`>
  >().toEqualTypeOf<never>();

  expectTypeOf<
    ICUMessageArguments<`These are not interpolations: '{word1} {word2}'`>
  >().toEqualTypeOf<never>();

  expectTypeOf<ICUMessageArguments<`'<notATag>'`>>().toEqualTypeOf<never>();

  expectTypeOf<
    ICUMessageArguments<`'<notATag>hello</notATag>'`>
  >().toEqualTypeOf<never>();

  expectTypeOf<
    ICUMessageArguments<`This '{isn''t}' obvious.`>
  >().toEqualTypeOf<never>();

  expectTypeOf<
    ICUMessageArguments<`These are not interpolations: '{word1} {word2}', but these are {word3} {word4}`>
  >().toEqualTypeOf<{ word3: string; word4: string }>();

  // Multiple consecutive quotes
  expectTypeOf<
    ICUMessageArguments<`This ''isn''''t'' obvious with {name}.`>
  >().toEqualTypeOf<{ name: string }>();

  // Mixed quoted and unquoted content
  expectTypeOf<
    ICUMessageArguments<`Start '{not_arg}' middle {real_arg} end '{not_arg2}'`>
  >().toEqualTypeOf<{ real_arg: string }>();

  // Quotes around entire message
  expectTypeOf<
    ICUMessageArguments<`'Entire message is quoted with {arg} inside'`>
  >().toEqualTypeOf<never>();

  // Unclosed quotes
  expectTypeOf<
    ICUMessageArguments<`Unclosed quote '{arg}`>
  >().toEqualTypeOf<never>();
});

test('Nested Complex Arguments', () => {
  expectTypeOf<
    ICUMessageArguments<`{theme, select,
      dark {{num_items, select,
          one {Dark mode shows one item.}
          other {Dark mode shows # items.}
      } }
      light {{num_items, select,
          one {Light mode shows one item.}
          other {Light mode shows # items.}
      }}
      other {{num_items, select,
          one {Default mode shows one item.}
          other {Default mode shows # items.}
      }}
    }`>
  >().toEqualTypeOf<{
    theme: ({} & string) | 'dark' | 'light';
    num_items: ({} & string) | 'one';
  }>();

  expectTypeOf<
    ICUMessageArguments<`{role_of_host, select,
      organizer {
        {num_guests, plural, offset:1
          =0 {{host} does not give a party.}
          =1 {{host} invites {guest} to the party.}
          =2 {{host} invites {guest} and one other person to the party.}
          other {{host} invites {guest} and # other people to the party.}}
        }
      participant {
        {num_guests, plural, offset:1
          =0 {{host} does not give a party.}
          =1 {{host} invites {guest} to join the event.}
          =2 {{host} invites {guest} and one other person to join the event.}
          other {{host} invites {guest} and # other people to join the event.}}
        }
      other {
        {num_guests, plural, offset:1
          =0 {{host} does not give a party.}
          =1 {{host} invites {guest} to attend.}
          =2 {{host} invites {guest} and one other person to attend.}
          other {{host} invites {guest} and # other people to attend.}}
        }
  }`>
  >().toEqualTypeOf<{
    role_of_host: ({} & string) | 'organizer' | 'participant';
    num_guests: number;
    host: string;
    guest: string;
  }>();

  expectTypeOf<
    ICUMessageArguments<`{role_of_host, select,
      organizer {
        can be in the middle {num_guests, plural, offset:1
          =0 {{host} does not give a party.}
          =1 {{host} invites {guest} to the party.}
          =2 {{host} invites {guest} and one other person to the party.}
          other {{host} invites {guest} and # other people to the party.}}
        of a string,
      }
      participant {
        {num_guests, plural, offset:1
          =0 {{host} does not give a party.}
          =1 {{host} invites {guest} to join the event.}
          =2 {{host} invites {year, selectordinal,
                one {#st}
                two {#nd}
                few {#rd}
                other {#th}
              } and one other person to join the event.}
          other {{host} invites {guest} and # other people to join the event.}}}
      other {
        {num_guests, plural, offset:1
          =0 {{host} does not give a party.}
          =1 {{host} invites {guest} to attend.}
          =2 {{host} invites {guest} and one other person to attend.}
          other {{host} invites {guest} and # other people to attend.}}}
    }`>
  >().toEqualTypeOf<{
    role_of_host: ({} & string) | 'organizer' | 'participant';
    num_guests: number;
    host: string;
    guest: string;
    year: number;
  }>();
});
