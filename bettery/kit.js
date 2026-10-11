/* Bettery web kit — the tray glyph, the tray panel and the settings tiles, rebuilt from the Swift sources:
   BatteryIconRenderer / DynamicBatteryIconView (glyph), BatteryPanelView / EnergyModeCard / BetteryRow /
   BetteryGroupedSection (panel), BetteryMaterial (glass), SettingsTilePicker (tiles), ChargingAnimationClock. */
(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- colours (BetteryDesign, BatteryIconRenderer, BatteryPanelView) ---------- */
  const C = {
    green: '#33c759',          // 0.20 / 0.78 / 0.35
    yellow: '#ffcc00',         // glyph low power 1.0 / 0.8 / 0.0
    lightFill: '#e6e6e6',      // 0.9 grey
    pillYellow: '#ffc700',     // 1.0 / 0.78 / 0.0
    pillRed: '#ff4d45',        // 1.0 / 0.30 / 0.27
    health: '#fa6bb8', cycles: '#8c7af2', limit: '#33b39e',
    appearance: '#8f59f5',     // SettingsTab.appearance
    advanced: '#1ab3d1',
    rowBlue: '#338cff', rowGreen: '#33c759', rowYellow: '#ffc700',
  };
  const sys = {
    blue: t => (t === 'light' ? '#007aff' : '#0a84ff'),
    red: t => (t === 'light' ? '#ff3b30' : '#ff453a'),
  };

  /* ---------- SF Symbol look-alikes, drawn on a 24 grid ---------- */
  function gearPath() {
    const pts = [], N = 8, ro = 10.2, rr = 7.9;
    for (let i = 0; i < N; i++) {
      const c = i * 360 / N - 90;
      for (const [a, r] of [[-14, rr], [-8, ro], [8, ro], [14, rr]]) {
        const rad = (c + a) * Math.PI / 180;
        pts.push([12 + r * Math.cos(rad), 12 + r * Math.sin(rad)]);
      }
    }
    const h = 3.6;
    return 'M' + pts.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + 'Z' +
      `M${12 + h} 12A${h} ${h} 0 1 0 ${12 - h} 12A${h} ${h} 0 1 0 ${12 + h} 12Z`;
  }
  function sector(cx, cy, r0, r1, a0, a1) {
    const p = (r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)].map(n => n.toFixed(3)).join(' ');
    if (r0 <= 0) return `M${cx} ${cy}L${p(r1, a0)}A${r1} ${r1} 0 0 1 ${p(r1, a1)}Z`;
    return `M${p(r0, a0)}L${p(r1, a0)}A${r1} ${r1} 0 0 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 0 0 ${p(r0, a0)}Z`;
  }
  const wifi = [sector(12, 19.5, 0, 4.6, -135, -45), sector(12, 19.5, 6.9, 10, -135, -45), sector(12, 19.5, 12.3, 15.4, -135, -45)]
    .map(d => `<path d="${d}" fill="currentColor" stroke="currentColor" stroke-width=".9" stroke-linejoin="round"/>`).join('');
  const SYMBOLS = {
    gear: `<path d="${gearPath()}" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill-rule="evenodd"/>`,
    power: '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3v8.2"/><path d="M7.1 6.2a7.6 7.6 0 1 0 9.8 0"/></g>',
    check: '<path d="M5 12.6l4.4 4.5L19 7.3" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
    xmark: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
    bolt: '<path fill="currentColor" d="M13.6 2.2 5.4 13.1c-.3.4 0 .9.5.9h5.2l-1.6 7.4c-.1.6.6.9 1 .4l8.2-10.9c.3-.4 0-.9-.5-.9h-5.2l1.6-7.4c.1-.6-.6-.9-1-.4z"/>',
    leaf: '<path fill="currentColor" d="M20.9 3.3c-.3-.2-.7-.2-1.1-.2C10.7 3.6 4.7 7.5 4.7 13.7c0 1.6.4 3.1 1.2 4.3-.8.9-1.5 1.9-2 2.9a.9.9 0 0 0 1.6.8c.4-.8 1-1.6 1.6-2.4 1.2 1 2.8 1.5 4.6 1.5 6.3 0 9.3-5.6 9.6-16.6 0-.4-.1-.7-.4-.9zM8.4 17.1c2-2.6 4.6-4.8 7.6-6.4.4-.2.6-.7.4-1.2-.2-.4-.8-.6-1.2-.4-3.2 1.7-6 4-8.1 6.8-.3-.7-.5-1.4-.5-2.2 0-1.1.3-2.2.8-3.1"/>',
    warn: '<path fill="currentColor" fill-rule="evenodd" d="M10.3 3.6a2 2 0 0 1 3.4 0l8.3 14.4a2 2 0 0 1-1.7 3H3.7a2 2 0 0 1-1.7-3zM12 8.2a1.05 1.05 0 0 0-1.05 1.1l.27 5.3a.78.78 0 0 0 1.56 0l.27-5.3A1.05 1.05 0 0 0 12 8.2zm0 8.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/>',
    batt100: '<rect x="2.3" y="7" width="17.2" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><rect x="4.4" y="9.1" width="13" height="5.8" rx="1.3" fill="currentColor"/><path fill="currentColor" d="M20.7 10.1h.4a1 1 0 0 1 1 1v1.8a1 1 0 0 1-1 1h-.4z"/>',
    batt50: '<rect x="2.3" y="7" width="17.2" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><rect x="4.4" y="9.1" width="6.6" height="5.8" rx="1.3" fill="currentColor"/><path fill="currentColor" d="M20.7 10.1h.4a1 1 0 0 1 1 1v1.8a1 1 0 0 1-1 1h-.4z"/>',
    clock: '<path fill="currentColor" fill-rule="evenodd" d="M12 2.4a9.6 9.6 0 1 1 0 19.2 9.6 9.6 0 0 1 0-19.2zM11.05 6.4v6.3c0 .52.43.95.95.95h4.6a.95.95 0 0 0 0-1.9h-3.65V6.4a.95.95 0 0 0-1.9 0z"/>',
    heart: '<path fill="currentColor" d="M12 20.7c-.3 0-.6-.1-.8-.3C7.3 17.6 2.8 14 2.8 9.5 2.8 6.6 5 4.3 7.9 4.3c1.7 0 3.2.8 4.1 2.2.9-1.4 2.4-2.2 4.1-2.2 2.9 0 5.1 2.3 5.1 5.2 0 4.5-4.5 8.1-8.4 10.9-.2.2-.5.3-.8.3z"/>',
    cycle: '<g fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M4.9 12.2a7.1 7.1 0 0 1 12.2-5"/><path d="M19.1 11.8a7.1 7.1 0 0 1-12.2 5"/></g><path fill="currentColor" stroke="currentColor" stroke-width=".9" stroke-linejoin="round" d="M19.5 3.6v5.6h-5.6z"/><path fill="currentColor" stroke="currentColor" stroke-width=".9" stroke-linejoin="round" d="M4.5 20.4v-5.6h5.6z"/>',
    thermo: '<path d="M9.7 13.4V5.1a2.3 2.3 0 0 1 4.6 0v8.3a4.3 4.3 0 1 1-4.6 0z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="16.9" r="2.1" fill="currentColor"/><path d="M12 9.6v7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    shield: '<path d="M12 2.7l7.3 2.8v5.8c0 4.9-3.1 8.5-7.3 9.9-4.2-1.4-7.3-5-7.3-9.9V5.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path fill="currentColor" d="M12 4.6 6.6 6.7v5h5.4zM12 11.7h5.4c-.3 3.6-2.4 6.2-5.4 7.6z"/>',
    wifi,
    cc: '<g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.8" y="4.3" width="18.4" height="6.6" rx="3.3"/><rect x="2.8" y="13.1" width="18.4" height="6.6" rx="3.3"/></g><circle cx="17.9" cy="7.6" r="2.15" fill="currentColor"/><circle cx="6.1" cy="16.4" r="2.15" fill="currentColor"/>',
    search: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.4" cy="10.4" r="6.4"/><path d="M15.2 15.2l5 5"/></g>',
    globe: '<g fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3.4 9h17.2M3.4 15h17.2"/></g>',
    sun: '<circle cx="12" cy="12" r="4.4" fill="currentColor"/><g stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M12 2.4v2.3M12 19.3v2.3M2.4 12h2.3M19.3 12h2.3M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M5.2 18.8l1.6-1.6M17.2 6.8l1.6-1.6"/></g>',
    moon: '<path fill="currentColor" d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a.6.6 0 0 0-.8-.7A9.4 9.4 0 1 0 20.9 15.4a.6.6 0 0 0-.7-.8z"/>',
    sunrise: '<path fill="currentColor" d="M6.3 16.6a5.7 5.7 0 0 1 11.4 0z"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 19.6h18M12 4.2v3M4.6 9.2l1.9 1.6M19.4 9.2l-1.9 1.6"/></g>',
    sparkles: '<path fill="currentColor" d="M10 3.5l1.6 4.4 4.4 1.6-4.4 1.6L10 15.5l-1.6-4.4L4 9.5l4.4-1.6zM17.5 13l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z"/>',
    game: '<path fill="currentColor" d="M7.2 6.5h9.6a5 5 0 0 1 4.9 4.1l.9 5a2.7 2.7 0 0 1-4.7 2.3l-1.8-2H7.9l-1.8 2a2.7 2.7 0 0 1-4.7-2.3l.9-5a5 5 0 0 1 4.9-4.1zm.5 3v1.6H6.1v1.6h1.6v1.6h1.6v-1.6h1.6v-1.6H9.3V9.5zm8.6 1.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 2.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>',
    apple: '<path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/>',
    chevron: '<path d="M9 5.5l6.5 6.5L9 18.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  };
  function injectSprite() {
    if (document.getElementById('bk-sprite')) return;
    const s = document.createElementNS(SVGNS, 'svg');
    s.id = 'bk-sprite'; s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    s.innerHTML = '<defs>' + Object.entries(SYMBOLS).map(([k, v]) => `<symbol id="bk-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('') + '</defs>';
    document.body.prepend(s);
  }
  const icon = id => `<svg class="bk-i" viewBox="0 0 24 24" aria-hidden="true" shape-rendering="geometricPrecision"><use href="#bk-${id}"/></svg>`;

  /* ---------- language: German browsers get DE, everyone else EN ---------- */
  const APP_TEXT = {
    de: {
      settings: 'Einstellungen', quit: 'Bettery beenden', quitConfirm: 'Beenden?', cancel: 'Abbrechen',
      charging: 'Wird geladen', low: 'Stromsparmodus', critical: 'Kritischer Akkustand',
      energy: 'Energiemodus', auto: 'Automatisch', lowpower: 'Leistung reduzieren', details: 'Details',
      remaining: 'Verbleibend', health: 'Zustand', cycles: 'Zyklen', temp: 'Temperatur', limit: 'Ladelimit',
      untilFull: m => `${m} min bis voll`, hm: (h, m) => `${h}h ${m}min`,
    },
    en: {
      settings: 'Settings', quit: 'Quit Bettery', quitConfirm: 'Quit?', cancel: 'Cancel',
      charging: 'Charging', low: 'Low Power Mode', critical: 'Critical Battery',
      energy: 'Energy Mode', auto: 'Automatic', lowpower: 'Low Power', details: 'Details',
      remaining: 'Remaining', health: 'Health', cycles: 'Cycles', temp: 'Temperature', limit: 'Charge Limit',
      untilFull: m => `${m} min until full`, hm: (h, m) => `${h}h ${m}min`,
    },
  };
  function detectLang() {
    try { const s = localStorage.getItem('bettery-lang'); if (s === 'de' || s === 'en') return s; } catch (e) { }
    const l = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    return l.startsWith('de') ? 'de' : 'en';
  }
  let DICT = { de: {}, en: {} };
  const BK = { C, sys, icon, reduced, lang: detectLang() };
  BK.t = k => (DICT[BK.lang] && DICT[BK.lang][k]) ?? k;
  BK.app = () => APP_TEXT[BK.lang];
  BK.setLang = function (l, remember) {
    BK.lang = l;
    document.documentElement.lang = l;
    if (remember) { try { localStorage.setItem('bettery-lang', l); } catch (e) { } }
    document.querySelectorAll('[data-i18n]').forEach(el => { const v = DICT[l][el.dataset.i18n]; if (v !== undefined) el.innerHTML = v; });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { const v = DICT[l][el.dataset.i18nAria]; if (v !== undefined) el.setAttribute('aria-label', v); });
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    if (DICT[l]._title) document.title = DICT[l]._title;
    document.dispatchEvent(new CustomEvent('bk-lang', { detail: l }));
  };

  /* ---------- one animation loop for everything that moves ---------- */
  const movers = new Set();
  let raf = 0;
  function frame(now) {
    raf = 0;
    let live = false;
    for (const m of movers) {
      if (!m.alive()) { movers.delete(m); continue; }
      if (m.draw(now)) live = true;
    }
    if (live) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  // ChargingAnimationClock: one shared 3 s phase, so tray, panel and previews never drift apart.
  const CLOCK0 = performance.now();
  const phase = (now, period) => (((now - CLOCK0) / 1000) % period) / period;
  const fillFactor = (style, p) => style === 'bounce' ? (1 - Math.cos(p * Math.PI * 2)) / 2 : style === 'refill' ? p : 0;

  /* ---------- glyph ---------- */
  // Tray: BatteryIconRenderer (tip 27.5/9, 1.75×4, r 1.1). Hero: DynamicBatteryIconView (tip 26.75/8.5, 1.75×5, r .95).
  // The viewBox is widened on the left so the battery body, not body + tip, sits in the middle.
  const TIPS = { tray: { x: 27.5, y: 9, w: 1.75, h: 4, r: 1.1 }, hero: { x: 26.75, y: 8.5, w: 1.75, h: 5, r: 0.95 } };
  const tipD = ({ x, y, w, h, r }) => `M${x} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x}Z`;
  let gid = 0;
  function Glyph(host, opts) {
    const o = this.o = Object.assign({
      level: 76, charging: false, low: false, style: 'level', anim: 'bounce', theme: 'dark',
      number: true, variant: 'tray', crop: false, color: null, blink: true, shimmer: true, period: 3,
    }, opts);
    const n = ++gid, tip = TIPS[o.variant], half = tip.x + tip.w - 13.5;
    const vb = o.crop ? `${13.5 - half} 4.5 ${half * 2} 13` : `${13.5 - half} 0 ${half * 2} 22`;
    host.innerHTML = `<svg class="bk-glyph" viewBox="${vb}" shape-rendering="geometricPrecision" role="img">
      <defs><clipPath id="bkc${n}"><rect x=".5" y="4.5" width="26" height="13" rx="4"/></clipPath>
      <linearGradient id="bks${n}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity=".62"/><stop offset=".65" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <path class="tip" d="${tipD(tip)}"/>
      <rect class="trk" x=".5" y="4.5" width="26" height="13" rx="4"/>
      <g clip-path="url(#bkc${n})"><rect class="fa" x=".5" y="4.5" height="13" width="0"/><rect class="fb" x=".5" y="4.5" height="13" width="0"/>
      <rect class="sh" y="4.5" height="13" width="0" fill="url(#bks${n})" style="mix-blend-mode:plus-lighter"/></g>
      <text class="num" x="13.5" y="14.85" text-anchor="middle">76</text></svg>`;
    const q = s => host.querySelector(s);
    this.svg = q('svg'); this.tip = q('.tip'); this.trk = q('.trk'); this.fa = q('.fa'); this.fb = q('.fb'); this.sh = q('.sh'); this.num = q('.num');
    this.sweep = null;
    movers.add(this); kick();
  }
  Glyph.prototype.alive = function () { return this.svg.isConnected; };
  Glyph.prototype.set = function (p) {
    const o = this.o, was = o.charging;
    Object.assign(o, p);
    // Plug in / unplug: colour sweep across the fill, 0.3 s (AppDelegate.startAnimation). Not in Low Power Mode.
    if (p.charging !== undefined && p.charging !== was && !o.low && !reduced.matches) this.sweep = { t0: performance.now(), on: o.charging };
    kick();
  };
  Glyph.prototype.fillColor = function () {
    const o = this.o;
    if (o.color) return o.color;
    if (o.low) return C.yellow;
    if (o.level <= 20) return sys.red(o.theme);
    if (o.charging) return C.green;
    return C.lightFill;
  };
  Glyph.prototype.draw = function (now) {
    const o = this.o, dark = o.theme !== 'light';
    let live = false, level = o.level;
    const animate = o.charging && o.anim !== 'off' && o.level < 100 && !reduced.matches;
    if (animate) { live = true; level = o.level + fillFactor(o.anim, phase(now, o.period)) * (100 - o.level); }
    const col = this.fillColor();
    this.tip.setAttribute('fill', dark ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.55)');
    const solid = o.style === 'filled';
    this.trk.setAttribute('fill', solid ? 'none' : (dark ? '#9e9e9e' : '#f5f5f5'));
    const fw = solid ? 26 : 26 * Math.max(0, Math.min(1, level / 100));
    let opacity = 1;
    if (o.blink && !o.low && o.level <= 20 && !reduced.matches) {
      live = true;
      const wave = 0.5 + 0.5 * Math.sin((now - CLOCK0) / 1000 * Math.PI * 2 / 0.7);
      opacity = 0.08 + 0.92 * Math.pow(wave, 0.25);
    }
    // sweep: charging → green grows from the left over the old colour; unplugging → green shrinks back
    let sw = this.sweep;
    if (sw) {
      const pr = (now - sw.t0) / 330;
      if (pr >= 1) { sw = this.sweep = null; } else {
        live = true;
        const pos = fw * (sw.on ? pr : 1 - pr);
        const left = sw.on ? C.green : C.green, right = sw.on ? C.lightFill : C.lightFill;
        this.fa.setAttribute('width', pos.toFixed(3)); this.fa.setAttribute('fill', sw.on ? left : left);
        this.fb.setAttribute('x', (0.5 + pos).toFixed(3)); this.fb.setAttribute('width', Math.max(0, fw - pos).toFixed(3)); this.fb.setAttribute('fill', right);
      }
    }
    if (!sw) {
      this.fa.setAttribute('width', fw.toFixed(3)); this.fa.setAttribute('fill', col); this.fa.setAttribute('fill-opacity', opacity.toFixed(3));
      this.fb.setAttribute('width', '0');
    }
    if (o.shimmer && o.low && !o.charging && fw > 0 && !reduced.matches) {
      live = true;
      const p = phase(now, 2.8), bw = Math.max(fw * 0.38, 1), x = 0.5 + fw - p * (fw + bw);
      this.sh.setAttribute('x', x.toFixed(3)); this.sh.setAttribute('width', bw.toFixed(3));
    } else this.sh.setAttribute('width', '0');
    this.num.style.display = o.number ? '' : 'none';
    this.num.textContent = String(Math.round(o.level));
    this.svg.setAttribute('aria-label', `${Math.round(o.level)} %`);
    return live;
  };
  BK.glyph = (host, opts) => new Glyph(host, opts);

  /* ---------- panel ---------- */
  function Panel(host, opts) {
    this.host = host;
    this.s = Object.assign({
      level: 76, charging: true, low: false, theme: 'dark', material: 'liquid', minutes: 18,
      health: 94, cycles: 212, temp: 31.4, limit: 80, onChange: null, onSettings: null, onQuit: null,
    }, opts);
    host.innerHTML = `<div class="bk-panel">
      <div class="bk-bg" aria-hidden="true"></div>
      <svg class="bk-edge" aria-hidden="true" preserveAspectRatio="none"></svg>
      <div class="bk-in">
        <div class="bk-tb">
          <button type="button" class="bk-ib bk-gear">${icon('gear')}</button>
          <div class="bk-quit">
            <button type="button" class="bk-ib bk-power">${icon('power')}</button>
            <button type="button" class="bk-ib bk-yes">${icon('check')}</button>
            <button type="button" class="bk-ib bk-no">${icon('xmark')}</button>
          </div>
        </div>
        <div class="bk-hero"><div class="bk-hg"></div><div class="bk-pill-slot" aria-live="polite"></div></div>
        <div class="bk-cards">
          <section><h3 class="bk-sech" data-k="energy"></h3>
            <div class="bk-card">
              <button type="button" class="bk-row bk-mode" data-mode="auto"><span class="bk-badge t">${icon('batt100')}</span><span class="bk-rt" data-k="auto"></span><span class="bk-chk">${icon('check')}</span></button>
              <div class="bk-div"></div>
              <button type="button" class="bk-row bk-mode" data-mode="low"><span class="bk-badge t">${icon('leaf')}</span><span class="bk-rt" data-k="lowpower"></span><span class="bk-chk">${icon('check')}</span></button>
            </div>
          </section>
          <section><h3 class="bk-sech" data-k="details"></h3>
            <div class="bk-card">
              <div class="bk-row"><span class="bk-badge t b-clock">${icon('clock')}</span><span class="bk-rt" data-k="remaining"></span><span class="bk-rv" data-v="remaining"></span></div><div class="bk-div"></div>
              <div class="bk-row"><span class="bk-badge t" style="--c:${C.health}">${icon('heart')}</span><span class="bk-rt" data-k="health"></span><span class="bk-rv" data-v="health"></span></div><div class="bk-div"></div>
              <div class="bk-row"><span class="bk-badge t" style="--c:${C.cycles}">${icon('cycle')}</span><span class="bk-rt" data-k="cycles"></span><span class="bk-rv" data-v="cycles"></span></div><div class="bk-div"></div>
              <div class="bk-row"><span class="bk-badge t b-temp">${icon('thermo')}</span><span class="bk-rt" data-k="temp"></span><span class="bk-rv" data-v="temp"></span></div><div class="bk-div"></div>
              <div class="bk-row"><span class="bk-badge t" style="--c:${C.limit}">${icon('shield')}</span><span class="bk-rt" data-k="limit"></span><span class="bk-rv" data-v="limit"></span></div>
            </div>
          </section>
        </div>
      </div>
    </div>`;
    const q = s => host.querySelector(s);
    this.el = q('.bk-panel'); this.edge = q('.bk-edge'); this.pillSlot = q('.bk-pill-slot');
    this.glyph = BK.glyph(q('.bk-hg'), { variant: 'hero', number: false, level: this.s.level, charging: this.s.charging, low: this.s.low, theme: this.s.theme });
    this.pillKey = null;
    // edge: 0.5 pt border + Liquid's 1 pt light lip, drawn as vectors so they stay sharp at any zoom
    const ro = new ResizeObserver(() => this.drawEdge()); ro.observe(this.el);
    q('.bk-gear').addEventListener('click', () => this.s.onSettings && this.s.onSettings());
    const quit = q('.bk-quit');
    let quitTimer = 0;
    const setQuit = on => { quit.classList.toggle('confirm', on); clearTimeout(quitTimer); if (on) quitTimer = setTimeout(() => quit.classList.remove('confirm'), 3000); };
    q('.bk-power').addEventListener('click', () => setQuit(true));
    q('.bk-no').addEventListener('click', () => setQuit(false));
    q('.bk-yes').addEventListener('click', () => { setQuit(false); this.s.onQuit && this.s.onQuit(); });
    host.querySelectorAll('.bk-mode').forEach(b => b.addEventListener('click', () => {
      const low = b.dataset.mode === 'low';
      if (low === this.s.low || this.busy) return;
      // isChangingMode: the other row dims while the system switches
      this.busy = true; this.el.classList.add('busy');
      this.set({ low });
      setTimeout(() => { this.busy = false; this.el.classList.remove('busy'); }, 650);
      if (this.s.onChange) this.s.onChange(this.s);
    }));
    this.render();
    document.addEventListener('bk-lang', () => this.render());
  }
  Panel.prototype.set = function (p) { Object.assign(this.s, p); this.render(); };
  Panel.prototype.drawEdge = function () {
    const w = this.el.offsetWidth, h = this.el.offsetHeight, dark = this.s.theme !== 'light';
    if (!w || !h) return;
    const liquid = this.effMaterial() === 'liquid';
    const id = 'bke' + (this.eid || (this.eid = ++gid));
    this.edge.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.edge.innerHTML = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${h}">
        <stop offset="0" stop-color="#fff" stop-opacity="${dark ? .40 : .60}"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/>
        <stop offset=".70" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${dark ? .20 : .10}"/></linearGradient></defs>
      ${liquid ? `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="21" fill="none" stroke="url(#${id})" stroke-width="1"/>` : ''}
      <rect x=".25" y=".25" width="${w - .5}" height="${h - .5}" rx="21.75" fill="none" stroke="${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'}" stroke-width=".5"/>`;
  };
  // The app swaps glass for Classic under Reduce Transparency. The website keeps the chosen style, because
  // showing the three styles is the point of the demo (Windows reports this setting whenever transparency effects are off).
  Panel.prototype.effMaterial = function () { return this.s.material; };
  Panel.prototype.render = function () {
    const s = this.s, T = APP_TEXT[BK.lang], el = this.el, theme = s.theme;
    el.className = `bk-panel ${theme} ${this.effMaterial()}${this.busy ? ' busy' : ''}`;
    el.style.setProperty('--blue', sys.blue(theme)); el.style.setProperty('--red', sys.red(theme));
    el.querySelectorAll('[data-k]').forEach(n => { n.textContent = T[n.dataset.k]; });
    el.querySelector('.bk-gear').setAttribute('aria-label', T.settings); el.querySelector('.bk-gear').title = T.settings;
    el.querySelector('.bk-power').setAttribute('aria-label', T.quit); el.querySelector('.bk-power').title = T.quit;
    el.querySelector('.bk-yes').setAttribute('aria-label', T.quitConfirm); el.querySelector('.bk-no').setAttribute('aria-label', T.cancel);
    el.querySelectorAll('.bk-mode').forEach(b => {
      const on = (b.dataset.mode === 'low') === s.low;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
      b.style.setProperty('--c', b.dataset.mode === 'low' ? C.pillYellow : 'var(--blue)');
    });
    const remaining = s.charging ? T.untilFull(s.minutes) : (s.level <= 20 ? T.hm(0, 22) : T.hm(4, 12));
    const v = { remaining, health: s.health + '%', cycles: String(s.cycles), temp: s.temp.toFixed(1) + '°C', limit: s.limit + '%' };
    el.querySelectorAll('[data-v]').forEach(n => { n.textContent = v[n.dataset.v]; });
    // hero pill: Low Power beats critical, critical beats charging (heroAccentState)
    const key = s.low ? 'low' : s.level <= 20 ? 'critical' : s.charging ? 'charging' : null;
    const pill = { low: ['leaf', C.pillYellow, T.low], critical: ['warn', C.pillRed, T.critical], charging: ['bolt', C.green, T.charging] }[key];
    const text = pill ? pill[2] : '';
    if (key !== this.pillKey || (this.pillText !== text)) {
      const old = this.pillSlot.querySelector('.bk-pill:not(.out)');
      if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 260); }
      if (pill) {
        const n = document.createElement('span');
        n.className = 'bk-pill in'; n.style.setProperty('--c', pill[1]);
        n.innerHTML = `${icon(pill[0])}<span>${pill[2]}</span>`;
        this.pillSlot.appendChild(n);
        requestAnimationFrame(() => requestAnimationFrame(() => n.classList.remove('in')));
      }
      this.pillKey = key; this.pillText = text;
    }
    this.glyph.set({ level: s.level, charging: s.charging, low: s.low, theme });
    this.drawEdge();
  };
  BK.panel = (host, opts) => new Panel(host, opts);

  /* ---------- settings tiles (SettingsTilePicker + its previews) ---------- */
  const bars = tint => `<i class="bar a" style="background:${tint}"></i><i class="bar b" style="background:${tint}"></i>`;
  BK.preview = {
    theme(mode) {
      const sun = `<span class="ti-ic" style="color:#ffbd00">${icon('sun')}</span>`, moon = `<span class="ti-ic" style="color:#a8c7ff">${icon('moon')}</span>`;
      if (mode === 'system') return `<div class="tp tp-theme light half-a"><div class="tl">${sun}${bars('#000')}</div></div>
        <div class="tp tp-theme dark half-b"><div class="br">${bars('#fff')}<div class="row"><i class="bar c" style="background:#fff"></i>${moon}</div></div></div>`;
      const l = mode === 'light', tint = l ? '#000' : '#fff';
      return `<div class="tp tp-theme ${mode}"><div class="tl">${bars(tint)}</div><div class="bl"><span class="ti-ic" style="color:${l ? '#ffbd00' : '#a8c7ff'}">${icon(l ? 'sun' : 'moon')}</span><i class="bar c" style="background:${tint}"></i></div></div>`;
    },
    panel(style) {
      const tint = style === 'classic' ? 'var(--tp-ink)' : '#fff';
      return `<div class="tp tp-wall"><div class="tp-glass ${style}"></div>
        <div class="tp-mini"><div>${bars(tint)}</div><div class="row"><i class="dot"></i><i class="bar c" style="background:${tint}"></i></div></div></div>`;
    },
    tray(style) { return `<div class="tp tp-tray"><div class="tg" data-tray="${style}"></div></div>`; },
    anim(style) { return `<div class="tp tp-tray"><div class="tg" data-anim="${style}"></div></div>`; },
  };
  BK.tiles = function (host, { options, value, onChange }) {
    host.classList.add('bk-tiles');
    host.setAttribute('role', 'radiogroup');
    host.innerHTML = options.map(o => `<button type="button" class="bk-tile" role="radio" data-v="${o.value}">
      <span class="bk-tile-pv">${o.preview}</span><span class="bk-tile-l" data-i18n="${o.label}">${BK.t(o.label)}</span></button>`).join('');
    const sync = v => host.querySelectorAll('.bk-tile').forEach(b => { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
    host.addEventListener('click', e => { const b = e.target.closest('.bk-tile'); if (!b) return; sync(b.dataset.v); onChange && onChange(b.dataset.v); });
    sync(value);
    // live glyphs inside tray / animation previews
    host.querySelectorAll('[data-tray]').forEach(g => BK.glyph(g, { style: g.dataset.tray, level: 72, color: C.green, number: false, charging: false, blink: false }));
    host.querySelectorAll('[data-anim]').forEach(g => BK.glyph(g, { level: 35, color: C.green, number: false, charging: true, anim: g.dataset.anim, period: 2, blink: false }));
    return { set: sync };
  };

  /* ---------- CSS for glyph, panel and tiles ---------- */
  const css = `
  .bk-i{display:block;width:100%;height:100%}
  .bk-glyph{display:block;width:100%;height:auto;overflow:visible}
  .bk-glyph .num{font:700 11px "SF Pro Rounded",ui-rounded,-apple-system,BlinkMacSystemFont,system-ui,sans-serif;font-variant-numeric:tabular-nums;fill:#000}

  .bk-panel{--fg:rgba(255,255,255,.85);--fg2:rgba(255,255,255,.55);--card:rgba(255,255,255,.05);--cardB:rgba(255,255,255,.06);
    --btn:rgba(255,255,255,.16);--btnB:rgba(255,255,255,.18);--div:rgba(255,255,255,.07);--hl:255,255,255;
    position:relative;width:320px;max-width:100%;height:608px;border-radius:22px;overflow:hidden;color:var(--fg);
    font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;text-align:left;letter-spacing:0;
    box-shadow:0 0 0 .5px rgba(0,0,0,.22),0 14px 44px rgba(0,0,0,.34),0 2px 8px rgba(0,0,0,.14)}
  .bk-panel.light{--fg:rgba(0,0,0,.85);--fg2:rgba(0,0,0,.5);--card:rgba(255,255,255,.72);--cardB:rgba(0,0,0,.06);
    --btn:rgba(0,0,0,.07);--btnB:rgba(0,0,0,.10);--div:rgba(0,0,0,.07);--hl:0,0,0;box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 14px 44px rgba(0,0,0,.22),0 2px 8px rgba(0,0,0,.08)}
  .bk-bg{position:absolute;inset:0;border-radius:inherit}
  .bk-bg:before,.bk-bg:after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none}
  /* Frosted: .popover material + a soft white veil from the top */
  .bk-panel.frosted.dark .bk-bg{background:rgba(42,42,46,.70);-webkit-backdrop-filter:blur(26px) saturate(1.6);backdrop-filter:blur(26px) saturate(1.6)}
  .bk-panel.frosted.light .bk-bg{background:rgba(244,244,246,.70);-webkit-backdrop-filter:blur(26px) saturate(1.6);backdrop-filter:blur(26px) saturate(1.6)}
  .bk-panel.frosted.dark .bk-bg:before{background:linear-gradient(rgba(255,255,255,.06),rgba(255,255,255,0))}
  .bk-panel.frosted.light .bk-bg:before{background:linear-gradient(rgba(255,255,255,.18),rgba(255,255,255,0))}
  /* Liquid: .fullScreenUI (much clearer), thin top sheen, bottom vignette, light lip drawn in the edge svg */
  .bk-panel.liquid.dark .bk-bg{background:rgba(22,22,26,.40);-webkit-backdrop-filter:blur(18px) saturate(2) brightness(.86);backdrop-filter:blur(18px) saturate(2) brightness(.86)}
  .bk-panel.liquid.light .bk-bg{background:rgba(255,255,255,.26);-webkit-backdrop-filter:blur(18px) saturate(1.9) brightness(1.08);backdrop-filter:blur(18px) saturate(1.9) brightness(1.08)}
  .bk-panel.liquid.dark .bk-bg:before{background:linear-gradient(rgba(255,255,255,.08),rgba(255,255,255,0) 12%)}
  .bk-panel.liquid.light .bk-bg:before{background:linear-gradient(rgba(255,255,255,.14),rgba(255,255,255,0) 12%)}
  .bk-panel.liquid.dark .bk-bg:after{background:linear-gradient(rgba(0,0,0,0) 80%,rgba(0,0,0,.10))}
  .bk-panel.liquid.light .bk-bg:after{background:linear-gradient(rgba(0,0,0,0) 80%,rgba(0,0,0,.05))}
  /* Classic: window background colour, no glass */
  .bk-panel.classic.dark .bk-bg{background:#262626}.bk-panel.classic.light .bk-bg{background:#ececec}
  .bk-edge{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}
  .bk-in{position:relative;z-index:1;height:100%;display:flex;flex-direction:column}
  .bk-tb{display:flex;justify-content:space-between;align-items:center;padding:16px 16px 0}
  .bk-ib{all:unset;box-sizing:border-box;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:var(--fg);cursor:pointer;
    background:var(--btn);box-shadow:inset 0 0 0 .5px var(--btnB);transition:transform .18s,opacity .18s,background .18s}
  .bk-ib:active{transform:scale(.92)}
  .bk-ib:focus-visible{outline:2px solid var(--blue);outline-offset:2px}
  .bk-ib .bk-i{width:15px;height:15px}
  .bk-quit{display:flex;gap:6px;position:relative;height:28px}
  .bk-quit .bk-yes,.bk-quit .bk-no{display:none}
  .bk-quit.confirm .bk-power{display:none}
  .bk-quit.confirm .bk-yes,.bk-quit.confirm .bk-no{display:grid;animation:bk-in .3s cubic-bezier(.2,.9,.3,1)}
  .bk-yes{background:${'#ff3b30'};box-shadow:none;color:#fff}
  .bk-no .bk-i{width:12px;height:12px}.bk-yes .bk-i{width:14px;height:14px}
  .bk-hero{display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 0 8px}
  .bk-hg{width:124px;height:91px;display:flex;align-items:center}
  .bk-pill-slot{height:24px;display:grid;place-items:center}
  .bk-pill-slot > *{grid-area:1/1}
  .bk-pill{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:12px;color:var(--c);white-space:nowrap;
    font:600 12px/1 -apple-system,BlinkMacSystemFont,system-ui,"Segoe UI",sans-serif;
    background:color-mix(in srgb,var(--c) 15%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 30%,transparent);
    transition:opacity .26s,transform .36s cubic-bezier(.2,.9,.3,1)}
  .bk-pill .bk-i{width:11px;height:11px}
  .bk-pill.in,.bk-pill.out{opacity:0;transform:scale(.9)}
  .bk-cards{display:flex;flex-direction:column;gap:12px;padding:12px 16px 0}
  .bk-sech{margin:0 0 8px;padding-left:4px;font:600 11px/13px -apple-system,BlinkMacSystemFont,system-ui,"Segoe UI",sans-serif;letter-spacing:.6px;text-transform:uppercase;color:var(--fg2)}
  .bk-card{border-radius:12px;background:var(--card);box-shadow:inset 0 0 0 .5px var(--cardB);overflow:hidden}
  .bk-row{all:unset;box-sizing:border-box;width:100%;height:48px;display:flex;align-items:center;gap:12px;padding:0 12px;
    font:500 13px/16px -apple-system,BlinkMacSystemFont,system-ui,"Segoe UI",sans-serif}
  button.bk-row{cursor:pointer;transition:background .18s,opacity .18s}
  button.bk-row:hover{background:rgba(var(--hl),.04)}button.bk-row:active{background:rgba(var(--hl),.08)}
  button.bk-row:focus-visible{outline:2px solid var(--blue);outline-offset:-2px;border-radius:12px}
  .bk-panel.busy .bk-mode:not(.on){opacity:.5}
  .bk-badge{width:28px;height:28px;border-radius:6.5px;flex:none;display:grid;place-items:center}
  .bk-badge.t{color:var(--c);background:color-mix(in srgb,var(--c) 18%,transparent)}
  .bk-badge.f{color:#fff;background:var(--c)}
  .bk-badge .bk-i{width:15px;height:15px}
  .bk-mode .bk-badge{--c:inherit}
  .bk-mode[data-mode="auto"] .bk-badge{--c:var(--blue)}.bk-mode[data-mode="low"] .bk-badge{--c:${C.pillYellow}}
  .b-clock{--c:var(--blue)}.b-temp{--c:var(--red)}
  .bk-rt{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--fg)}
  .bk-rv{color:var(--fg2);font-variant-numeric:tabular-nums;white-space:nowrap}
  .bk-chk{width:13px;height:13px;color:var(--c);opacity:0;transform:scale(.7);transition:opacity .2s,transform .36s cubic-bezier(.3,1.25,.5,1)}
  .bk-mode.on .bk-chk{opacity:1;transform:none}
  .bk-div{height:.5px;background:var(--div);margin-left:52px}
  @keyframes bk-in{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.bk-pill,.bk-chk,.bk-ib{transition:none}.bk-quit.confirm .bk-yes,.bk-quit.confirm .bk-no{animation:none}}

  .bk-tiles{display:flex;gap:12px}
  .bk-tile{all:unset;box-sizing:border-box;flex:1;min-width:0;display:flex;flex-direction:column;align-items:stretch;gap:8px;padding:4px 0;cursor:pointer;text-align:center}
  .bk-tile-pv{position:relative;height:64px;border-radius:8px;overflow:hidden;box-shadow:inset 0 0 0 .5px var(--tile-line,rgba(255,255,255,.1));
    transition:transform .36s cubic-bezier(.3,1.25,.5,1),box-shadow .25s}
  .bk-tile.on .bk-tile-pv{transform:scale(1.02);box-shadow:inset 0 0 0 2px ${C.appearance},0 2px 6px color-mix(in srgb,${C.appearance} 25%,transparent)}
  .bk-tile-pv:after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inherit;pointer-events:none;z-index:3}
  .bk-tile-l{font:500 11px/1.2 -apple-system,BlinkMacSystemFont,system-ui,"Segoe UI",sans-serif;color:var(--tile-fg2,rgba(255,255,255,.55));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bk-tile.on .bk-tile-l{font-weight:600;color:var(--tile-fg,rgba(255,255,255,.85))}
  .bk-tile:focus-visible .bk-tile-pv{outline:2px solid ${C.appearance};outline-offset:2px}
  .tp{position:absolute;inset:0}
  .tp i{display:block;border-radius:2px}
  .tp .bar.a{width:28px;height:4px;opacity:.65}.tp .bar.b{width:44px;height:3px;opacity:.35}.tp .bar.c{flex:1;height:3px;border-radius:1.5px;opacity:.4}
  .tp .row{display:flex;align-items:center;gap:4px}
  .tp .ti-ic{width:10px;height:10px;display:block}
  .tp-theme.light{background:linear-gradient(#f0f0f0,#dedede)}.tp-theme.dark{background:linear-gradient(#1f1f24,#0a0a0d)}
  .tp-theme .tl{position:absolute;left:12px;top:12px;display:flex;flex-direction:column;gap:4px}
  .tp-theme .bl{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;gap:4px}
  .tp-theme .br{position:absolute;right:12px;bottom:12px;display:flex;flex-direction:column;align-items:flex-end;gap:4px;width:44px}
  .tp-theme .br .row{width:100%}
  .tp-theme.half-a{clip-path:polygon(0 0,100% 0,0 100%)}.tp-theme.half-b{clip-path:polygon(100% 0,100% 100%,0 100%)}
  .tp-theme.half-a .tl .ti-ic{margin-bottom:2px}
  .tp-wall{background:linear-gradient(135deg,#5273eb,#9e4dc7)}
  .tp-glass{position:absolute;inset:8px;border-radius:8px}
  .tp-glass.frosted{background:linear-gradient(rgba(255,255,255,var(--tp-hi,.08)),rgba(255,255,255,0) 50%),var(--tp-frost,rgba(64,64,64,.6));box-shadow:inset 0 0 0 .5px var(--tp-frost-line,rgba(255,255,255,.14))}
  .tp-glass.liquid{background:linear-gradient(rgba(255,255,255,.10),rgba(255,255,255,0) 8%);box-shadow:inset 0 1px 0 rgba(255,255,255,.65),inset 0 -1px 0 rgba(0,0,0,.2)}
  .tp-glass.classic{inset:0;border-radius:0;background:var(--tp-classic,#0b0b0d)}
  .tp-mini{position:absolute;inset:14px;display:flex;flex-direction:column;justify-content:space-between}
  .tp-mini > div:first-child{display:flex;flex-direction:column;gap:4px}
  .tp-mini .bar.a{width:30px}.tp-mini .bar.b{width:46px}
  .tp-mini .dot{width:6px;height:6px;border-radius:50%;background:${C.green}}
  .tp-tray{background:var(--tp-tray,linear-gradient(#2e2e2e,#1a1a1a));display:grid;place-items:center}
  .tp-tray .tg{width:46px}
  .bk-light-tiles{--tile-line:rgba(0,0,0,.1);--tile-fg:rgba(0,0,0,.85);--tile-fg2:rgba(0,0,0,.5);--tp-ink:#000;--tp-classic:#fff;--tp-frost:rgba(242,242,242,.72);--tp-frost-line:rgba(255,255,255,.28);--tp-hi:.16;--tp-tray:linear-gradient(#f0f0f0,#dedede)}
  .bk-tiles{--tp-ink:#fff}
  @media (prefers-reduced-motion:reduce){.bk-tile-pv{transition:none}}`;

  BK.init = function (dict) {
    DICT = dict;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    injectSprite();
    document.addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b) BK.setLang(b.dataset.lang, true); });
    BK.setLang(BK.lang, false);
  };
  window.BK = BK;
})();
