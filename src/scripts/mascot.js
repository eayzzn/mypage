/* ------------------------------------------------------------
   Glitch — 16×16 pixel mascot
   Rendered into every [data-glitch] element ("full" or "mini").
   States live on [data-state]: idle | hallo | glitch | sleep —
   all motion is CSS (see "Glitch" in styles.css).
   ------------------------------------------------------------ */

(function () {
  const COLORS = { D: '#A9583D', C: '#D97757', L: '#F0B49A', K: '#141413' };

  const BODY = [
    '................',
    '................',
    '......CCCC......',
    '....CCCCCCCC....',
    '...CCLLCCCCCC...',
    '..CCLCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '.CCCCCCCCCCCCCC.',
    '.CCCCCCCCCCCCCC.',
    '.CCCCCCCCCCCCCC.',
    'CCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCC',
    'DCCCCCCCCCCCCCCD',
    'DDCDDCCCCCDDCCDD',
    '.D..D......D....',
    '................',
  ];

  // Melted puddle with closed eyes
  const SLEEP = [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.....CCCCCC.....',
    '...CCLLCCCCCC...',
    '..CCCCCCCCCCCC..',
    '.CCKKCCCCCCKKCC.',
    'CCCCCCCCCCCCCCCC',
    'DDDDDDDDDDDDDDDD',
    '................',
  ];

  // Pixel map → one path per color, horizontal runs merged
  function toPaths(rows) {
    const out = {};
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const key = row[x];
        if (!COLORS[key]) { x++; continue; }
        let run = 1;
        while (row[x + run] === key) run++;
        out[key] = (out[key] || '') + `M${x} ${y}h${run}v1h-${run}z`;
        x += run;
      }
    });
    return out;
  }

  const bodyPaths = toPaths(BODY);
  const sleepPaths = toPaths(SLEEP);
  const silhouette = Object.values(bodyPaths).join('');

  const layer = (paths) => Object.keys(COLORS)
    .filter(key => paths[key])
    .map(key => `<path d="${paths[key]}" fill="${COLORS[key]}"/>`)
    .join('');

  const px = (x, y, w = 1, h = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  const z = (cls) => `<g class="gl-z ${cls}">${px(12, 5, 3)}${px(13, 6)}${px(12, 7, 3)}</g>`;

  function markup(full) {
    const idleFace = `
      <g class="gl-face gl-face-idle" fill="${COLORS.K}">
        <g class="gl-eyes-open">${px(4, 7, 2, 2)}${px(10, 7, 2, 2)}</g>
        <g class="gl-eyes-closed">${px(4, 8, 2)}${px(10, 8, 2)}</g>
        ${full ? px(7, 9, 2) : ''}
      </g>`;

    if (!full) {
      return `<svg class="glitch-svg" viewBox="0 -4 16 20" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
        <g class="gl-awake">${layer(bodyPaths)}${idleFace}</g>
      </svg>`;
    }

    return `<svg class="glitch-svg" viewBox="0 -4 16 20" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
      <path class="gl-split gl-split-a" d="${silhouette}"/>
      <path class="gl-split gl-split-b" d="${silhouette}"/>
      <g class="gl-awake">
        ${layer(bodyPaths)}
        ${idleFace}
        <g class="gl-face gl-face-happy" fill="${COLORS.K}">
          ${px(3, 8)}${px(4, 7)}${px(5, 8)}${px(10, 8)}${px(11, 7)}${px(12, 8)}${px(7, 9, 2, 2)}
        </g>
        <g class="gl-face gl-face-code" fill="${COLORS.K}">
          ${px(3, 7)}${px(4, 8)}${px(3, 9)}
          <rect class="gl-cursor" x="9" y="9" width="3" height="1"/>
        </g>
      </g>
      <g class="gl-asleep">
        <g class="gl-sleep-body">${layer(sleepPaths)}</g>
        ${z('')}${z('gl-z2')}${z('gl-z3')}
      </g>
    </svg>`;
  }

  // Contact scene: "post" (hops with a letter, heart rises) and
  // "send" (types, then launches a paper plane — played once)
  function contactMarkup() {
    const K = COLORS.K;
    const C = COLORS.C;
    return `<svg class="glitch-svg" viewBox="0 -14 44 30" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
      <g transform="translate(6 0)">
        <g class="glc-post">
          ${layer(bodyPaths)}
          <g fill="${K}">${px(4, 6, 2, 2)}${px(10, 6, 2, 2)}</g>
          <rect x="2" y="9" width="12" height="5" fill="#FAF9F5"/>
          <g fill="${C}">${px(2, 9)}${px(3, 10)}${px(4, 11)}${px(5, 12)}${px(6, 13, 4)}${px(10, 12)}${px(11, 11)}${px(12, 10)}${px(13, 9)}</g>
        </g>
        <g class="glc-send">
          ${layer(bodyPaths)}
          <g fill="${K}">${px(3, 7)}${px(4, 8)}${px(3, 9)}<rect class="gl-cursor" x="9" y="9" width="3" height="1"/></g>
        </g>
      </g>
      <!-- 8×6 heart, centred on Glitch (x 6–21 → centre line 14), clear of the hop -->
      <g class="glc-heart" fill="#E5484D">${px(11, -11, 2)}${px(15, -11, 2)}${px(10, -10, 8)}${px(10, -9, 8)}${px(11, -8, 6)}${px(12, -7, 4)}${px(13, -6, 2)}</g>
      <g class="glc-plane">${px(21, 5)}${px(21, 6, 3)}${px(21, 7, 7)}${px(21, 8, 3)}${px(21, 9)}<rect x="22" y="7" width="2" height="1" fill="${C}"/></g>
    </svg>`;
  }

  function render() {
    document.querySelectorAll('[data-glitch]').forEach(el => {
      const type = el.dataset.glitch;
      el.innerHTML = type === 'contact' ? contactMarkup() : markup(type === 'full');
    });
  }

  /* ------------------------------------------------------------
     Behaviour
     - hero: hover/focus → hallo, click → short glitch burst
     - every [data-glitch-auto] falls asleep after a while without
       any interaction and wakes up on the next one
     ------------------------------------------------------------ */
  const SLEEP_AFTER_MS = 45000;
  const BURST_MS = 1200;
  const SEND_MS = 1900;

  // Mail button click → paper plane, then back to hopping with the letter
  function initContact() {
    const scene = document.querySelector('[data-glitch-contact]');
    const mail = document.querySelector('[data-mail-send]');
    if (!scene || !mail) return;
    let timer = null;

    mail.addEventListener('click', () => {
      // Fresh nodes guarantee the one-shot animations start from frame 0
      scene.innerHTML = contactMarkup();
      scene.dataset.state = 'send';
      clearTimeout(timer);
      timer = setTimeout(() => { scene.dataset.state = 'post'; }, SEND_MS);
    });
  }

  function initBehaviour() {
    const auto = [...document.querySelectorAll('[data-glitch-auto]')];
    const hero = document.querySelector('[data-glitch-hero]');
    const heroGlitch = hero?.querySelector('[data-glitch]');
    let hovered = false;
    let bursting = false;
    let burstTimer = null;
    let sleepTimer = null;

    const setState = (el, state) => { if (el) el.dataset.state = state; };
    const restingState = () => (hovered ? 'hallo' : 'idle');

    function wake() {
      clearTimeout(sleepTimer);
      auto.forEach(el => {
        if (el.dataset.state === 'sleep') setState(el, el === heroGlitch ? restingState() : 'idle');
      });
      sleepTimer = setTimeout(() => {
        if (hovered || bursting) return;
        auto.forEach(el => setState(el, 'sleep'));
      }, SLEEP_AFTER_MS);
    }

    ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(evt =>
      window.addEventListener(evt, wake, { passive: true }));
    wake();

    if (!hero || !heroGlitch) return;

    const enter = () => { hovered = true; if (!bursting) setState(heroGlitch, 'hallo'); };
    const leave = () => { hovered = false; if (!bursting) setState(heroGlitch, 'idle'); };

    hero.addEventListener('pointerenter', enter);
    hero.addEventListener('pointerleave', leave);
    hero.addEventListener('focus', enter);
    hero.addEventListener('blur', leave);

    hero.addEventListener('click', () => {
      bursting = true;
      setState(heroGlitch, 'glitch');
      clearTimeout(burstTimer);
      burstTimer = setTimeout(() => {
        bursting = false;
        setState(heroGlitch, restingState());
      }, BURST_MS);
    });
  }

  window.Glitch = {
    // Raw pixel data for custom scenes (e.g. the 404 page)
    colors: COLORS,
    paths: { body: bodyPaths, sleep: sleepPaths, silhouette },
    layer,
    init() {
      render();
      initBehaviour();
      initContact();
    },
  };
})();
