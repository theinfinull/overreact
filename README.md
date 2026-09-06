<p align="center">
  <img src="public/favicon-512.png" alt="Overreact logo" width="160" />
</p>

# Overreact

DIY React built from Rodrigo Pombo's legendary guide - [Build your own React](https://pomb.us/build-your-own-react/).

## Requirements

- node + npm
- any browser with `requestIdleCallback` support (which means anything but Safari)

## Layout

```text
overreact/
├── index.html                  - Vite entry, loads src/main.jsx
├── vite.config.js
├── src/
│   ├── main.jsx                - demo entry
│   ├── components/
│   └── overreact/              - the library
│       ├── index.js            - public API
│       ├── element.js          - createElement + children normalisation
│       ├── reconcile.js        - child diffing, keys, effect tags
│       ├── renderer.js         - fiber work loop + commit
│       ├── dom.js              - dom node creation and prop updates
│       └── hooks.js            - useState, useEffect
```

Vite compiles JSX to `createElement(...)` and auto-imports it into every `.jsx`
file, so components only import the hooks they use. See `vite.config.js`.

## Commands

```bash
npm install
npm run dev       # dev server with hot reload
npm run build     # production bundle into dist/
npm run preview   # serve the production bundle
npm run lint      # oxlint
```
