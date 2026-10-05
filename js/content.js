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
    {
      src: "assets/photos/tenerife-waves.jpg",          // large version (lightbox)
      thumb: "assets/photos/thumbs/tenerife-waves.jpg", // small version (contact sheet)
      caption: "Waves · Tenerife",
      alt: "Waves breaking between dark volcanic rocks on the coast of Tenerife, late-afternoon light",
    },
    {
      src: "assets/photos/venezia.jpg",
      thumb: "assets/photos/thumbs/venezia.jpg",
      caption: "Grand Canal at dusk · Venezia, 2021",
      alt: "A gondolier rowing along Venice's Grand Canal at dusk, palazzi and moored gondolas under a pale pink sky",
    },
    {
      src: "assets/photos/bivacco-argentino.jpg",
      thumb: "assets/photos/thumbs/bivacco-argentino.jpg",
      caption: "Bivacco Argentino, with friends · 2026",
      alt: "Four friends goofing around for the camera on a rocky mountain ridge at golden hour, jagged peaks behind them",
    },
    {
      src: "assets/photos/playa-benijo.jpg",
      thumb: "assets/photos/thumbs/playa-benijo.jpg",
      caption: "Playa de Benijo, from above · Tenerife, 2026",
      alt: "Aerial view of white surf exploding over dark rocks in a deep teal sea",
    },
    {
      src: "assets/photos/castiglione-sunset.jpg",
      thumb: "assets/photos/thumbs/castiglione-sunset.jpg",
      caption: "Sunset · Castiglione, 2026",
      alt: "The sun setting over a hilltop town and the sea, waves rolling onto the beach in orange light",
    },
    {
      src: "assets/photos/june-swim.jpg",
      thumb: "assets/photos/thumbs/june-swim.jpg",
      caption: "June, mid-swim · 2023",
      alt: "June, a curly brown Lagotto Romagnolo, swimming in a lake with a stick in her mouth",
    },
    // { src: "assets/photos/next.jpg", thumb: "assets/photos/thumbs/next.jpg", caption: "Place · year", alt: "What's in the photo" },
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
  /* Each record streams through the official SoundCloud player.
     To add one: open  https://soundcloud.com/oembed?format=json&url=YOUR_SOUNDCLOUD_LINK
     in a browser, then copy the number after "tracks%2F" into `sc` and the
     "thumbnail_url" into `cover`. (Or just send me the link.) */
  records: [
    { artist: "Collect 200", title: "Will Be Stronger", sc: "2277414140",
      cover: "https://i1.sndcdn.com/artworks-PqTG1eYcmFrC-0-t500x500.jpg", link: "https://on.soundcloud.com/InAoaYEnoZcIus5EnN" },
    { artist: "ANOTR, Kurtis Wells", title: "24 (Turn It Up) (+6)", sc: "1927512995",
      cover: "https://i1.sndcdn.com/artworks-XfTBfWmT4BHp-0-t500x500.jpg", link: "https://on.soundcloud.com/YSvobi58pAKssxPXsv" },
    { artist: "Adam Port, SG Lewis, Keinemusik", title: "Be The One", sc: "2308626197",
      cover: "https://i1.sndcdn.com/artworks-mrH4Y7IYQnW98ZIf-XUfGDQ-t500x500.jpg", link: "https://on.soundcloud.com/zQTY2x6WKL9dC1n6I4" },
    { artist: "Patrice Rushen", title: "I Was Tired of Being Alone", sc: "256108813",
      cover: "https://i1.sndcdn.com/artworks-rROTUD4ITO3z-0-t500x500.jpg", link: "https://on.soundcloud.com/yBbDwP8rMUSyAIjkkd" },
    { artist: "Martin Garrix", title: "Catharina", sc: "2282963147",
      cover: "https://i1.sndcdn.com/artworks-7nDijmM5qP3ZoC7Q-6QY4Og-t500x500.jpg", link: "https://on.soundcloud.com/pe3szI2wNrhPyA5VJg" },
    { artist: "Martin Garrix, Matisse & Sadko", title: "Mistaken", sc: "599142123",
      cover: "https://i1.sndcdn.com/artworks-000513298038-i30jzg-t500x500.jpg", link: "https://on.soundcloud.com/dk11vUoed9zW2nkyj4" },
    { artist: "Tiësto, Mesto", title: "Coming Home", sc: "421375992",
      cover: "https://i1.sndcdn.com/artworks-000326537829-kzpnq7-t500x500.jpg", link: "https://on.soundcloud.com/lk1yRqWseZ6lQsKfi5" },
    { artist: "Sonny Fodera, Gorgon City, Danny Howard", title: "Remember", sc: "1313445769",
      cover: "https://i1.sndcdn.com/artworks-9J9mjBKIFE2M-0-t500x500.jpg", link: "https://on.soundcloud.com/zw7FIuQ5TPjwh1xK2u" },
    { artist: "Philip George", title: "Wish You Were Mine", sc: "256198673",
      cover: "https://i1.sndcdn.com/artworks-NdysGJQ7jDMl-0-t500x500.jpg", link: "https://on.soundcloud.com/zYKG6V2l1dKrdadTRo" },
  ],

  /* B4 · Off-Trail — short labels shown as little trail tags. */
  trails: [
    // "Monte Summano", "Altopiano di Asiago", "Piccole Dolomiti",
  ],

  /* B5 · Hidden track */
  dog: {
    src: "assets/photos/june.jpg",   // 4:5 crop of originals/June1.jpg, rail removed
    name: "June",
    snapshot: "assets/photos/thumbs/june-swim-square.jpg",  // the little polaroid next to the main photo
    snapshotPhoto: 5,                                         // which Contact Sheet photo it opens
  },
};
