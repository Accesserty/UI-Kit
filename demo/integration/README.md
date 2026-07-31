# Framework integration — i18n with `<au-carousel>`

The carousel's screen-reader text is driven entirely by HTML **attributes**
(`data-text-*`, `data-dot-template`, `data-live-template`, `data-item-fallback`,
plus each slide's `data-title`). To localize, bind those attributes to your i18n
library's `t()`. Because they are plain `data-*` attributes (always strings),
React and Vue write them without any prop/attribute ambiguity.

These example pages were verified live in a browser (toggle the locale — every
screen-reader string updates, including dot names sourced from slide titles).

| File | Framework | Verified |
|---|---|---|
| `react.html` | React 19 | en ⇄ zh switch updates prev/next, pagination label, hint, and dot names |
| `vue.html` | Vue 3 | same, with `isCustomElement` configured |
| `nuxt-ssr-output.html` | Nuxt (SSR) | server-rendered zh attributes consumed on client upgrade |

## React

`data-*` attributes are written as HTML attributes, so binding just works:

```jsx
<au-carousel
  data-text-prev={t('carousel.prev')}
  data-text-next={t('carousel.next')}
  data-text-pagination={t('carousel.pagination')}
  data-text-instructions={t('carousel.instructions')}
  data-dot-template={t('carousel.dotTemplate')}   /* e.g. "{title}, {current} of {total}" */
>
  {slides.map((s, i) => (
    <div key={i} data-title={t(s.titleKey)}>…</div>
  ))}
</au-carousel>
```

- Events: React 19 supports `onslide-change={…}`. On React 18, attach with a
  `ref` + `addEventListener('slide-change', …)`.

## Vue 3

Tell Vue that `<au-*>` are native custom elements (otherwise it warns and tries
to resolve them as Vue components):

```js
// main.ts
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('au-');
```

```vue
<au-carousel
  :data-text-prev="t('carousel.prev')"
  :data-dot-template="t('carousel.dotTemplate')"
  @slide-change="e => onChange(e.detail)"
>
  <div v-for="(s, i) in slides" :key="i" :data-title="t(s.titleKey)">…</div>
</au-carousel>
```

## Nuxt (SSR) — important

The kit's components `extend HTMLElement`, which **does not exist in Node**, so the
bundle **cannot be imported in server code** — doing so throws
`ReferenceError: HTMLElement is not defined`. (The SSR guard on
`customElements.define()` only prevents re-registration; it does not make the
module server-importable.) This is normal for web components. Register them
**client-only**:

```ts
// plugins/accesserty.client.ts   ← the .client suffix keeps it off the server
export default defineNuxtPlugin(async () => {
  await import('accesserty-ui-kit/min');
});
```

```js
// nuxt.config.ts
export default defineNuxtConfig({
  vue: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('au-') } },
});
```

What happens at runtime:

- The server renders the `<au-carousel data-text-prev="上一張" …>` tag **and the
  slide content** (they are ordinary template output) into the HTML. So the
  localized values and your slides are in the SSR payload and are SEO-visible.
- The pagination dots / prev-next buttons live in the component's shadow DOM and
  appear only after the client upgrades the element. Until the JS loads there is
  a brief moment showing just the slides — inherent to any web component + SSR.
- On upgrade, the component reads the already-present localized attributes, so
  the controls come up in the correct language (verified in
  `nuxt-ssr-output.html`).

## Switching locale at runtime

- Changing a **host** i18n attribute (`data-text-*`, `data-dot-template`, …) is
  observed and refreshes automatically.
- Changing only a **slide's `data-title` or heading text** is also picked up: the
  component watches its light-DOM children with a `MutationObserver` and rebuilds
  the dots. If you ever mutate titles in a way the observer can't see, call the
  public **`el.refresh()`** method to force a re-read.

## Running these examples

From the `accesserty-ui-kit/` folder:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/demo/integration/react.html
```

They load React/Vue from a CDN (esm.sh), so they need network access. The
component itself is loaded from the local `dist/` build — run `npm run build`
first if `dist/` is stale.
