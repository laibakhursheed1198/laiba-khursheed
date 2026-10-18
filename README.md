# Showreel — Laiba Khursheed

A single-page video showcase with motion graphics. Videos are shown as 16:9 cards; clicking a card opens a popup player with a close button.

## Tech
Plain HTML, CSS and vanilla JavaScript. There is no build step and nothing to install. It's hosted on Netlify.

## Adding your videos
Open `index.html` and find the `<section class="grid">` block. Each card looks like this:

```html
<button class="card" data-video="PASTE_LINK_HERE" data-title="Video 01"></button>
```

- **Google Drive:** in Drive, choose Share and set access to "Anyone with the link", then copy the link and paste it as `data-video`. The page converts it to an embedded player and uses the Drive thumbnail on the card.
- **YouTube** links and direct `.mp4` links also work.
- To add more videos, copy a line. To remove one, delete the line.

## Run locally
Open `index.html` in a browser, or run `netlify dev --port 8889`.
