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

The Vue and Nuxt pages predate the kit's Vue integration; the setup sections
below describe the current way.
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

- Events: React 19 supports `onau-slide-change={…}`. On React 18, attach with a
  `ref` + `addEventListener('au-slide-change', …)`.

## Vue 3

Set up the kit as the README's Vue 3 section describes: the kit's
`isCustomElement` in your build config and `app.use(AccessertyVue)`. Use the
kit's `isCustomElement` rather than `tag => tag.startsWith('au-')`: the form
components are Vue components, so that `v-model` works on them.

```vue
<au-carousel
  :data-text-prev="t('carousel.prev')"
  :data-dot-template="t('carousel.dotTemplate')"
  @au-slide-change="e => onChange(e.detail)"
>
  <div v-for="(s, i) in slides" :key="i" :data-title="t(s.titleKey)">…</div>
</au-carousel>
```

## Nuxt (SSR)

The kit's components `extend HTMLElement`, which does not exist in Node, so the
component bundle cannot run on the server. The kit's Nuxt module handles that:
it defines the elements in the browser only, registers the `v-model`
components, and configures the Vue compiler.

```ts
// nuxt.config.ts — dist/ copied to vendor/accesserty/
export default defineNuxtConfig({
  modules: ['./vendor/accesserty/accesserty-ui-kit-nuxt.js'],
})
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
