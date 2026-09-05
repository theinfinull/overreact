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
├── babel.config.json       - Configures JSX to compile using the overreact library
├── src/
│   ├── overreact.js        - The overreact library runtime implementation
│   ├── main.jsx
│   └── components/
└── dist/                   - Babel output directory containing the transpiled JS
```

Babel dumps transpiled .jsx files from `src/` into `dist/` as .js.

## Commands

```bash
npm install
npm run build   # src/ → dist/ (once)
npm run watch   # src/ → dist/ on every save
npm run dev     # watch + serve the repo root
```
