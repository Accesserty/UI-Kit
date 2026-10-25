# Framework integration — i18n with `<au-carousel>`

Use these examples to change carousel labels when the application changes
language. Your application supplies the translations; the component does not
translate them.

Bind `data-text-*`, `data-dot-template`, `data-live-template` and
`data-item-fallback` to your i18n library's `t()`. Bind each slide's `data-title`
too. These `data-*` attributes hold strings in both React and Vue. Dot names can
also come from slide headings, so translate those when you use them as titles.

## Choose an example

| File | Framework | What to try |
|---|---|---|
| `react.html` | React 19 | en ⇄ zh switch updates prev/next, pagination label, hint, and dot names |
| `vue.html` | Vue 3 | same, with `isCustomElement` configured |
| `nuxt-ssr-output.html` | Handwritten SSR-style HTML | Localized attributes are read when the browser defines the component |

The Vue page demonstrates direct custom-element bindings, not the kit's Vue
form wrappers. The Nuxt page does not run a Nuxt server or test hydration.
Use the setup below for the current integration modules. See
[`test/ssr/README.md`](../../test/ssr/README.md) for executable framework fixtures.
These examples are not part of the root `npm test` command and do not establish
actual screen-reader announcements.

## React

Bind translated strings to the carousel's `data-*` attributes:

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

- React 19 supports `onau-slide-change={…}`. Earlier React versions need a
  `ref` and `addEventListener('au-slide-change', …)` for this event; these
  examples do not verify those versions or the kit's integration on them.

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

Do not import the component bundle on the server: its classes extend
`HTMLElement`, which is not available in Node. Copy the whole `dist/` folder
to `vendor/accesserty/` and enable the Nuxt module:

```ts
// nuxt.config.ts — dist/ copied to vendor/accesserty/
export default defineNuxtConfig({
  modules: ['./vendor/accesserty/accesserty-ui-kit-nuxt.js'],
})
```

The module configures the Vue compiler, installs the `v-model` wrappers and
defines the custom elements in the browser. For the carousel:

1. The server renders the `<au-carousel>` host, localized attributes and slide
   content as HTML.
2. Before JavaScript runs, only the slide content is present. The carousel's
   pagination dots and previous/next buttons do not exist yet.
3. The browser defines the component. It reads the existing attributes and
   creates its controls in that language.

This client-rendered interior is specific to the carousel and other components
without server-rendered internals. The Nuxt module inserts declarative shadow
roots for accordion, tabs and breadcrumbs by default. It does not do so for
the carousel.

## Switching locale at runtime

- Change a host text attribute to update the corresponding control text.
- Changes to a slide's `data-title` or heading text update its dot name after
  a 100ms debounce. Existing slide elements keep their dot nodes and focus.
- Call `el.refresh()` when you need the component to reread the slides
  immediately. Keep the same slide elements during translation if you want
  to preserve selection identity.

## Running these examples

From the `accesserty-ui-kit/` folder:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/demo/integration/react.html
```

They load React/Vue from a CDN (esm.sh), so they need network access. The
component itself is loaded from the local `dist/` build — run `npm run build`
first if `dist/` is stale.
