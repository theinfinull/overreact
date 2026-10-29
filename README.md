<p align="center">
  <img src="public/icons/icon-512.png" alt="Overreact logo" width="160" />
</p>

# Overreact

A lightweight implementation of React's core. Got tired of 'React will handle this', so I went and built my own version to see what's really going on under the hood.

Small enough to read in an afternoon, real enough to actually work.

## Requirements

- node + npm
- a modern browser (a short timer fallback is used when `requestIdleCallback` is unavailable)

## Layout

```text
overreact/
├── index.html                  - Vite entry, loads src/main.jsx
├── vite.config.js
├── src/
│   ├── main.jsx                - demo entry
│   ├── components/
│   └── overreact/              - the overreact library
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

## Chapter examples

Each chapter ends with a ZIP download of its complete source. Drop the ZIPs into `public/examples/`
and point the chapter's `ChapterSource` `zipHref` at them.

To run a downloaded project, unzip it, run `npm install`, then `npm run dev`
(`npm start` also works).

## Acknowledgements

❤️ Special thanks to [Didact](https://github.com/hexacta/didact) by [@pomper](https://x.com/pomber). This project is an extension of the excellent foundation provided by the course.
