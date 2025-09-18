# icu-message-types

TypeScript utility types for extracting argument and tag types from ICU message strings.

[![npm version](https://badge.fury.io/js/icu-message-types.svg)](https://badge.fury.io/js/icu-message-types)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Zero runtime overhead**: Pure TypeScript types with no runtime impact
- **Comprehensive format support**: Supports all ICU message formats
- **Extract message arguments**: Extract argument types from ICU message strings
- **Extract rich text tags**: Extract tag names from ICU message strings

## Installation

```bash
npm install icu-message-types
```

> [!NOTE]
> Requires TypeScript >= 5.0

## Quick Start

```typescript
import type { ICUMessageArguments, ICUMessageTags } from 'icu-message-types';

// Extract argument types
type Args0 = ICUMessageArguments<'Hello, {firstName} {lastName}!'>;
// Result: { firstName: string | number | boolean; lastName: string | number | boolean }

type Args1 = ICUMessageArguments<`{theme, select,
  light {The interface will be bright}
  dark {The interface will be dark}
  other {The interface will use default colors}
}`>;
// Result: { theme: 'light' | 'dark' | ({} & string) | ({} & number) | boolean | null }

// Extract tag names
type Tags = ICUMessageTags<'Click <link>here</link> to continue'>;
// Result: 'link'
```

## API Reference

### `ICUMessageArguments<T>`

Extracts the argument types from an ICU message string.

#### Message Arguments

| Format          | TypeScript Type                                 | Example                                               |
| --------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `string`        | `string \| number \| boolean`                   | `{name}`                                              |
| `number`        | ``number \| `${number}`  ``                     | `{count, number, ...}`                                |
| `date`          | ``Date \| number \| `${number}`  ``             | `{date, date, short}`                                 |
| `time`          | ``Date \| number \| `${number}`  ``             | `{time, time, medium}`                                |
| `plural`        | ``number \| `${number}`  ``                     | `{count, plural, one {...} other {...}}`              |
| `selectordinal` | ``number \| `${number}`  ``                     | `{position, selectordinal, one {#st} other {#th}}`    |
| `select`        | `union \| string \| number \| boolean \| null ` | `{theme, select, light {...} dark {...} other {...}}` |

#### Additional Features

- **Enhanced Value Types**: Non-formatted arguments accept `string | number | boolean` for more flexible usage
- **String Number Support**: Numeric formats accept both `number` and template literal `\`${number}\`` types
- **Comprehensive Select Matching**: Select arguments with `other` clauses support `string`, `number`, `boolean`, and `null`
- **Literal Type Transformation**: Select keys are intelligently transformed (e.g., `'123'` becomes `'123' | 123`, `'true'` becomes `'true' | true`)
- **Escaped content**: Properly handles quoted/escaped text that shouldn't be parsed as arguments
- **Nested messages**: Supports complex nested structures
- **Whitespace handling**: Automatically strips whitespace and new lines for improved parsing

#### Basic String Arguments

```typescript
type Args = ICUMessageArguments<'Hello, {name}!'>;
// Result: { name: string | number | boolean }

type MultipleArgs = ICUMessageArguments<'Hello, {firstName} {lastName}!'>;
// Result: { firstName: string | number | boolean; lastName: string | number | boolean }
```

#### Number Arguments

```typescript
type NumberArg = ICUMessageArguments<'I have {count, number} cats'>;
// Result: { count: number | `${number}` }

type CurrencyArg =
  ICUMessageArguments<'Price: {price, number, ::currency/USD}'>;
// Result: { price: number | `${number}` }

type PercentArg =
  ICUMessageArguments<'Progress: {progress, number, ::percent}'>;
// Result: { progress: number | `${number}` }
```

#### Date and Time Arguments

```typescript
type DateArg = ICUMessageArguments<'Event date: {date, date, medium}'>;
// Result: { date: Date | number | `${number}` }

type TimeArg = ICUMessageArguments<'Meeting at {time, time, short}'>;
// Result: { time: Date | number | `${number}` }
```

#### Select Arguments

```typescript
type SelectArg = ICUMessageArguments<`{theme, select,
  light {The interface will be bright}
  dark {The interface will be dark}
  other {The interface will use default colors}
}`>;
// Result: { theme: 'light' | 'dark' | ({} & string) | ({} & number) | boolean | null }

type SelectWithoutOther = ICUMessageArguments<`{status, select,
  active {Currently active}
  inactive {Currently inactive}
}`>;
// Result: { status: 'active' | 'inactive' }
```

#### Plural Arguments

```typescript
type PluralArg = ICUMessageArguments<`{count, plural,
  =0 {No items}
  one {One item}
  other {# items}
}`>;
// Result: { count: number | `${number}` }
```

#### Selectordinal Arguments

```typescript
type OrdinalArg = ICUMessageArguments<`{position, selectordinal,
  one {#st place}
  two {#nd place}
  few {#rd place}
  other {#th place}
}`>;
// Result: { position: number | `${number}` }
```

#### Nested Arguments

```typescript
type NestedArgs = ICUMessageArguments<`{theme, select,
  dark {
    {count, plural,
      one {Dark mode shows one item}
      other {Dark mode shows # items}
    }
  }
  light {
    {count, plural,
      one {Light mode shows one item}
      other {Light mode shows # items}
    }
  }
  other {
    {count, plural,
      one {Default mode shows one item}
      other {Default mode shows # items}
    }
  }
}`>;
// Result: { theme: 'dark' | 'light' | ({} & string) | ({} & number) | boolean | null; count: number | `${number}` }
```

### `ICUMessageTags<T>`

Extracts tag names from ICU message strings that contain HTML-like markup.

```typescript
type SingleTag = ICUMessageTags<'Click <link>here</link>'>;
// Result: 'link'

type MultipleTags =
  ICUMessageTags<'Price is <bold>{price}</bold> with <link>discount</link>'>;
// Result: 'bold' | 'link'

type NestedTags = ICUMessageTags<'<wrapper><bold>text</bold></wrapper>'>;
// Result: 'wrapper' | 'bold'

type TagsWithAttributes =
  ICUMessageTags<'<a href="https://example.com">Link</a>'>;
// Result: 'a'

type NoTags = ICUMessageTags<'Plain text message'>;
// Result: never
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development

```bash
# Clone the repository
git clone https://github.com/offirgolan/icu-message-types.git
cd icu-message-types

# Install dependencies
npm install

# Run type tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
