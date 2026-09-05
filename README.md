<p align="center">
  <img src="public/favicon-512.png" alt="Overreact logo" width="160" />
</p>

# Overreact

DIY React built from Rodrigo Pombo's legendary guide - [Build your own React](https://pomb.us/build-your-own-react/).

## Requirements

- node + npm (to run babel)
- static file server of some kind (`npm run dev` will do)
- any browser with `requestIdleCallback` support (which means anything but Safari)

## Layout

```text
overreact/
├── index.html
├── babel.config.json
├── src/
│   ├── main.jsx                 - demo entry (call useOverReact once)
│   ├── components/
│   └── overreact/               - the library
│       ├── index.js             - public API + useOverReact()
│       ├── core.js              - elements, fibers, reconcile, commit
│       └── hooks.js             - useState
└── dist/                        - Babel output (browser loads this)
```

Babel dumps transpiled files from `src/` into `dist/`. Call `useOverReact()` in the entry file before any JSX that expects the `overreact` global.

## Commands

```bash
npm install
npm run build   # src/ → dist/ (once)
npm run watch   # src/ → dist/ on every save
npm run dev     # watch + serve the repo root
```
