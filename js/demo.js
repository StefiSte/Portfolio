/* ==========================================================================
   Diversity maximization with outliers — a small teaching demo.
   1. Set aside the z points with the largest nearest-neighbour distance.
   2. Start from the inlier farthest from the centroid.
   3. Greedily add the inlier farthest from the chosen set (farthest-first / GMM).
   The dashed circles have radius = half the minimum pairwise distance among
   the chosen points, so they never overlap.
   ========================================================================== */

(function () {
  const COLORS = {
    grid: 'rgba(238,229,211,.08)',
    candidate: 'rgba(238,229,211,.38)',
    chosen: '#F0A82A',
    chosenRing: '#141110',
    disk: 'rgba(240,168,42,.6)',
    diskFill: 'rgba(240,168,42,.07)',
    outlier: '#F0603F',
    label: '#EEE5D3',
  };

  const gauss = () => {
    let u = 0, v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  class DiversityDemo {
    constructor(container, opts = {}) {
      this.box = container;
      this.k = opts.k ?? 6;
      this.z = opts.z ?? 4;
      this.onUpdate = opts.onUpdate || (() => {});
      this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.canvas = document.createElement('canvas');
      this.box.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.pts = [];
      this.result = null;
      this.raf = 0;

      this.seed();
      this.box.addEventListener('click', (e) => {
        const r = this.box.getBoundingClientRect();
        this.pts.push({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
        this.run();
      });
      new ResizeObserver(() => this.resize()).observe(this.box);
      this.resize();
    }

    seed() {
      const pts = [];
      const clusters = [[.26, .34, .065], [.6, .26, .06], [.44, .66, .075], [.77, .62, .05]];
      clusters.forEach(([x, y, s]) => {
        for (let i = 0; i < 15; i++) pts.push({ x: x + gauss() * s, y: y + gauss() * s * 1.15 });
      });
      [[.05, .1], [.95, .12], [.94, .9], [.07, .88]].forEach(([x, y]) =>
        pts.push({ x: x + (Math.random() - .5) * .03, y: y + (Math.random() - .5) * .04 }));
      this.pts = pts.filter(p => p.x > .02 && p.x < .98 && p.y > .03 && p.y < .97);
    }

    addNoise(n = 3) {
      for (let i = 0; i < n; i++) {
        const edge = Math.random() < .5;
        this.pts.push(edge
          ? { x: Math.random() < .5 ? .03 + Math.random() * .08 : .89 + Math.random() * .08, y: .05 + Math.random() * .9 }
          : { x: .05 + Math.random() * .9, y: Math.random() < .5 ? .04 + Math.random() * .08 : .88 + Math.random() * .08 });
      }
      this.run();
    }
    shuffle() { this.seed(); this.run(); }
    clear() { this.pts = []; this.run(); }
    setK(k) { this.k = Math.max(2, Math.min(12, k)); this.run(); }
    setZ(z) { this.z = Math.max(0, Math.min(10, z)); this.run(); }

    resize() {
      const r = this.box.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.W = r.width; this.H = r.height;
      this.canvas.width = Math.round(this.W * dpr);
      this.canvas.height = Math.round(this.H * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.result = this.solve();
      this.draw(1);
    }

    solve() {
      const W = this.W, H = this.H;
      const P = this.pts.map(p => ({ x: p.x * W, y: p.y * H }));
      const n = P.length;
      const empty = { P, out: new Set(), chosen: [], minD: 0 };
      if (!n) return empty;
      const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

      // 1. isolation score = nearest-neighbour distance (outliers = the z largest, as in the paper)
      const m = Math.min(1, n - 1);
      const score = P.map((p, i) => {
        if (m < 1) return 0;
        const ds = [];
        for (let j = 0; j < n; j++) if (j !== i) ds.push(dist(p, P[j]));
        ds.sort((a, b) => a - b);
        return ds[m - 1];
      });
      const zEff = Math.min(this.z, Math.max(0, n - this.k));
      const out = new Set(score.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0]).slice(0, zEff).map(([, i]) => i));

      const inl = [];
      for (let i = 0; i < n; i++) if (!out.has(i)) inl.push(i);
      if (!inl.length) return { ...empty, out };

      // 2. start from the inlier farthest from the centroid
      const cx = inl.reduce((s, i) => s + P[i].x, 0) / inl.length;
      const cy = inl.reduce((s, i) => s + P[i].y, 0) / inl.length;
      let first = inl[0], best = -1;
      inl.forEach(i => { const d = Math.hypot(P[i].x - cx, P[i].y - cy); if (d > best) { best = d; first = i; } });

      // 3. farthest-first traversal
      const chosen = [first];
      const md = new Map(inl.map(i => [i, dist(P[i], P[first])]));
      while (chosen.length < Math.min(this.k, inl.length)) {
        let bi = -1, bd = -1;
        md.forEach((d, i) => { if (!chosen.includes(i) && d > bd) { bd = d; bi = i; } });
        chosen.push(bi);
        md.forEach((d, i) => md.set(i, Math.min(d, dist(P[i], P[bi]))));
      }
      let minD = Infinity;
      for (let a = 0; a < chosen.length; a++)
        for (let b = a + 1; b < chosen.length; b++) minD = Math.min(minD, dist(P[chosen[a]], P[chosen[b]]));
      return { P, out, chosen, minD: isFinite(minD) ? minD : 0 };
    }

    draw(t) {
      const { ctx, W, H } = this;
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = COLORS.grid;
      for (let x = 12; x < W; x += 24) for (let y = 12; y < H; y += 24) ctx.fillRect(x, y, 1, 1);

      const res = this.result;
      if (!res || !res.P.length) {
        ctx.fillStyle = '#a99f8e';
        ctx.font = '400 12px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Click anywhere to drop points', W / 2, H / 2);
        ctx.textAlign = 'start';
        return;
      }
      const { P, out, chosen, minD } = res;
      const chosenSet = new Set(chosen);

      P.forEach((p, i) => {
        if (out.has(i) || chosenSet.has(i)) return;
        ctx.fillStyle = COLORS.candidate;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.7, 0, Math.PI * 2); ctx.fill();
      });

      out.forEach(i => {
        const p = P[i], s = 4.5;
        ctx.strokeStyle = COLORS.outlier; ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(p.x - s, p.y - s); ctx.lineTo(p.x + s, p.y + s);
        ctx.moveTo(p.x + s, p.y - s); ctx.lineTo(p.x - s, p.y + s);
        ctx.stroke();
        ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      });

      const shown = Math.ceil(t * chosen.length * 1.4);
      const disk = Math.max(0, Math.min(1, (t - .55) / .45));
      chosen.forEach((i, idx) => {
        if (idx >= shown) return;
        const p = P[i];
        if (disk > 0 && chosen.length > 1) {
          ctx.strokeStyle = COLORS.disk; ctx.fillStyle = COLORS.diskFill; ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.arc(p.x, p.y, (minD / 2) * disk, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = COLORS.chosenRing; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = COLORS.chosen; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = COLORS.label; ctx.font = '400 10px "Space Mono", monospace';
        ctx.fillText(String(idx + 1), p.x + 8, p.y - 7);
      });
    }

    run() {
      this.result = this.solve();
      const r = this.result;
      this.onUpdate({ n: r.P.length, outliers: r.out.size, chosen: r.chosen.length, minD: r.minD, k: this.k, z: this.z });
      cancelAnimationFrame(this.raf);
      if (this.reduce) { this.draw(1); return; }
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 1100);
        this.draw(t);
        if (t < 1) this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }
  }

  window.DiversityDemo = DiversityDemo;
})();
