document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initI18n();

  /* ------------------------------------------------------------
     Theme toggle (dark default, light optional, persisted)
     ------------------------------------------------------------ */
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const storedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
  }

  applyTheme(storedTheme || (systemPrefersLight ? 'light' : 'dark'));

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  /* ------------------------------------------------------------
     Navbar + mobile menu
     ------------------------------------------------------------ */
  const navbar = document.querySelector('[data-navbar]');
  const hamburger = document.querySelector('[data-hamburger]');
  const navLinks = document.querySelector('[data-nav-links]');
  const navLinkItems = document.querySelectorAll('.nav-link');
  const navIndicator = document.querySelector('[data-nav-indicator]');
  const sections = document.querySelectorAll('main .snap-section');

  /* ------------------------------------------------------------
     Liquid-glass nav indicator — slides beneath the active link.
     During a programmatic (multi-section) jump, the scroll-spy
     observer fires for every section passed in between, which
     would otherwise yank the indicator through each one. We
     suppress those in-flight updates and snap the indicator
     straight to the destination instead.
     ------------------------------------------------------------ */
  let isProgrammaticScroll = false;
  let programmaticScrollResetTimer = null;

  function endProgrammaticScroll() {
    isProgrammaticScroll = false;
  }

  function beginProgrammaticScroll() {
    isProgrammaticScroll = true;
    clearTimeout(programmaticScrollResetTimer);
    programmaticScrollResetTimer = setTimeout(endProgrammaticScroll, 900);
  }

  document.addEventListener('scrollend', () => {
    if (isProgrammaticScroll) {
      clearTimeout(programmaticScrollResetTimer);
      endProgrammaticScroll();
    }
  });

  function moveIndicatorTo(link, { instant = false } = {}) {
    if (!navIndicator || !link || !navLinks) return;

    // Use layout-box metrics (offsetLeft/offsetWidth) instead of
    // getBoundingClientRect(). The indicator lives inside the same
    // (potentially transformed/scaled) navbar as the link, so any
    // ancestor transform is applied to both automatically — measuring
    // via the rendered/visual rect would double-count that transform
    // and throw the bubble off, especially in the compact state.
    const nextWidth = `${link.offsetWidth}px`;
    const nextX = `${link.offsetLeft}px`;

    if (instant) {
      navIndicator.style.transition = 'none';
      navIndicator.style.width = nextWidth;
      navIndicator.style.transform = `translateX(${nextX})`;
      // Force reflow so the next frame can re-enable transitions cleanly.
      navIndicator.getBoundingClientRect();
      requestAnimationFrame(() => {
        navIndicator.style.transition = '';
      });
      return;
    }

    navIndicator.style.width = nextWidth;
    navIndicator.style.transform = `translateX(${nextX})`;
  }

  function setActiveLink(id, options) {
    let activeLink = null;
    navLinkItems.forEach(link => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
      if (isActive) activeLink = link;
    });
    if (activeLink) moveIndicatorTo(activeLink, options);
  }

  const initialActive = document.querySelector('.nav-link.active') || navLinkItems[0];
  requestAnimationFrame(() => moveIndicatorTo(initialActive, { instant: true }));

  function closeMenu() {
    navLinks?.classList.remove('active');
    hamburger?.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    const isActive = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
  });

  navLinkItems.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.querySelector(link.getAttribute('href'));
      // Suppress scroll-spy mid-flight so the indicator animates once
      // to the destination instead of stepping through every section.
      beginProgrammaticScroll();
      target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      setActiveLink(targetId);
      syncStopIndex(target);
      closeMenu();
      // Drop focus so :focus-within no longer pins the navbar open — it will
      // collapse again on the next scroll (mouse users). Keyboard users keep
      // focus via :focus-visible navigation, which won't reach here.
      if (e.detail !== 0) link.blur();
    });
  });

  /* Hero CTAs + scroll indicator — same animated section jumps as the nav */
  document.querySelectorAll('.hero-actions a[href^="#"], .scroll-indicator[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const target = document.querySelector(href);
      if (!target) return;
      beginProgrammaticScroll();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      setActiveLink(href.slice(1));
      syncStopIndex(target);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  function refreshNavIndicator({ instant = false } = {}) {
    const current = document.querySelector('.nav-link.active');
    if (current) moveIndicatorTo(current, { instant });
  }

  /* ------------------------------------------------------------
     Keep the pill locked to the active link while the navbar
     resizes (compact <-> expanded, via scroll / hover / focus).
     During that ~0.45s the active link's width AND position are
     both animating, so instead of hiding the pill (which flashed
     and drifted with fragile transition-event coordination) we
     disable its own slide transition and re-read the live layout
     geometry every frame for the duration of the resize, then hand
     control back to CSS. This tracks perfectly with no event races.
     ------------------------------------------------------------ */
  const RESIZE_DURATION = 560;
  let trackRaf = null;
  let trackDeadline = 0;

  function trackActiveGeometry() {
    const link = document.querySelector('.nav-link.active');
    if (!link || !navIndicator) return;
    navIndicator.style.width = `${link.offsetWidth}px`;
    navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
  }

  function startIndicatorTracking(duration = RESIZE_DURATION) {
    if (!navIndicator) return;
    trackDeadline = performance.now() + duration;
    if (trackRaf !== null) return;
    // Follow the live geometry exactly — no easing while the box moves.
    navIndicator.style.transition = 'none';
    const step = (now) => {
      trackActiveGeometry();
      if (now < trackDeadline) {
        trackRaf = requestAnimationFrame(step);
        return;
      }
      trackRaf = null;
      trackActiveGeometry();
      // Force a reflow so re-enabling the transition doesn't animate
      // from a stale value on the next active-link change.
      navIndicator.getBoundingClientRect();
      requestAnimationFrame(() => { navIndicator.style.transition = ''; });
    };
    trackRaf = requestAnimationFrame(step);
  }

  // Hover / keyboard-focus expand the compact navbar; track through it.
  ['mouseenter', 'mouseleave', 'focusin', 'focusout'].forEach(evt => {
    navbar?.addEventListener(evt, () => startIndicatorTracking());
  });

  /* Compact navbar once you leave the hero — icons only until hover */
  const scrollIndicator = document.querySelector('.scroll-indicator');
  function syncNavbarCompact() {
    if (!navbar) return;
    const narrow = window.matchMedia('(max-width: 768px)').matches;
    const shouldCompact = !narrow && (window.scrollY > 48 || document.querySelector('#home')?.getBoundingClientRect().bottom < window.innerHeight * 0.55);
    const was = navbar.classList.contains('is-compact');
    navbar.classList.toggle('is-compact', shouldCompact);
    // Hide the "scroll down" hint the moment we leave the hero so it never
    // overlaps content further down the page.
    scrollIndicator?.classList.toggle('is-hidden', shouldCompact || narrow);
    // The compact toggle animates every link's size — track the pill through it.
    if (was !== shouldCompact) startIndicatorTracking();
  }

  window.addEventListener('scroll', syncNavbarCompact, { passive: true });
  window.addEventListener('resize', () => {
    syncNavbarCompact();
    refreshNavIndicator({ instant: true });
  });

  /* ------------------------------------------------------------
     Scroll spy — highlight active nav link per section
     ------------------------------------------------------------ */
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isProgrammaticScroll) {
        setActiveLink(entry.target.getAttribute('id'));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(section => sectionObserver.observe(section));

  /* ------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------ */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ------------------------------------------------------------
     Word-by-word reveal for the philosophy statement
     ------------------------------------------------------------ */
  const wordRevealObservers = new Map();

  function initWordReveal(el) {
    const key = el.dataset.i18n;
    if (!key) return;

    const text = I18n.t(key);
    const wasInView = el.classList.contains('in-view');
    const words = text.trim().split(/\s+/);
    el.innerHTML = words
      .map((word, i) => `<span class="word" style="--i:${i}">${word}</span>`)
      .join(' ');

    if (wasInView) {
      el.classList.add('in-view');
      return;
    }

    wordRevealObservers.get(el)?.disconnect();

    const wordObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          wordObserver.disconnect();
          wordRevealObservers.delete(el);
        }
      });
    }, { threshold: 0.4 });

    wordRevealObservers.set(el, wordObserver);
    wordObserver.observe(el);
  }

  document.querySelectorAll('[data-word-reveal]').forEach(initWordReveal);

  document.addEventListener('languagechange', () => {
    document.querySelectorAll('[data-word-reveal]').forEach(initWordReveal);
    refreshNavIndicator();
  });

  /* ------------------------------------------------------------
     Reliable one-section-per-scroll ("snap") navigation.
     Native CSS scroll-snap alone is inconsistent across browsers
     with mouse-wheel input, so we drive it explicitly here and
     let CSS scroll-snap serve as a fallback (keyboard, JS-off).
     ------------------------------------------------------------ */
  const stops = [...sections];
  let currentStopIndex = 0;
  const backToTopBtn = document.querySelector('[data-back-to-top]');

  function syncStopIndex(target) {
    const index = stops.indexOf(target);
    if (index !== -1) {
      currentStopIndex = index;
      backToTopBtn?.classList.toggle('visible', currentStopIndex > 0);
      syncNavbarCompact();
    }
  }

  const stopObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && !isProgrammaticScroll) {
        syncStopIndex(entry.target);
      }
    });
  }, { threshold: [0.6] });

  stops.forEach(stop => stopObserver.observe(stop));

  backToTopBtn?.addEventListener('click', () => goToStop(0));

  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  const isNarrowViewport = () => window.matchMedia('(max-width: 700px), (max-height: 600px)').matches;

  function goToStop(index) {
    if (index < 0 || index >= stops.length) return;
    const isLongJump = Math.abs(index - currentStopIndex) > 1;
    // Long jumps suppress intermediate scroll-spy updates so the pill
    // slides once to the target instead of bouncing through each link.
    if (isLongJump) beginProgrammaticScroll();
    currentStopIndex = index;
    backToTopBtn?.classList.toggle('visible', currentStopIndex > 0);
    stops[index].scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    setActiveLink(stops[index].getAttribute('id'));
    syncNavbarCompact();
  }

  if (!isTouchDevice && !prefersReducedMotion) {
    let wheelLock = false;

    window.addEventListener('wheel', (e) => {
      if (isNarrowViewport()) return;
      if (Math.abs(e.deltaY) < 2) return;

      e.preventDefault();
      if (wheelLock) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      const nextIndex = currentStopIndex + direction;
      if (nextIndex < 0 || nextIndex >= stops.length) return;

      wheelLock = true;
      goToStop(nextIndex);
      setTimeout(() => { wheelLock = false; }, 850);
    }, { passive: false });
  }

  /* ------------------------------------------------------------
     Subtle aurora parallax — tracks the pointer with a soft lag
     ------------------------------------------------------------ */
  const aurora = document.querySelector('.aurora');
  if (aurora && !prefersReducedMotion && !isTouchDevice) {
    let rafId = null;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('pointermove', (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 28;
      targetY = (e.clientY / window.innerHeight - 0.5) * 18;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        aurora.style.transform = `translate3d(${targetX.toFixed(1)}px, ${targetY.toFixed(1)}px, 0)`;
        rafId = null;
      });
    }, { passive: true });
  }

  syncNavbarCompact();
});
