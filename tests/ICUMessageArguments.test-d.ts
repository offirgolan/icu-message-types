import { expectTypeOf, test } from 'vitest';
import type { ICUMessageArguments } from '../src/message-arguments';

type Other = ({} & string) | ({} & number) | boolean | undefined | null;

test('{string}', () => {
  expectTypeOf<ICUMessageArguments<`hello {name}`>>().toEqualTypeOf<{
    name: string | number | boolean;
  }>();

  expectTypeOf<
    ICUMessageArguments<`hello {firstName} {lastName}`>
  >().toEqualTypeOf<{
    firstName: string | number | boolean;
    lastName: string | number | boolean;
  }>();
});

test('{number}', () => {
  expectTypeOf<
    ICUMessageArguments<`I have {num, number} cats.`>
  >().toEqualTypeOf<{ num: number | `${number}` }>();

  expectTypeOf<
    ICUMessageArguments<`The price of this bagel is {num, number, ::sign-always compact-short currency/GBP}`>
  >().toEqualTypeOf<{ num: number | `${number}` }>();

  expectTypeOf<
    ICUMessageArguments<`Almost {num, number, ::percent} of them are green.`>
  >().toEqualTypeOf<{ num: number | `${number}` }>();

  expectTypeOf<
    ICUMessageArguments<`The duration is {num, number, ::.##} seconds`>
  >().toEqualTypeOf<{ num: number | `${number}` }>();

  expectTypeOf<
    ICUMessageArguments<`The very precise number is {num, number, ::.00}`>
  >().toEqualTypeOf<{ num: number | `${number}` }>();
});

test('{date}', () => {
  expectTypeOf<
    ICUMessageArguments<`Sale begins {start, date, medium}`>
  >().toEqualTypeOf<{ start: Date | number | `${number}` }>();
});

test('{time}', () => {
  expectTypeOf<
    ICUMessageArguments<`Coupon expires at {expire, time, short}`>
  >().toEqualTypeOf<{ expire: Date | number | `${number}` }>();
});

test('{select}', () => {
  expectTypeOf<
    ICUMessageArguments<`{theme, select,
      light {The interface will be bright.}
      dark {The interface will be dark.}
      other {The interface will use default colors.}
    }`>
  >().toEqualTypeOf<{
    theme: 'light' | 'dark' | Other;
  }>();

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
    isTaxed: 'yes' | ({} & string) | ({} & number) | boolean | undefined | null;
    tax: number | `${number}`;
    person: string | number | boolean;
  }>();

  // Select with only "other"
  expectTypeOf<
    ICUMessageArguments<`{choice, select, other {Only other option}}`>
  >().toEqualTypeOf<{
    choice: ({} & string) | ({} & number) | boolean | undefined | null;
  }>();

  // Select with numeric-looking keys
  expectTypeOf<
    ICUMessageArguments<`{num, select, 123 {Numeric key} other {Other}}`>
  >().toEqualTypeOf<{
    num: '123' | 123 | Other;
  }>();

  // Select with special character keys
  expectTypeOf<
    ICUMessageArguments<`{special, select, key-with-dashes {Dashed} key_with_underscores {Underscored} other {Other}}`>
  >().toEqualTypeOf<{
    special: 'key-with-dashes' | 'key_with_underscores' | Other;
  }>();
});

test('{plural}', () => {
  expectTypeOf<
    ICUMessageArguments<`{itemCount, plural,
      one {Cart: {itemCount, number} item}
      other {Cart: {itemCount, number} items}
    }`>
  >().toEqualTypeOf<{ itemCount: number | `${number}` }>();

  expectTypeOf<
    ICUMessageArguments<`{itemCount, plural,
      =0 {You have no items.}
      one {You have {itemCount, number} item.}
      other {You have {itemCount, number} items.}
    }`>
  >().toEqualTypeOf<{ itemCount: number | `${number}` }>();

  expectTypeOf<
    ICUMessageArguments<`{itemCount, plural,
      =0 {You have no items.}
      one {You have # item.}
      other {You have # items.}
    }`>
  >().toEqualTypeOf<{ itemCount: number | `${number}` }>();
});

test('{selectordinal}', () => {
  expectTypeOf<
    ICUMessageArguments<`It's my cat's {year, selectordinal,
      one {#st}
      two {#nd}
      few {#rd}
      other {#th}
    } birthday!`>
  >().toEqualTypeOf<{ year: number | `${number}` }>();
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
  >().toEqualTypeOf<{ middleName: string | number | boolean }>();
});

test('Rich Text Formatting', () => {
  expectTypeOf<
    ICUMessageArguments<`Our price is <boldThis>{price, number, ::currency/USD precision-integer}</boldThis>
with <link>{pct, number, ::percent} discount</link>`>
  >().toEqualTypeOf<{
    price: number | `${number}`;
    pct: number | `${number}`;
  }>();
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
  >().toEqualTypeOf<{
    word3: string | number | boolean;
    word4: string | number | boolean;
  }>();

  // Multiple consecutive quotes
  expectTypeOf<
    ICUMessageArguments<`This ''isn''''t'' obvious with {name}.`>
  >().toEqualTypeOf<{ name: string | number | boolean }>();

  // Mixed quoted and unquoted content
  expectTypeOf<
    ICUMessageArguments<`Start '{not_arg}' middle {real_arg} end '{not_arg2}'`>
  >().toEqualTypeOf<{ real_arg: string | number | boolean }>();

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
    theme: Other | 'dark' | 'light';
    num_items: Other | 'one';
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
    role_of_host: Other | 'organizer' | 'participant';
    num_guests: number | `${number}`;
    host: string | number | boolean;
    guest: string | number | boolean;
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
    role_of_host: Other | 'organizer' | 'participant';
    num_guests: number | `${number}`;
    host: string | number | boolean;
    guest: string | number | boolean;
    year: number | `${number}`;
  }>();
});

test('Enhanced Select Transformations', () => {
  // Test boolean literal transformations
  expectTypeOf<
    ICUMessageArguments<`{isActive, select, true {Active} false {Inactive} other {Unknown}}`>
  >().toEqualTypeOf<{
    isActive: 'true' | true | 'false' | false | Other;
  }>();

  // Test number literal transformations
  expectTypeOf<
    ICUMessageArguments<`{status, select, 0 {Zero} 1 {One} 42 {Forty-two} other {Other number}}`>
  >().toEqualTypeOf<{
    status: '0' | 0 | '1' | 1 | '42' | 42 | Other;
  }>();

  // Test decimal number transformations
  expectTypeOf<
    ICUMessageArguments<`{score, select, 3.14 {Pi} 2.71 {E} other {Other}}`>
  >().toEqualTypeOf<{
    score: '3.14' | 3.14 | '2.71' | 2.71 | Other;
  }>();

  // Test negative number transformations
  expectTypeOf<
    ICUMessageArguments<`{temp, select, -10 {Cold} 0 {Freezing} other {Other}}`>
  >().toEqualTypeOf<{
    temp: '-10' | -10 | '0' | 0 | Other;
  }>();

  // Test mixed literal types without 'other'
  expectTypeOf<
    ICUMessageArguments<`{mixed, select, true {Boolean} 123 {Number} regular {String}}`>
  >().toEqualTypeOf<{
    mixed: 'true' | true | '123' | 123 | 'regular';
  }>();

  // Test select with only boolean literals
  expectTypeOf<
    ICUMessageArguments<`{toggle, select, true {On} false {Off}}`>
  >().toEqualTypeOf<{
    toggle: 'true' | true | 'false' | false;
  }>();

  // Test select with comprehensive type coverage
  expectTypeOf<
    ICUMessageArguments<`{value, select,
      true {Boolean true}
      false {Boolean false}
      0 {Number zero}
      1 {Number one}
      -5 {Negative number}
      3.14 {Decimal}
      someString {Regular string}
      other {Fallback for any other value}
    }`>
  >().toEqualTypeOf<{
    value:
      | 'true'
      | true
      | 'false'
      | false
      | '0'
      | 0
      | '1'
      | 1
      | '-5'
      | -5
      | '3.14'
      | 3.14
      | 'someString'
      | Other;
  }>();

  // Test select without 'other' but with mixed types
  expectTypeOf<
    ICUMessageArguments<`{status, select,
      true {Success}
      false {Failure}
      1 {Pending}
      0 {Inactive}
      loading {Loading}
    }`>
  >().toEqualTypeOf<{
    status: 'true' | true | 'false' | false | '1' | 1 | '0' | 0 | 'loading';
  }>();

  // Test nested select with literal transformations
  expectTypeOf<
    ICUMessageArguments<`{outer, select,
      true {Inner: {inner, select, 1 {One} 2 {Two} other {Other}}}
      false {Inner: {inner, select, on {On} off {Off}}}
      other {No inner}
    }`>
  >().toEqualTypeOf<{
    outer: 'true' | true | 'false' | false | Other;
    inner: '1' | 1 | '2' | 2 | 'on' | 'off' | Other;
  }>();
});
