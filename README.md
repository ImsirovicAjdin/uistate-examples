# @uistate/examples

Example applications and patterns for [@uistate/core](https://www.npmjs.com/package/@uistate/core).

## Structure

```
eventState/          # EventState examples
  001-counter/
  002-counter-improved/
  003-input-reactive/
  004-computed-state/
  005-conditional-rendering/
  006-list-rendering/
  007-form-validation/
  008-undo-redo/
  009-localStorage-side-effects/
  010-decoupled-components/
  011-async-patterns/
  028-counter-improved-eventTest/
  030-todo-app-with-eventTest/
  031-todo-app-with-eventTest/
  032-todo-app-with-eventTest/

cssState/            # CssState examples (coming soon)
```

## Prerequisites

This package requires [`@uistate/core`](https://www.npmjs.com/package/@uistate/core) as a **peer dependency** (v5.0.0+). Install both:

```bash
npm install @uistate/examples @uistate/core
```

## Usage

Each example is a standalone HTML file. To run them locally:

1. Install dependencies (this installs `@uistate/core` into `node_modules/`)
2. Serve the package folder with any static HTTP server, e.g.:
   ```bash
   npx serve .
   ```
3. Open any example in your browser, e.g. `eventState/001-counter/index.html`

Examples import `@uistate/core` via an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) that resolves to `node_modules/@uistate/core/`.

## License

MIT
