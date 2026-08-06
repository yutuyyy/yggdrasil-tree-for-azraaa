import { defineConfig } from 'vite'

// Single-page site. index.html at the root is the entry; birthday.css and
// birthday.js sit beside it, and everything under public/ (favicon, grain
// texture) is served from the web root as-is.
//
// `base` is the repo name because this ships to GitHub Pages as a *project*
// site at https://hasib41.github.io/happy-birthday-tree/. Every built asset
// (the hashed JS/CSS bundles, the favicon, the grain texture) is emitted with
// this prefix so it resolves under the sub-path instead of the domain root.
// Deploy is `npm run build` → dist/, served by the Pages Actions workflow in
// .github/workflows/deploy.yml — never the raw source, or the browser hits the
// un-bundled `import 'gsap'` and the film never runs.
export default defineConfig({
  base: '/happy-birthday-tree/',
})
