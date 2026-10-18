# AGENTS.md

Static single-page site with no framework or build step. Netlify publishes the repo root (`netlify.toml`).

- `index.html`: markup. Video cards are `<button class="card" data-video data-title>` elements, which the user edits by hand. Keep them simple to edit.
- `style.css`: all styling and motion (animated blobs, perspective grid, conic-gradient card borders, modal transitions). Colours are in `:root`. Respects `prefers-reduced-motion`.
- `script.js`: `parseVideo()` handles Google Drive (embed via `/file/d/ID/preview`, thumbnail via `/thumbnail?id=ID`), YouTube, and direct video URLs. The script builds card contents, the scroll reveal and the modal. When the modal closes, the player is cleared so playback stops.

Conventions: minimal on-page text (the owner asked for this). The footer is exactly one line: "Made with love by Laiba Khursheed". The page has no header or nav.
