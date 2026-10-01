# Stefano Zanon — "The Record"

My personal portfolio, built as an LP with two sides: Side A is the work, Side B is the life around it.
Plain HTML, CSS and vanilla JavaScript. No build step and no dependencies apart from Google Fonts.

## Structure

```
index.html            all the text content (Side A tracks, credits, booking)
css/style.css         styles (Side A / Side B palettes at the top, as CSS variables)
js/content.js         ← Side B content: photos, band, albums, trails, dog
js/demo.js            the diversity-maximization demo (track A1)
js/main.js            player bar, progress line, flip, lightbox, run-out
assets/               CV (press kit), favicon, photos/, music/
.nojekyll             tells GitHub Pages to serve files as-is
```

## Publish on GitHub Pages

1. Create a repository called **`StefiSte.github.io`** on GitHub.
2. Upload everything in this folder to the root of that repository, including `.nojekyll`.
   ```bash
   git init
   git add .
   git commit -m "First pressing"
   git branch -M main
   git remote add origin https://github.com/StefiSte/StefiSte.github.io.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
4. After a minute the site is live at **https://stefiste.github.io**.

To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000.

## Common edits

| What | Where |
|---|---|
| Add photos | Put JPG/WebP files (about 2000px on the long side, under 500 KB) in `assets/photos/`, then list them in `photos` inside `js/content.js` |
| Band name, links, live video | `band` in `js/content.js` |
| Albums for "On Repeat" | Put square covers in `assets/music/`, then fill `albums` in `js/content.js` |
| Trails | `trails` in `js/content.js` |
| Lagotto photo and name | `dog` in `js/content.js` |
| Replace the CV | Overwrite `assets/Stefano_Zanon_CV.pdf` (keep the same name) |
| Add or edit a track | Copy a `<section class="track">` block in `index.html`. Also add it to the tracklist at the top. The player picks it up automatically from `data-track` and `data-title`. |
| arXiv link (A1) | Edit the "Status" fact in track A1 |

## Notes

- Animations respect the system "reduce motion" setting.
- All text is in the HTML, so the site is readable and indexable even without JavaScript.
- The QR code on the Arboris card is decorative.
