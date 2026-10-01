/* ==========================================================================
   Stefano Zanon — "The Record" · interactions
   ========================================================================== */

(function () {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SITE = window.SITE || {};
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------------------------------------------
     1. Side B content from js/content.js
     ------------------------------------------------------------------ */
  const photos = (SITE.photos || []).filter(p => p && p.src);

  function renderSheet() {
    const sheet = $('#contactSheet');
    if (!sheet) return;
    if (photos.length) {
      sheet.innerHTML = photos.map((p, i) => `
        <button class="frame" type="button" data-photo="${i}" aria-label="Open photo ${i + 1}${p.caption ? ': ' + esc(p.caption) : ''}">
          <img src="${esc(p.src)}" alt="${esc(p.caption || '')}" loading="lazy" decoding="async">
          <span class="frame__no">${String(i + 12).padStart(2, '0')}A ▸</span>
        </button>`).join('');
    } else {
      const tones = [['#6b4a3a', '#d9a273'], ['#2f3d33', '#8fa58a'], ['#3a3f5a', '#c48b6c'], ['#5e5248', '#e6d2b0'], ['#25303b', '#7f98a8'], ['#4d2c25', '#e28a5a']];
      const n = SITE.photoPlaceholders || 9;
      sheet.innerHTML = Array.from({ length: n }, (_, i) => {
        const [a, b] = tones[i % tones.length];
        return `<div class="frame frame--empty" style="background:linear-gradient(${30 + i * 37}deg,${a},${b})">
          <span class="frame__hint">assets/photos/${String(i + 1).padStart(2, '0')}.jpg</span>
          <span class="frame__no">${String(i + 12).padStart(2, '0')}A ▸</span></div>`;
      }).join('');
    }
  }

  function renderBand() {
    const el = $('#band');
    if (!el) return;
    const b = SITE.band || {};
    let media = '';
    if (b.video) {
      media = /\.(mp4|webm)$/i.test(b.video)
        ? `<div class="band__media"><video src="${esc(b.video)}" controls preload="none" playsinline></video></div>`
        : `<div class="band__media"><iframe src="${esc(b.video)}" title="${esc(b.name || 'Band')} live" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    const links = (b.links || []).filter(l => l && l.url)
      .map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a></li>`).join('');
    el.innerHTML = `
      ${media}
      <p class="band__name">${esc(b.name || 'Band name, coming soon')}</p>
      <p class="band__meta mono">${esc(b.meta || 'Seven-piece · live · Vicenza')}</p>
      ${links ? `<ul class="pills">${links}</ul>` : ''}`;
  }

  function renderCrate() {
    const el = $('#crate');
    if (!el) return;
    const albums = (SITE.albums || []).filter(a => a && (a.artist || a.album));
    const grads = ['linear-gradient(135deg,#c2502e,#3b1f1a)', 'linear-gradient(160deg,#e8c27a,#5a6b4a)', 'linear-gradient(120deg,#2d3a5c,#d48a6a)', 'linear-gradient(200deg,#7b2d26,#e3b04b)', 'linear-gradient(45deg,#1f3b3a,#9fc0a8)', 'linear-gradient(90deg,#3b2b4a,#c97b63)'];
    const list = albums.length ? albums : Array.from({ length: SITE.albumPlaceholders || 6 }, () => ({ artist: 'Artist', album: 'Album title' }));
    el.innerHTML = list.map((a, i) => {
      const cover = a.cover ? `<img src="${esc(a.cover)}" alt="" loading="lazy" decoding="async">` : '';
      const inner = `<span class="album__art"><span class="album__disc"></span><span class="album__cover" style="${a.cover ? '' : 'background:' + grads[i % grads.length]}">${cover}</span></span>
        <span class="album__artist">${esc(a.artist)}</span><span class="album__title">${esc(a.album)}</span>`;
      return `<li>${a.url
        ? `<a class="album" href="${esc(a.url)}" target="_blank" rel="noopener" aria-label="${esc(a.artist)} — ${esc(a.album)}">${inner}</a>`
        : `<div class="album" tabindex="-1">${inner}</div>`}</li>`;
    }).join('');
  }

  function renderTrails() {
    const el = $('#trails');
    if (!el) return;
    el.innerHTML = (SITE.trails || []).map(t => `<span>▲ ${esc(t)}</span>`).join('');
  }

  function renderDog() {
    const el = $('#dog');
    if (!el) return;
    const d = SITE.dog || {};
    el.innerHTML = d.src
      ? `<img src="${esc(d.src)}" alt="${esc(d.name ? d.name + ', my Lagotto Romagnolo' : 'My Lagotto Romagnolo')}" loading="lazy">`
      : `<span class="frame__hint">Photo of the Lagotto<br>coming soon</span>`;
    if (d.name) $('#b5-t').textContent = d.name;
  }

  renderSheet(); renderBand(); renderCrate(); renderTrails(); renderDog();

  /* ------------------------------------------------------------------
     2. Arboris QR (decorative)
     ------------------------------------------------------------------ */
  (function qr() {
    const el = $('#arborisQR');
    if (!el) return;
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const finder = (r, c) => {
      const f = (r0, c0) => r >= r0 && r < r0 + 3 && c >= c0 && c < c0 + 3;
      return f(0, 0) || f(0, 8) || f(8, 0);
    };
    const frag = document.createDocumentFragment();
    for (let r = 0; r < 11; r++) for (let c = 0; c < 11; c++) {
      const i = document.createElement('i');
      const gap = (r === 3 && c < 4) || (c === 3 && r < 4) || (r === 3 && c > 6) || (c === 7 && r < 4) || (r === 7 && c < 4) || (c === 3 && r > 6);
      if (!finder(r, c) && (gap || rnd() > .5)) i.className = 'o';
      frag.appendChild(i);
    }
    el.appendChild(frag);
  })();

  /* ------------------------------------------------------------------
     3. Topographic lines for Off-Trail
     ------------------------------------------------------------------ */
  function drawTopo() {
    const svg = $('#topo');
    if (!svg) return;
    const w = svg.clientWidth, h = svg.clientHeight;
    if (!w || !h) return;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const peaks = [[w * .86, h * .22, 11], [w * .62, h * .95, 9], [w * .08, h * .7, 7]];
    let out = '';
    peaks.forEach(([cx, cy, n], pi) => {
      for (let r = 1; r <= n; r++) {
        const base = r * 30, p1 = pi * 1.7 + r * .3, p2 = pi * 2.3 - r * .2;
        let d = '';
        for (let i = 0; i <= 96; i++) {
          const t = i / 96 * Math.PI * 2;
          const rr = base * (1 + .14 * Math.sin(3 * t + p1) + .08 * Math.sin(5 * t + p2) + .05 * Math.sin(2 * t + r));
          d += (i ? 'L' : 'M') + (cx + rr * Math.cos(t)).toFixed(1) + ' ' + (cy + rr * .78 * Math.sin(t)).toFixed(1);
        }
        const major = r % 4 === 0;
        out += `<path d="${d}Z" fill="none" stroke="rgba(239,230,216,${major ? .2 : .09})" stroke-width="${major ? 1.2 : .8}"/>`;
      }
    });
    svg.innerHTML = out;
  }

  /* ------------------------------------------------------------------
     4. Run-out grooves
     ------------------------------------------------------------------ */
  (function grooves() {
    const g = $('#runoutGrooves');
    if (!g) return;
    let s = '';
    for (let r = 150; r <= 194; r += 2.2) s += `<circle cx="200" cy="200" r="${r.toFixed(1)}"/>`;
    for (let r = 86; r <= 108; r += 3) s += `<circle cx="200" cy="200" r="${r}"/>`;
    g.innerHTML = s;
  })();

  /* ------------------------------------------------------------------
     5. Player: now playing, progress line with ticks, prev/next, menu
     ------------------------------------------------------------------ */
  const player = $('#player');
  const tracks = $$('[data-track]');
  const nowEl = $('#nowPlaying');
  const fill = $('#progressFill');
  const ticksEl = $('#progressTicks');
  const countEl = $('#trackCount');
  const menu = $('#tlMenu');
  const toggle = $('#tlToggle');
  const disc = $('#playerDisc');
  const flip = $('#flip');
  const flipCard = $('#flipCard');
  const themeMeta = $('meta[name="theme-color"]');
  let ticks = [];
  let current = -2;
  let lastY = window.scrollY;
  let rot = 0;

  const label = (t) => /^[AB]\d/.test(t.dataset.track) ? `${t.dataset.track} — ${t.dataset.title}` : t.dataset.title;
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const topOf = (el) => el.getBoundingClientRect().top + window.scrollY;

  function buildTicks() {
    const max = maxScroll();
    ticksEl.innerHTML = '';
    ticks = tracks.map(t => {
      const f = Math.min(1, topOf(t) / max);
      const el = document.createElement('span');
      el.className = 'tick';
      el.style.left = (f * 100) + '%';
      el.title = label(t);
      ticksEl.appendChild(el);
      return { el, f };
    });
    if (flip) {
      const f = Math.min(1, (topOf(flip) + flip.offsetHeight / 2) / max);
      const el = document.createElement('span');
      el.className = 'tick tick--side';
      el.dataset.label = 'SIDE B';
      el.style.left = (f * 100) + '%';
      el.title = 'Flip to Side B';
      ticksEl.appendChild(el);
      ticks.push({ el, f });
    }
  }

  function buildMenu() {
    const groups = [['Side A', t => t.dataset.track.startsWith('A')], ['Side B', t => t.dataset.track.startsWith('B')], ['Outro', t => !/^[AB]/.test(t.dataset.track)]];
    menu.innerHTML = groups.map(([name, fn]) => {
      const items = tracks.filter(fn).map(t => `<a href="#${t.id}" data-idx="${tracks.indexOf(t)}"><span class="mono">${esc(t.dataset.track)}</span><span>${esc(t.dataset.title)}</span></a>`).join('');
      return `<div class="menu__side">${name}</div>${items}`;
    }).join('');
  }

  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close tracklist' : 'Open tracklist');
  }

  function goTo(i) {
    const t = tracks[Math.max(0, Math.min(tracks.length - 1, i))];
    if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  function update() {
    const y = window.scrollY, vh = window.innerHeight;
    const p = Math.min(1, y / maxScroll());
    fill.style.width = (p * 100) + '%';
    ticks.forEach(t => t.el.classList.toggle('is-passed', p >= t.f - .001));

    // current track: last one whose top passed 45% of the viewport
    let idx = -1;
    const probe = y + vh * .45;
    tracks.forEach((t, i) => { if (topOf(t) <= probe) idx = i; });
    if (idx !== current) {
      current = idx;
      nowEl.textContent = idx < 0 ? (y > vh * .5 ? 'Tracklist' : 'Cover') : label(tracks[idx]);
      countEl.textContent = `${String(Math.max(0, idx + 1)).padStart(2, '0')} / ${String(tracks.length).padStart(2, '0')}`;
      $$('a', menu).forEach(a => a.classList.toggle('is-current', Number(a.dataset.idx) === idx));
      if (idx >= 0 && tracks[idx].id === 'b5') {
        const small = $('a[href="#b5"] small');
        if (small) small.textContent = 'found it';
      }
    }
    if (idx < 0) nowEl.textContent = y > vh * .5 ? 'Tracklist' : 'Cover';
    else if (flip) {
      const fr = flip.getBoundingClientRect();
      const inFlip = fr.top < vh * .45 && fr.bottom > vh * .45;
      nowEl.textContent = inFlip ? 'Interlude · Flip to Side B' : label(tracks[idx]);
    }

    player.classList.toggle('is-visible', y > vh * .55);

    // Side B theme
    if (flip) {
      const r = flip.getBoundingClientRect();
      const onB = r.top + r.height / 2 < vh / 2;
      if (document.body.classList.contains('side-b') !== onB) {
        document.body.classList.toggle('side-b', onB);
        if (themeMeta) themeMeta.content = onB ? '#251A14' : '#141110';
      }
      flipCard.classList.toggle('is-flipped', r.top < vh * .3);
    }

    // the little record turns with the scroll
    if (!reduce) {
      rot += (y - lastY) * .35;
      disc.style.rotate = rot.toFixed(1) + 'deg';
    }
    lastY = y;
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };

  buildMenu();
  $('#prevTrack').addEventListener('click', () => goTo(current - 1));
  $('#nextTrack').addEventListener('click', () => goTo(current + 1));
  toggle.addEventListener('click', (e) => { e.stopPropagation(); setMenu(menu.hidden); });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('#player')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });
  $('#progress').addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = (e.clientX - r.left) / r.width;
    window.scrollTo({ top: f * maxScroll(), behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ------------------------------------------------------------------
     6. Run-out: the record slows down and stops
     ------------------------------------------------------------------ */
  const runout = $('.runout__disc');
  if (runout && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) runout.classList.add('is-landing'); });
    }, { threshold: .45 }).observe(runout);
  }
  $('#replay').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(() => runout && runout.classList.remove('is-landing'), 1200);
  });

  /* ------------------------------------------------------------------
     7. Reveal on scroll
     ------------------------------------------------------------------ */
  const revealEls = $$('.track__body, .credits__grid, .runout__text, .tracklist__cols');
  if ('IntersectionObserver' in window && !reduce) {
    revealEls.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: .08, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ------------------------------------------------------------------
     8. Diversity demo: inline insert + full-screen liner insert
     ------------------------------------------------------------------ */
  const mini = $('#miniDemo');
  if (mini && window.DiversityDemo) {
    const m = new DiversityDemo(mini, { k: 6, z: 4 });
    let started = false;
    new IntersectionObserver((entries) => {
      if (!started && entries[0].isIntersecting) { started = true; m.run(); }
    }, { threshold: .4 }).observe(mini);
  }

  const dlg = $('#demoDialog');
  let big = null;
  const stats = $('#demoStats');
  function openDemo() {
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    if (!big) {
      big = new DiversityDemo($('#bigDemo'), {
        k: 6, z: 4,
        onUpdate: (s) => {
          $('#kVal').textContent = s.k;
          $('#zVal').textContent = s.z;
          stats.textContent = `n = ${s.n} points · ${s.outliers} set aside · ${s.chosen} chosen · smallest gap = ${Math.round(s.minD)} px`;
        },
      });
    }
    requestAnimationFrame(() => { big.resize(); big.run(); });
  }
  function closeDemo() { if (dlg.open) dlg.close(); }
  dlg.addEventListener('close', () => { document.body.style.overflow = ''; });
  $$('[data-open-demo]').forEach(b => b.addEventListener('click', openDemo));
  $$('[data-close-demo]').forEach(b => b.addEventListener('click', closeDemo));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeDemo(); });
  dlg.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !big) return;
    if (b.dataset.k) big.setK(big.k + Number(b.dataset.k));
    if (b.dataset.z) big.setZ(big.z + Number(b.dataset.z));
    if (b.dataset.act === 'noise') big.addNoise(3);
    if (b.dataset.act === 'shuffle') big.shuffle();
    if (b.dataset.act === 'clear') big.clear();
  });

  /* ------------------------------------------------------------------
     9. Lightbox for photos
     ------------------------------------------------------------------ */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  let lbIdx = 0;
  function showPhoto(i) {
    if (!photos.length) return;
    lbIdx = (i + photos.length) % photos.length;
    const p = photos[lbIdx];
    lbImg.src = p.src;
    lbImg.alt = p.caption || '';
    lbCap.textContent = `${String(lbIdx + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}${p.caption ? ' · ' + p.caption : ''}`;
  }
  $('#contactSheet').addEventListener('click', (e) => {
    const f = e.target.closest('[data-photo]');
    if (!f) return;
    showPhoto(Number(f.dataset.photo));
    lb.showModal();
  });
  lb.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-lightbox]') || e.target === lb) lb.close();
    const n = e.target.closest('[data-lb]');
    if (n) showPhoto(lbIdx + Number(n.dataset.lb));
  });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') showPhoto(lbIdx + 1);
    if (e.key === 'ArrowLeft') showPhoto(lbIdx - 1);
  });

  /* ------------------------------------------------------------------
     10. Keep the cover title inside the sleeve (in case a fallback font is wider)
     ------------------------------------------------------------------ */
  function fitTitle() {
    const t = $('.sleeve__title');
    if (!t) return;
    t.style.fontSize = '';
    const avail = t.parentElement.clientWidth * .86;
    if (t.scrollWidth > avail) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * avail / t.scrollWidth) + 'px';
  }

  /* ------------------------------------------------------------------
     Init + keep measurements fresh
     ------------------------------------------------------------------ */
  function layout() { fitTitle(); drawTopo(); buildTicks(); update(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(layout));
  window.addEventListener('load', layout);
  if (document.fonts) document.fonts.ready.then(layout);
  if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(layout)).observe(document.body);
  layout();
})();
