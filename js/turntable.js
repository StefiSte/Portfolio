/* ==========================================================================
   B3 · On Repeat — the SZ-1 turntable.
   Click a sleeve: the record flies over the deck and drops onto the platter,
   the platter spins up, the tonearm lifts, swings over and lowers, a second of
   vinyl crackle plays (synthesised live with the Web Audio API, no audio file),
   and then the official SoundCloud player (loaded only now) starts the track.
   The platter is driven in JavaScript so it can spin up and slow down like a
   real direct-drive motor, and follow the 33/45 buttons and the pitch fader.
   ========================================================================== */

(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const recs = ((window.SITE || {}).records || []).filter(r => r && r.sc);
  const deck = $('#deck');
  if (!deck || !recs.length) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const platter = $('#platter');
  const record = $('#deckRecord');
  const label = $('#deckLabel');
  const arm = $('#tonearm');
  const title = $('#deckTitle');
  const link = $('#deckLink');
  const slot = $('#deckPlayer');
  const startBtn = $('#deckStart');
  const powerBtn = $('#deckPower');
  const speedBtns = [...deck.querySelectorAll('[data-speed]')];
  const pitchEl = $('#deckPitch');
  const pitchKnob = $('#pitchKnob');
  const pitchVal = $('#pitchVal');
  const crate = $('#crate');
  const musicBtn = $('#musicToggle');
  const card = $('#deckCard');

  /* ---------- state ---------- */
  const ARM_REST = 0, ARM_START = 31, ARM_END = 45;
  const BASE = 360 / 1.8;                 // 33⅓ rpm, in degrees per second
  const SPEED_45 = 1.12;                  // visually a touch faster, never absurd
  const PITCH_MAX = 8;                    // ±8 %, like a real deck
  let widget = null, iframe = null, apiPromise = null;
  let current = -1, playing = false, busy = false, seated = false, freeSpin = false, motorOn = false;
  let power = true, speed = 33, pitch = 0;
  let angle = 0, vel = 0, raf = 0, lastT = 0;

  const wait = (ms) => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  async function waitStill() { for (let n = 0; vel > .4 && n < 60; n++) await wait(50); }
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const trackUrl = (r) => 'https://api.soundcloud.com/tracks/' + r.sc;
  const OPTS = { color: '#f0a35a', auto_play: true, hide_related: true, show_comments: false, show_user: true, show_reposts: false, show_teaser: false, visual: false };

  /* ---------- motor ---------- */
  const factor = () => (speed === 45 ? SPEED_45 : 1) * (1 + pitch / 100);
  const target = () => (!power || reduce) ? 0 : ((current >= 0 ? motorOn : freeSpin) ? BASE * factor() : 0);

  function tick(t) {
    const dt = Math.min(.05, (t - lastT) / 1000 || 0);
    lastT = t;
    const goal = target();
    const tau = goal > vel ? .4 : .22;            // spin-up a bit slower than braking
    vel += (goal - vel) * (1 - Math.exp(-dt / tau));
    angle = (angle + vel * dt) % 360;
    platter.style.rotate = angle.toFixed(2) + 'deg';
    if (goal === 0 && vel < .4) { vel = 0; raf = 0; return; }
    raf = requestAnimationFrame(tick);
  }
  function motor() {
    if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(tick); }
  }

  /* ---------- tonearm ---------- */
  const setArm = (deg) => arm.style.setProperty('--arm', deg + 'deg');
  async function moveArm(deg) {
    deck.classList.remove('is-tracking');
    deck.classList.add('arm-lifted');
    setArm(deg);
    await wait(650);
    deck.classList.remove('arm-lifted');
    await wait(200);
  }

  /* ---------- SoundCloud ---------- */
  function playerSrc(r, autoplay) {
    const p = new URLSearchParams({ url: trackUrl(r) });
    Object.entries(OPTS).forEach(([k, v]) => p.set(k, String(v)));
    p.set('auto_play', String(!!autoplay));
    return 'https://w.soundcloud.com/player/?' + p.toString();
  }
  function loadApi() {
    if (window.SC && window.SC.Widget) return Promise.resolve();
    if (!apiPromise) {
      apiPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://w.soundcloud.com/player/api.js';
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return apiPromise;
  }
  function setPlaying(on) {
    playing = on;
    startBtn.setAttribute('aria-pressed', String(on));
    if (musicBtn) {
      musicBtn.hidden = current < 0;
      musicBtn.classList.toggle('is-playing', on);
      musicBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    }
    if (on) card.classList.remove('needs-tap');
    motor();
  }
  const timeout = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));

  // Load the track paused (inside the click). Resolves true when it's ready to play.
  function prepare(r) {
    const ready = new Promise((resolve) => {
      if (!iframe) {
        slot.innerHTML = '';
        iframe = document.createElement('iframe');
        iframe.title = 'SoundCloud player';
        iframe.allow = 'autoplay; encrypted-media';
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('frameborder', 'no');
        iframe.src = playerSrc(r, false);
        slot.appendChild(iframe);
        slot.classList.add('is-loaded');
        loadApi().then(() => {
          widget = window.SC.Widget(iframe);
          const E = window.SC.Widget.Events;
          widget.bind(E.READY, () => resolve(true));
          widget.bind(E.PLAY, () => {
            setPlaying(true);
            motorOn = true;
            if (!power) { power = true; renderPower(); }
            if (current >= 0 && !seated && !busy) recue();     // e.g. play pressed again after the end
          });
          widget.bind(E.PAUSE, () => { setPlaying(false); motorOn = false; motor(); });
          widget.bind(E.FINISH, () => { setPlaying(false); motorOn = false; seated = false; motor(); moveArm(ARM_REST); });
          widget.bind(E.PLAY_PROGRESS, (e) => {
            if (playing && seated && !busy) {
              deck.classList.add('is-tracking');
              setArm(ARM_START + (ARM_END - ARM_START) * (e.relativePosition || 0));
            }
          });
        }).catch(() => resolve(false));
      } else if (widget) {
        widget.load(trackUrl(r), Object.assign({}, OPTS, { auto_play: false, callback: () => resolve(true) }));
      } else {
        resolve(false);
      }
    });
    return Promise.race([ready, timeout(8000, !!widget)]);
  }

  function startMusic(r, ok) {
    if (ok && widget) {
      try { widget.play(); } catch (_) {}
      // if the browser refuses to start it on its own, ask for one tap in the player
      setTimeout(() => { if (!playing && current >= 0) card.classList.add('needs-tap'); }, 2500);
    } else if (iframe) {
      iframe.src = playerSrc(r, true);   // no API: fall back to the player's own autoplay
    }
  }

  /* ---------- vinyl crackle (Web Audio, generated on the fly) ---------- */
  let actx = null, crackleBuf = null;
  function ensureAudio() {                 // must run inside the click
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!actx) actx = new AC();
      if (actx.state === 'suspended') actx.resume();
    } catch (_) { actx = null; }
  }
  function makeCrackle(ctx, dur) {
    const sr = ctx.sampleRate, n = Math.floor(sr * dur);
    const buf = ctx.createBuffer(2, n, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let brown = 0;
      for (let i = 0; i < n; i++) {                       // soft surface hiss + a little rumble
        const w = Math.random() * 2 - 1;
        brown = (brown + .02 * w) / 1.02;
        d[i] = w * .006 + brown * .35;
      }
      const pops = Math.floor(dur * 38);                  // the crackle: short decaying clicks
      for (let k = 0; k < pops; k++) {
        const pos = Math.floor(Math.random() * n);
        const big = Math.random() < .08;
        const amp = big ? .25 + Math.random() * .3 : .03 + Math.pow(Math.random(), 3) * .14;
        const len = Math.floor(sr * (big ? .002 + Math.random() * .003 : .0004 + Math.random() * .0012));
        const sign = Math.random() < .5 ? -1 : 1;
        for (let j = 0; j < len && pos + j < n; j++) {
          const env = Math.pow(1 - j / len, 2.2);
          d[pos + j] += sign * amp * env * (j < 2 ? 1 : (Math.random() * 1.4 - .4));
        }
      }
    }
    return buf;
  }
  // needle drop + crackle; resolves when it's time for the music to come in
  function crackle(seconds) {
    if (!actx) return Promise.resolve();
    try {
      if (!crackleBuf) crackleBuf = makeCrackle(actx, 4);
      const t0 = actx.currentTime + .02;
      const out = actx.createGain(); out.gain.value = .9;
      const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7500;
      const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 40;
      lp.connect(hp).connect(out).connect(actx.destination);

      // the thump of the stylus touching the record
      const osc = actx.createOscillator(); osc.type = 'sine';
      osc.frequency.setValueAtTime(70, t0); osc.frequency.exponentialRampToValueAtTime(38, t0 + .12);
      const og = actx.createGain();
      og.gain.setValueAtTime(0, t0); og.gain.linearRampToValueAtTime(.35, t0 + .006); og.gain.exponentialRampToValueAtTime(.001, t0 + .16);
      osc.connect(og).connect(out); osc.start(t0); osc.stop(t0 + .2);

      // the lead-in groove: crackle that fades out as the music arrives
      const src = actx.createBufferSource(); src.buffer = crackleBuf;
      const g = actx.createGain();
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + .05);
      g.gain.setValueAtTime(1, t0 + seconds - .2); g.gain.linearRampToValueAtTime(0, t0 + seconds + .6);
      src.connect(g).connect(lp);
      src.start(t0, Math.random() * (crackleBuf.duration - seconds - 1));
      src.stop(t0 + seconds + .7);
    } catch (_) { /* no sound, no problem */ }
    return timeout(Math.round(seconds * 1000));
  }

  /* ---------- record animations ---------- */
  function markSleeve(i, out) {
    const b = crate.querySelector(`[data-rec="${i}"]`);
    if (b) b.closest('li').classList.toggle('is-out', out);
  }
  function makeFlyer(i, rect) {
    const el = document.createElement('div');
    el.className = 'vinyl-fly';
    el.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px`;
    el.innerHTML = `<span class="vinyl-fly__label"><img src="${esc(recs[i].cover)}" alt=""></span>`;
    document.body.appendChild(el);
    return el;
  }
  const center = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

  // sleeve → hover above the platter → drop onto the spindle
  async function flyIn(i) {
    const disc = crate.querySelector(`[data-rec="${i}"] .album__disc`);
    const to = record.getBoundingClientRect();
    if (reduce || !disc || !disc.animate || !to.width) return;
    const from = disc.getBoundingClientRect();
    const el = makeFlyer(i, to);
    const c0 = center(from), c1 = center(to);
    const s0 = from.width / to.width;
    const rEnd = angle + 360, rStart = rEnd - 320;
    const hover = Math.max(10, to.width * .05);
    try {
      await el.animate([
        { transform: `translate(${c0.x - c1.x}px, ${c0.y - c1.y}px) scale(${s0}) rotate(${rStart}deg)`, boxShadow: '0 6px 12px rgba(0,0,0,.45)', easing: 'cubic-bezier(.45,0,.3,1)' },
        { transform: `translate(0px, ${-hover}px) scale(1.07) rotate(${rEnd - 30}deg)`, boxShadow: '0 30px 40px rgba(0,0,0,.45)', offset: .66, easing: 'cubic-bezier(.5,0,.75,0)' },
        { transform: `translate(0px, ${-hover * .35}px) scale(1.025) rotate(${rEnd - 8}deg)`, boxShadow: '0 14px 20px rgba(0,0,0,.45)', offset: .88, easing: 'cubic-bezier(.3,0,.6,1)' },
        { transform: `translate(0px, 0px) scale(1) rotate(${rEnd}deg)`, boxShadow: '0 3px 8px rgba(0,0,0,.55)' },
      ], { duration: 1050 }).finished;
    } catch (_) { /* interrupted */ }
    // hand over to the real record in the same frame: identical position, size and angle
    record.classList.add('no-anim');
    deck.classList.add('has-record');
    el.remove();
    requestAnimationFrame(() => record.classList.remove('no-anim'));
    if (platter.animate) platter.animate([{ scale: 1 }, { scale: .993 }, { scale: 1 }], { duration: 220, easing: 'ease-out' });
  }

  // platter → back into its sleeve
  async function flyOut(i) {
    const disc = crate.querySelector(`[data-rec="${i}"] .album__disc`);
    const from = record.getBoundingClientRect();
    if (reduce || !disc || !disc.animate || !from.width) { deck.classList.remove('has-record'); return; }
    const to = disc.getBoundingClientRect();
    const el = makeFlyer(i, from);
    record.classList.add('no-anim');
    deck.classList.remove('has-record');
    requestAnimationFrame(() => record.classList.remove('no-anim'));
    const c0 = center(from), c1 = center(to);
    const s1 = to.width / from.width;
    try {
      await el.animate([
        { transform: `translate(0,0) scale(1) rotate(${angle}deg)`, boxShadow: '0 3px 8px rgba(0,0,0,.55)', easing: 'cubic-bezier(.2,0,.4,1)' },
        { transform: `translate(0px, ${-from.width * .05}px) scale(1.06) rotate(${angle + 20}deg)`, boxShadow: '0 28px 38px rgba(0,0,0,.45)', offset: .25, easing: 'cubic-bezier(.45,0,.3,1)' },
        { transform: `translate(${c1.x - c0.x}px, ${c1.y - c0.y}px) scale(${s1}) rotate(${angle - 200}deg)`, boxShadow: '0 6px 12px rgba(0,0,0,.45)' },
      ], { duration: 750 }).finished;
    } catch (_) { /* interrupted */ }
    el.remove();
  }

  async function armDown() {
    await moveArm(ARM_START);
    seated = true;
  }
  async function recue() {                 // play pressed again after a record ended
    busy = true;
    motorOn = true; motor();
    await armDown();
    busy = false;
  }

  /* ---------- choosing a record ---------- */
  async function choose(i) {
    if (busy) return;
    if (i === current) { toggle(); return; }
    busy = true;
    const r = recs[i];
    const prev = current;

    // inside the click: wake up audio and start loading the track (paused)
    ensureAudio();
    if (prev >= 0 && widget && playing) { try { widget.pause(); } catch (_) {} }
    const ready = prepare(r);
    card.classList.remove('needs-tap');

    if (!power) { power = true; renderPower(); }
    freeSpin = false;

    if (prev >= 0) {
      seated = false; motorOn = false; motor();
      await moveArm(ARM_REST);
      await flyOut(prev);
      markSleeve(prev, false);
    }
    await waitStill();                     // the platter stops before the next record goes on

    current = i;
    title.innerHTML = `<b>${esc(r.title)}</b><span>${esc(r.artist)}</span>`;
    link.href = r.link; link.hidden = false;
    label.src = r.cover;
    if (musicBtn) musicBtn.hidden = false;
    markSleeve(i, true);

    // on phones the deck sits above the crate: bring it into view to see the record land
    const dr = deck.getBoundingClientRect();
    if (dr.top < 0 || dr.bottom > window.innerHeight) {
      deck.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      await wait(600);
    }
    await flyIn(i);
    motorOn = true; motor();               // platter spins up with the record on it
    await wait(250);
    await armDown();                       // needle in the lead-in groove…
    const [ok] = await Promise.all([ready, crackle(1.2)]);   // …a second of crackle…
    busy = false;
    if (current === i) startMusic(r, ok);  // …and the track comes in
  }

  /* ---------- controls ---------- */
  function toggle() {
    if (!power) return;                    // a deck that's off does nothing
    if (current < 0) {                      // no record: the platter just spins
      freeSpin = !freeSpin;
      startBtn.setAttribute('aria-pressed', String(freeSpin));
      motor();
      if (freeSpin) { crate.classList.remove('nudge'); void crate.offsetWidth; crate.classList.add('nudge'); }
      return;
    }
    if (widget) widget.toggle();
  }

  function renderPower() {
    deck.classList.toggle('is-off', !power);
    powerBtn.setAttribute('aria-pressed', String(power));
    powerBtn.setAttribute('aria-label', power ? 'Power off' : 'Power on');
    motor();
  }
  powerBtn.addEventListener('click', () => {
    power = !power;
    if (!power) {
      freeSpin = false; motorOn = false;
      startBtn.setAttribute('aria-pressed', 'false');
      if (widget && playing) widget.pause();
    }
    renderPower();
  });

  speedBtns.forEach(b => b.addEventListener('click', () => {
    speed = Number(b.dataset.speed);
    speedBtns.forEach(x => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
  }));

  function setPitch(v) {
    pitch = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, Math.round(v * 10) / 10));
    pitchKnob.style.top = (50 + (pitch / PITCH_MAX) * 42) + '%';   // towards you = faster, as on a real deck
    const txt = (pitch > 0 ? '+' : pitch < 0 ? '−' : '±') + Math.abs(pitch).toFixed(1);
    pitchVal.textContent = txt;
    pitchEl.setAttribute('aria-valuenow', String(pitch));
    pitchEl.setAttribute('aria-valuetext', `${pitch.toFixed(1)} percent`);
  }
  function pitchFromPointer(e) {
    const r = pitchEl.getBoundingClientRect();
    const rel = (e.clientY - r.top) / r.height;          // 0 top … 1 bottom
    setPitch(((rel - .5) / .42) * PITCH_MAX);
  }
  pitchEl.addEventListener('pointerdown', (e) => {
    pitchEl.setPointerCapture(e.pointerId);
    pitchFromPointer(e);
    const move = (ev) => pitchFromPointer(ev);
    const up = () => { pitchEl.removeEventListener('pointermove', move); pitchEl.removeEventListener('pointerup', up); pitchEl.removeEventListener('pointercancel', up); };
    pitchEl.addEventListener('pointermove', move);
    pitchEl.addEventListener('pointerup', up);
    pitchEl.addEventListener('pointercancel', up);
  });
  pitchEl.addEventListener('dblclick', () => setPitch(0));
  pitchEl.addEventListener('keydown', (e) => {
    const step = { ArrowUp: .5, ArrowRight: .5, ArrowDown: -.5, ArrowLeft: -.5, PageUp: 2, PageDown: -2 }[e.key];
    if (step !== undefined) { setPitch(pitch + step); e.preventDefault(); }
    if (e.key === 'Home') { setPitch(PITCH_MAX); e.preventDefault(); }
    if (e.key === 'End') { setPitch(-PITCH_MAX); e.preventDefault(); }
    if (e.key === '0') setPitch(0);
  });

  crate.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rec]');
    if (b) choose(Number(b.dataset.rec));
  });
  startBtn.addEventListener('click', toggle);
  if (musicBtn) musicBtn.addEventListener('click', toggle);

  setArm(ARM_REST);
  setPitch(0);
  renderPower();
})();
