/* ==========================================================================
   SIDE B CONTENT — edit this file to fill in photos, music, trails and dog.
   Everything here is optional: empty lists show tidy placeholders.
   Paths are relative to index.html (e.g. "assets/photos/01.jpg").
   ========================================================================== */

window.SITE = {

  /* B1 · Contact Sheet
     Put your images in assets/photos/ (JPG/WebP, ~2000px on the long side,
     ideally < 500 KB each) and list them here in the order you want. */
  photos: [
    // { src: "assets/photos/01.jpg", caption: "Monte Summano at sunrise · 2025" },
    // { src: "assets/photos/02.jpg", caption: "Soundcheck · 2024" },
  ],
  photoPlaceholders: 9, // how many empty frames to show while `photos` is empty

  /* B2 · Seven-Piece (Reunion Tour)
     video: a YouTube embed URL (https://www.youtube-nocookie.com/embed/VIDEO_ID)
            or a local file (assets/music/live.mp4). Leave "" for none. */
  band: {
    name: "Pink'n",
    meta: "Seven-piece band · reunions only",   // e.g. add genre or "since 20xx"
    video: "",
    links: [
      // { label: "Instagram", url: "https://instagram.com/..." },
      // { label: "Spotify",   url: "https://open.spotify.com/artist/..." },
    ],
  },

  /* B3 · On Repeat
     cover: put square images in assets/music/ (600×600 is plenty).
     url:   Spotify / Apple Music / Bandcamp link (optional). */
  albums: [
    // { artist: "Artist", album: "Album", cover: "assets/music/album1.jpg", url: "https://open.spotify.com/album/..." },
  ],
  albumPlaceholders: 6,

  /* B4 · Off-Trail — short labels shown as little trail tags. */
  trails: [
    // "Monte Summano", "Altopiano di Asiago", "Piccole Dolomiti",
  ],

  /* B5 · Hidden track */
  dog: {
    src: "",   // e.g. "assets/photos/lagotto.jpg"
    name: "June",
  },
};
