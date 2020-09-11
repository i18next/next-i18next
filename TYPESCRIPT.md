# Usage with TypeScript

`next-i18next` has full support for TypeScript. Types are included with the `next-i18next` package.

## Usage with components

To type the [t function](https://www.i18next.com/overview/api), use the `TFunction` type provided by `next-i18next`:

```tsx
// this is the same TFunction from 'i18next'
import { TFunction } from 'next-i18next';

const Heading = ({ t }: { readonly t: TFunction }) => <h1>{t('heading')}</h1>;
```

## Usage with pages

Typing a [page](https://nextjs.org/docs/basic-features/pages) with the t function as the singular prop is similar to JS, but with TS instead of `prop-types`.
TypeScript validates at _compile time_ while [`prop-types`](https://github.com/facebook/prop-types) validates at _runtime_.
Although `prop-types` can do things that TS can't like value validation, TS alone will suffice in most cases.

```tsx
import { TFunction } from 'next-i18next';
import { withTranslation } from '../i18n';

const Page = ({ t }: { readonly t: TFunction }) => (
  <div>
    <h1>{t('heading')}</h1>
  </div>
);

Page.getInitialProps = async () => ({
  namespacesRequired: ['common'],
});

export default withTranslation('common')(Page);
```

## More

The complete list of exported types can be found [here](./types.d.ts).
