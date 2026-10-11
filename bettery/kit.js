/* Bettery web kit — tray glyph, tray panel and DE/EN switching, rebuilt from the Swift app.
   Geometry and colours mirror BatteryIconRenderer.swift, BatteryPanelView.swift and BetteryDesign.swift. */
(function () {
  const C = {
    green: '#33c759', yellow: '#ffcc00', yellowPill: '#ffc700', red: '#ff453a', redPill: '#ff4d45',
    rose: '#fa6bb8', violet: '#8c7af2', teal: '#33b39e',
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- icons (SF Symbol look-alikes) ---------- */
  function gearPath() {
    const pts = [], N = 8, ro = 10.4, rr = 7.9;
    for (let i = 0; i < N; i++) {
      const c = i * 360 / N - 90;
      for (const [a, r] of [[-15, rr], [-8.5, ro], [8.5, ro], [15, rr]]) {
        const rad = (c + a) * Math.PI / 180; pts.push([12 + r * Math.cos(rad), 12 + r * Math.sin(rad)]);
      }
    }
    const h = 4.1;
    return 'M' + pts.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + 'Z' +
      `M${12 + h} 12A${h} ${h} 0 1 0 ${12 - h} 12A${h} ${h} 0 1 0 ${12 + h} 12Z`;
  }
  const SYMBOLS = {
    gear: `<path d="${gearPath()}" fill="currentColor" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill-rule="evenodd"/>`,
    power: '<g fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M12 3.4v7.4"/><path d="M7.3 6.4a7.3 7.3 0 1 0 9.4 0"/></g>',
    bolt: '<path fill="currentColor" d="M13.6 2.2 5.4 13.1c-.3.4 0 .9.5.9h5.2l-1.6 7.4c-.1.6.6.9 1 .4l8.2-10.9c.3-.4 0-.9-.5-.9h-5.2l1.6-7.4c.1-.6-.6-.9-1-.4z"/>',
    leaf: '<path fill="currentColor" d="M20.9 3.3c-.3-.2-.7-.2-1.1-.2C10.7 3.6 4.7 7.5 4.7 13.7c0 1.6.4 3.1 1.2 4.3-.8.9-1.5 1.9-2 2.9a.9.9 0 0 0 1.6.8c.4-.8 1-1.6 1.6-2.4 1.2 1 2.8 1.5 4.6 1.5 6.3 0 9.3-5.6 9.6-16.6 0-.4-.1-.7-.4-.9zM8.4 17.1c2-2.6 4.6-4.8 7.6-6.4.4-.2.6-.7.4-1.2-.2-.4-.8-.6-1.2-.4-3.2 1.7-6 4-8.1 6.8-.3-.7-.5-1.4-.5-2.2 0-1.1.3-2.2.8-3.1"/>',
    warn: '<path fill="currentColor" fill-rule="evenodd" d="M10.3 3.6a2 2 0 0 1 3.4 0l8.3 14.4a2 2 0 0 1-1.7 3H3.7a2 2 0 0 1-1.7-3zM12 8.2a1.05 1.05 0 0 0-1.05 1.1l.27 5.3a.78.78 0 0 0 1.56 0l.27-5.3A1.05 1.05 0 0 0 12 8.2zm0 8.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/>',
    batt: '<rect x="2.4" y="7.1" width="17" height="9.8" rx="2.9" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="4.3" y="9" width="13.2" height="6" rx="1.35" fill="currentColor"/><path fill="currentColor" d="M20.6 10.2h.5a1 1 0 0 1 1 1v1.6a1 1 0 0 1-1 1h-.5z"/>',
    check: '<path d="M4.6 12.9l4.6 4.6L19.4 6.9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    clock: '<path fill="currentColor" fill-rule="evenodd" d="M12 2.4a9.6 9.6 0 1 1 0 19.2 9.6 9.6 0 0 1 0-19.2zM11.05 6.4v6.3c0 .52.43.95.95.95h4.6a.95.95 0 0 0 0-1.9h-3.65V6.4a.95.95 0 0 0-1.9 0z"/>',
    heart: '<path fill="currentColor" d="M12 20.7c-.3 0-.6-.1-.8-.3C7.3 17.6 2.8 14 2.8 9.5 2.8 6.6 5 4.3 7.9 4.3c1.7 0 3.2.8 4.1 2.2.9-1.4 2.4-2.2 4.1-2.2 2.9 0 5.1 2.3 5.1 5.2 0 4.5-4.5 8.1-8.4 10.9-.2.2-.5.3-.8.3z"/>',
    cycle: '<g fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M4.9 12.2a7.1 7.1 0 0 1 12.2-5"/><path d="M19.1 11.8a7.1 7.1 0 0 1-12.2 5"/></g><path fill="currentColor" stroke="currentColor" stroke-width=".9" stroke-linejoin="round" d="M19.5 3.6v5.6h-5.6z"/><path fill="currentColor" stroke="currentColor" stroke-width=".9" stroke-linejoin="round" d="M4.5 20.4v-5.6h5.6z"/>',
    thermo: '<path d="M9.7 13.4V5.1a2.3 2.3 0 0 1 4.6 0v8.3a4.3 4.3 0 1 1-4.6 0z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="16.9" r="2.1" fill="currentColor"/><path d="M12 9.6v7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    shield: '<path d="M12 2.7l7.3 2.8v5.8c0 4.9-3.1 8.5-7.3 9.9-4.2-1.4-7.3-5-7.3-9.9V5.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path fill="currentColor" d="M12 4.6 6.6 6.7v5h5.4zM12 11.7h5.4c-.3 3.6-2.4 6.2-5.4 7.6z"/>',
    wifi: '<g fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M3.1 9.4a12.8 12.8 0 0 1 17.8 0"/><path d="M6.3 12.8a8.2 8.2 0 0 1 11.4 0"/><path d="M9.5 16.1a3.6 3.6 0 0 1 5 0"/></g><circle cx="12" cy="19.2" r="1.45" fill="currentColor"/>',
    cc: '<g fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4.4" width="18" height="6.6" rx="3.3"/><rect x="3" y="13" width="18" height="6.6" rx="3.3"/></g><circle cx="17.7" cy="7.7" r="2" fill="currentColor"/><circle cx="6.3" cy="16.3" r="2" fill="currentColor"/>',
    globe: '<g fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3.4 9h17.2M3.4 15h17.2"/></g>',
    sun: '<circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></g>',
    moon: '<path fill="currentColor" d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a.6.6 0 0 0-.8-.7A9.4 9.4 0 1 0 20.9 15.4a.6.6 0 0 0-.7-.8z"/>',
    sparkles: '<path fill="currentColor" d="M10 3.5l1.6 4.4 4.4 1.6-4.4 1.6L10 15.5l-1.6-4.4L4 9.5l4.4-1.6zM17.5 13l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z"/>',
    apple: '<path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/>',
  };
  function injectSprite() {
    if (document.getElementById('bk-sprite')) return;
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.id = 'bk-sprite'; s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    s.innerHTML = '<defs>' + Object.entries(SYMBOLS).map(([k, v]) => `<symbol id="bk-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('') + '</defs>';
    document.body.prepend(s);
  }
  const icon = id => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#bk-${id}"/></svg>`;

  /* ---------- language: German browsers get DE, everyone else EN ---------- */
  const PANEL_TEXT = {
    de: { settings: 'Einstellungen', quit: 'Bettery beenden', charging: 'Wird geladen', low: 'Stromsparmodus', critical: 'Kritischer Akkustand',
      energy: 'Energiemodus', auto: 'Automatisch', lowpower: 'Leistung reduzieren', details: 'Details', remaining: 'Verbleibend',
      health: 'Zustand', cycles: 'Zyklen', temp: 'Temperatur', limit: 'Ladelimit', untilFull: n => `${n} min bis voll` },
    en: { settings: 'Settings', quit: 'Quit Bettery', charging: 'Charging', low: 'Low Power Mode', critical: 'Critical Battery',
      energy: 'Energy Mode', auto: 'Automatic', lowpower: 'Low Power', details: 'Details', remaining: 'Remaining',
      health: 'Health', cycles: 'Cycles', temp: 'Temperature', limit: 'Charge Limit', untilFull: n => `${n} min until full` },
  };
  function detectLang() {
    try { const s = localStorage.getItem('bettery-lang'); if (s === 'de' || s === 'en') return s; } catch (e) { }
    const l = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    return l.startsWith('de') ? 'de' : 'en';
  }
  let DICT = { de: {}, en: {} };
  const BK = { C, icon, lang: detectLang(), reduced };
  BK.t = k => (DICT[BK.lang] && DICT[BK.lang][k]) ?? k;
  BK.setLang = function (l, remember) {
    BK.lang = l;
    document.documentElement.lang = l;
    if (remember) { try { localStorage.setItem('bettery-lang', l); } catch (e) { } }
    document.querySelectorAll('[data-i18n]').forEach(el => { const v = DICT[l][el.dataset.i18n]; if (v !== undefined) el.innerHTML = v; });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { const v = DICT[l][el.dataset.i18nAria]; if (v !== undefined) el.setAttribute('aria-label', v); });
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    if (DICT[l]._title) document.title = DICT[l]._title;
    panels.forEach(p => p.render());
    document.dispatchEvent(new CustomEvent('bk-lang', { detail: l }));
  };

  /* ---------- glyph: the battery pill with the number inside ---------- */
  const glyphs = [];
  let gid = 0;
  function Glyph(host, opts = {}) {
    const n = ++gid;
    this.o = Object.assign({ level: 76, charging: false, low: false, style: 'fill', anim: 'bounce', theme: 'dark', number: true }, opts);
    host.innerHTML = `<svg class="bk-glyph" viewBox="0 0 29 22" role="img" aria-label="">
      <defs><clipPath id="bkc${n}"><rect x=".5" y="4.5" width="26" height="13" rx="4"/></clipPath>
      <linearGradient id="bks${n}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <path class="tip" d="M27.5 9H28.15A1.1 1.1 0 0 1 29.25 10.1V11.9A1.1 1.1 0 0 1 28.15 13H27.5Z"/>
      <rect class="trk" x=".5" y="4.5" width="26" height="13" rx="4"/>
      <g clip-path="url(#bkc${n})"><rect class="fil" x=".5" y="4.5" width="0" height="13"/><rect class="sh" x="0" y="4.5" width="0" height="13" fill="url(#bks${n})"/></g>
      <text class="num" x="13.5" y="11.35" text-anchor="middle" dominant-baseline="central">76</text></svg>`;
    this.svg = host.firstElementChild;
    this.trk = this.svg.querySelector('.trk'); this.fil = this.svg.querySelector('.fil');
    this.sh = this.svg.querySelector('.sh'); this.num = this.svg.querySelector('.num'); this.tip = this.svg.querySelector('.tip');
    this.shown = this.o.level; this.t0 = performance.now();
    glyphs.push(this); kick();
  }
  Glyph.prototype.set = function (p) {
    const wasCharging = this.o.charging;
    Object.assign(this.o, p);
    if (this.o.charging && !wasCharging) this.t0 = performance.now();
    kick();
  };
  Glyph.prototype.color = function () {
    const o = this.o;
    if (o.color) return o.color;
    if (o.charging) return C.green;
    if (o.low) return C.yellow;
    if (o.level <= 20) return C.red;
    return o.theme === 'light' ? '#b4b4b9' : '#e6e6e6';
  };
  Glyph.prototype.draw = function (now) {
    const o = this.o, light = o.theme === 'light';
    let lv = o.level, live = false;
    const t = (now - this.t0) / 1000;
    if (o.charging && o.anim !== 'off' && !reduced.matches && o.level < 100) {
      live = true;
      if (o.anim === 'bounce') { const ph = (t % 3) / 3; lv = o.level + (100 - o.level) * (1 - Math.cos(ph * 2 * Math.PI)) / 2; }
      else { const ph = (t % 2.4) / 2.4; lv = o.level + (100 - o.level) * Math.min(1, ph / .85); }
    }
    const col = this.color();
    const solid = o.style === 'solid';
    this.trk.setAttribute('fill', solid ? col : (light ? 'rgba(0,0,0,.16)' : 'rgba(255,255,255,.34)'));
    this.fil.setAttribute('fill', col);
    this.fil.setAttribute('width', solid ? 26 : (26 * Math.max(0, Math.min(1, lv / 100))).toFixed(3));
    this.tip.setAttribute('fill', solid ? col : (light ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.5)'));
    this.num.setAttribute('fill', '#000');
    this.num.style.display = o.number ? '' : 'none';
    this.num.textContent = Math.round(o.level);
    // critical blink (0.7 s) and low-power eco shimmer (2.8 s), as in the panel hero
    let op = 1;
    if (o.blink && !o.charging && o.level <= 20 && !reduced.matches) { live = true; const w = .5 + .5 * Math.sin(now / 1000 * 2 * Math.PI / .7); op = .25 + .75 * Math.pow(w, .25); }
    this.fil.setAttribute('opacity', op.toFixed(3));
    if (o.shimmer && o.low && !o.charging && !reduced.matches) {
      live = true;
      const ph = ((now / 1000) % 2.8) / 2.8, fw = solid ? 26 : 26 * lv / 100, bw = Math.max(fw * .38, .8);
      this.sh.setAttribute('x', (.5 + fw - ph * (fw + bw)).toFixed(3)); this.sh.setAttribute('width', bw.toFixed(3));
    } else this.sh.setAttribute('width', '0');
    this.svg.setAttribute('aria-label', `${Math.round(o.level)} %`);
    return live;
  };
  let raf = 0;
  function frame(now) {
    raf = 0; let live = false;
    for (let i = glyphs.length - 1; i >= 0; i--) if (!glyphs[i].svg.isConnected) glyphs.splice(i, 1);
    for (const g of glyphs) if (g.draw(now)) live = true;
    if (live) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  BK.glyph = (host, opts) => new Glyph(host, opts);

  /* ---------- panel: the tray popup ---------- */
  const panels = [];
  function Panel(host, opts = {}) {
    this.host = host;
    this.s = Object.assign({ level: 76, charging: true, low: false, theme: 'dark', material: 'liquid', minutes: 18, onChange: null }, opts);
    panels.push(this); this.render();
  }
  Panel.prototype.set = function (p) { Object.assign(this.s, p); this.render(); };
  Panel.prototype.render = function () {
    const s = this.s, T = PANEL_TEXT[BK.lang];
    const critical = !s.charging && s.level <= 20;
    const remaining = s.charging ? T.untilFull(s.minutes) : (critical ? '0h 22min' : '4h 12min');
    const pill = s.charging ? ['bolt', C.green, T.charging] : s.low ? ['leaf', C.yellowPill, T.low] : critical ? ['warn', C.redPill, T.critical] : null;
    const rows = [
      ['clock', 'var(--p-blue)', T.remaining, remaining], ['heart', C.rose, T.health, '94 %'], ['cycle', C.violet, T.cycles, '212'],
      ['thermo', 'var(--p-red)', T.temp, (BK.lang === 'de' ? '31,4' : '31.4') + ' °C'], ['shield', C.teal, T.limit, '80 %'],
    ];
    this.host.innerHTML = `<div class="bk-panel ${s.theme} ${s.material}">
      <div class="bk-tb"><span class="bk-ib" title="${T.settings}">${icon('gear')}</span><span class="bk-ib" title="${T.quit}">${icon('power')}</span></div>
      <div class="bk-hero"><div class="bk-hg"></div>
        <div class="bk-pill-slot">${pill ? `<span class="bk-pill" style="--c:${pill[1]}">${icon(pill[0])}<span>${pill[2]}</span></span>` : ''}</div></div>
      <div class="bk-sech">${T.energy}</div>
      <div class="bk-card bk-energy">
        <button type="button" class="bk-row bk-mode" data-mode="auto"><span class="bk-badge" style="--c:var(--p-blue)">${icon('batt')}</span><span class="bk-rt">${T.auto}</span>${!s.low ? `<span class="bk-chk" style="--c:var(--p-blue)">${icon('check')}</span>` : ''}</button>
        <div class="bk-div"></div>
        <button type="button" class="bk-row bk-mode" data-mode="low"><span class="bk-badge" style="--c:${C.yellowPill}">${icon('leaf')}</span><span class="bk-rt">${T.lowpower}</span>${s.low ? `<span class="bk-chk" style="--c:${C.yellowPill}">${icon('check')}</span>` : ''}</button>
      </div>
      <div class="bk-sech">${T.details}</div>
      <div class="bk-card bk-details">${rows.map(([ic, c, t, v], i) => `${i ? '<div class="bk-div"></div>' : ''}<div class="bk-row"><span class="bk-badge" style="--c:${c}">${icon(ic)}</span><span class="bk-rt">${t}</span><span class="bk-rv">${v}</span></div>`).join('')}</div>
    </div>`;
    const g = BK.glyph(this.host.querySelector('.bk-hg'), { level: s.level, charging: s.charging, low: s.low, theme: s.theme, blink: true, shimmer: true });
    this.glyph = g;
    this.host.querySelectorAll('.bk-mode').forEach(b => b.addEventListener('click', () => {
      this.set({ low: b.dataset.mode === 'low' });
      if (s.onChange) s.onChange(this.s);
    }));
  };
  BK.panel = (host, opts) => new Panel(host, opts);

  /* ---------- shared CSS for glyph + panel ---------- */
  const css = `
  .bk-glyph{display:block;width:100%;height:auto;overflow:visible}
  .bk-glyph .num{font:700 10.6px "SF Pro Rounded",ui-rounded,-apple-system,system-ui,sans-serif;font-variant-numeric:tabular-nums;letter-spacing:-.2px}
  .bk-panel{--p-fg:rgba(255,255,255,.93);--p-fg2:rgba(235,235,245,.6);--p-card:rgba(255,255,255,.06);--p-cardB:rgba(255,255,255,.08);--p-btn:rgba(255,255,255,.16);--p-btnB:rgba(255,255,255,.18);--p-div:rgba(255,255,255,.09);--p-blue:#0a84ff;--p-red:#ff453a;--p-hl:255,255,255;
    position:relative;width:320px;border-radius:22px;padding:16px 16px 18px;color:var(--p-fg);overflow:hidden;isolation:isolate;
    font-family:"SF Pro Text",-apple-system,BlinkMacSystemFont,system-ui,"Helvetica Neue",sans-serif;-webkit-font-smoothing:antialiased;text-align:left;
    box-shadow:0 24px 64px rgba(0,0,0,.36),0 2px 8px rgba(0,0,0,.16)}
  .bk-panel.light{--p-fg:rgba(0,0,0,.86);--p-fg2:rgba(60,60,67,.62);--p-card:rgba(255,255,255,.72);--p-cardB:rgba(0,0,0,.06);--p-btn:rgba(0,0,0,.07);--p-btnB:rgba(0,0,0,.10);--p-div:rgba(0,0,0,.08);--p-blue:#007aff;--p-red:#ff3b30;--p-hl:0,0,0}
  .bk-panel.liquid.dark{background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,0) 13%),linear-gradient(0deg,rgba(0,0,0,.10),rgba(0,0,0,0) 20%),rgba(24,24,30,.42);backdrop-filter:blur(30px) saturate(1.9) brightness(.8);-webkit-backdrop-filter:blur(30px) saturate(1.9) brightness(.8)}
  .bk-panel.liquid.light{background:linear-gradient(180deg,rgba(255,255,255,.42),rgba(255,255,255,0) 13%),rgba(255,255,255,.36);backdrop-filter:blur(30px) saturate(1.8) brightness(1.12);-webkit-backdrop-filter:blur(30px) saturate(1.8) brightness(1.12)}
  .bk-panel.frosted.dark{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,0) 30%),rgba(40,40,44,.78);backdrop-filter:blur(46px) saturate(1.5);-webkit-backdrop-filter:blur(46px) saturate(1.5)}
  .bk-panel.frosted.light{background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,0) 30%),rgba(243,243,247,.82);backdrop-filter:blur(46px) saturate(1.5);-webkit-backdrop-filter:blur(46px) saturate(1.5)}
  .bk-panel.classic.dark{background:#242427}.bk-panel.classic.light{background:#ececec}
  .bk-panel:after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;
    background:linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.08) 30%,rgba(255,255,255,0) 60%,rgba(255,255,255,.14));
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
  .bk-panel.frosted:after,.bk-panel.classic:after{background:var(--p-cardB);padding:.6px}
  .bk-tb{display:flex;justify-content:space-between}
  .bk-ib{width:28px;height:28px;border-radius:50%;background:var(--p-btn);box-shadow:inset 0 0 0 .6px var(--p-btnB);display:grid;place-items:center}
  .bk-ib svg{width:14px;height:14px}
  .bk-hero{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:-2px}
  .bk-hg{width:120px}
  .bk-pill-slot{height:24px;display:flex;align-items:center}
  .bk-pill{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:12px;color:var(--c);font:600 12px/1 "SF Pro Rounded",ui-rounded,-apple-system,system-ui,sans-serif;
    background:color-mix(in srgb,var(--c) 15%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 30%,transparent);white-space:nowrap}
  .bk-pill svg{width:11.5px;height:11.5px}
  .bk-sech{font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:var(--p-fg2);padding:0 4px;margin:18px 0 8px}
  .bk-card{border-radius:12px;background:var(--p-card);box-shadow:inset 0 0 0 .6px var(--p-cardB);overflow:hidden}
  .bk-row{all:unset;box-sizing:border-box;width:100%;height:48px;display:flex;align-items:center;gap:12px;padding:0 12px;font-size:13px;font-weight:500;letter-spacing:-.006em}
  button.bk-row{cursor:pointer;transition:background .18s}
  button.bk-row:hover{background:rgba(var(--p-hl),.05)}button.bk-row:active{background:rgba(var(--p-hl),.1)}
  button.bk-row:focus-visible{outline:2px solid var(--p-blue);outline-offset:-2px;border-radius:12px}
  .bk-badge{width:28px;height:28px;border-radius:6.5px;flex:none;display:grid;place-items:center;color:var(--c);background:color-mix(in srgb,var(--c) 18%,transparent)}
  .bk-badge svg{width:15px;height:15px}
  .bk-rt{flex:1;white-space:nowrap;color:var(--p-fg)}
  .bk-rv{color:var(--p-fg2);font-variant-numeric:tabular-nums;white-space:nowrap}
  .bk-chk{width:13px;height:13px;color:var(--c);animation:bk-pop .36s cubic-bezier(.2,.9,.3,1.2)}
  .bk-chk svg{width:13px;height:13px;display:block}
  .bk-div{height:.6px;background:var(--p-div);margin-left:52px}
  @keyframes bk-pop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}
  @media (prefers-reduced-motion:reduce){.bk-chk{animation:none}}
  @media (prefers-reduced-transparency:reduce){.bk-panel.liquid.dark,.bk-panel.frosted.dark{background:#242427;backdrop-filter:none}.bk-panel.liquid.light,.bk-panel.frosted.light{background:#ececec;backdrop-filter:none}}`;

  BK.init = function (dict) {
    DICT = dict;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    injectSprite();
    document.addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b) BK.setLang(b.dataset.lang, true); });
    BK.setLang(BK.lang, false);
  };
  window.BK = BK;
})();
