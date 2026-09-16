# Angular CLI AOT consumer check

This isolated Angular CLI application checks AOT template compilation with
`CUSTOM_ELEMENTS_SCHEMA`, router navigation, and consumer-owned
`ControlValueAccessor` directives for `au-input` and `au-checkbox`.

Run it with a Node version supported by the installed Angular CLI:

```sh
npm install
npm run build
```

`tsc --noEmit -p tsconfig.json` and the Angular CLI production build pass in
the current environment. Run `node runtime.mjs` after the build to exercise
the production bundle in Chrome. The existing `test/ssr` Angular fixture is a
separate JIT hydration check and does not establish this AOT or forms-adapter
contract. The consumer fixture handles native form reset by preventing the
browser reset algorithm and resetting the Angular `FormControl`s through the
consumer-owned value accessors; this preserves the Angular model as the reset
source instead of relying on a custom element's pre-accessor baseline.
