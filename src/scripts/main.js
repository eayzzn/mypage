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
    // Reconcile with the real, final scroll position now that live scroll
    // handling is unblocked again (safety net for the destination-based
    // compact state applied during the jump).
    syncNavbarCompact();
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
      setNavbarCompactForTarget(targetId);
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
      setNavbarCompactForTarget(href.slice(1));
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  function refreshNavIndicator({ instant = false } = {}) {
    const current = document.querySelector('.nav-link.active');
    if (current) moveIndicatorTo(current, { instant });
  }

  // Measure each label's natural width once so the collapse/expand animates
  // max-width to the EXACT content width (no overshoot → smooth, not clunky).
  const navLabels = document.querySelectorAll('.nav-label');
  function measureNavLabels() {
    navLabels.forEach(label => {
      const text = label.querySelector('.nav-label-text');
      if (!text) return;
      // scrollWidth is the text's natural width even while the label is
      // collapsed (max-width:0), so this is correct in any navbar state.
      label.style.setProperty('--label-w', `${text.scrollWidth + 1}px`);
    });
  }
  measureNavLabels();
  document.fonts?.ready.then(measureNavLabels);

  /* ------------------------------------------------------------
     Keep the pill locked to the active link WHILE the navbar
     resizes (compact <-> expanded). The resize animates each link's
     size, so the active link's width/position is a moving target for
     ~0.45s. Rather than a fixed-duration timer (which raced with the
     real transition and could leave the pill snapped to a stale value
     outside the bar), tracking is bound directly to the ACTUAL CSS
     transitions: begin on `transitionrun`, follow the live geometry
     every frame with the pill's slide transition disabled, and end
     once the transition finishes. The geometry is always read from the
     active link's own offsetLeft/offsetWidth, so the pill can never
     land outside the navbar.
     ------------------------------------------------------------ */
  let isResizing = false;
  let resizeRaf = null;
  let endResizeQueued = null;

  function trackActiveGeometry() {
    const link = document.querySelector('.nav-link.active');
    if (!link || !navIndicator) return;
    navIndicator.style.width = `${link.offsetWidth}px`;
    navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
  }

  function resizeStep() {
    trackActiveGeometry();
    if (isResizing) resizeRaf = requestAnimationFrame(resizeStep);
  }

  function beginResizeTracking() {
    if (endResizeQueued) { cancelAnimationFrame(endResizeQueued); endResizeQueued = null; }
    if (isResizing || !navIndicator) return;
    isResizing = true;
    navIndicator.style.transition = 'none';
    resizeRaf = requestAnimationFrame(resizeStep);
  }

  function endResizeTracking() {
    isResizing = false;
    if (resizeRaf) { cancelAnimationFrame(resizeRaf); resizeRaf = null; }
    trackActiveGeometry();
    if (navIndicator) {
      // Reflow so re-enabling the slide transition won't animate from a
      // stale value on the next active-link change.
      navIndicator.getBoundingClientRect();
      requestAnimationFrame(() => { navIndicator.style.transition = ''; });
    }
  }

  // Only size-affecting transitions matter: padding (navbar + links) and the
  // label's grid column. Events bubble up from the links to the navbar.
  function isNavSizeTransition(e) {
    return e.propertyName.startsWith('padding') || e.propertyName === 'grid-template-columns';
  }

  navbar?.addEventListener('transitionrun', (e) => {
    if (isNavSizeTransition(e)) beginResizeTracking();
  });

  ['transitionend', 'transitioncancel'].forEach(evt => {
    navbar?.addEventListener(evt, (e) => {
      if (!isNavSizeTransition(e)) return;
      // Many longhand events fire together at the end — coalesce to a single
      // end on the next frame. A fresh transitionrun cancels this and keeps
      // tracking (covers hover-in/out interruptions without any flicker).
      if (endResizeQueued) cancelAnimationFrame(endResizeQueued);
      endResizeQueued = requestAnimationFrame(() => {
        endResizeQueued = null;
        endResizeTracking();
      });
    });
  });

  // Reduced motion disables transitions, so no transition events fire and the
  // tracker above stays inert — reposition the pill directly instead.
  if (prefersReducedMotion) {
    const rmRefresh = () => requestAnimationFrame(() => refreshNavIndicator({ instant: true }));
    ['mouseenter', 'mouseleave', 'focusin', 'focusout'].forEach(evt =>
      navbar?.addEventListener(evt, rmRefresh));
  }

  /* Compact navbar once you leave the hero — icons only until hover */
  const scrollIndicator = document.querySelector('.scroll-indicator');

  function applyNavbarCompact(shouldCompact, narrow) {
    if (!navbar) return;
    const was = navbar.classList.contains('is-compact');
    navbar.classList.toggle('is-compact', shouldCompact);
    // Hide the "scroll down" hint the moment we leave the hero so it never
    // overlaps content further down the page.
    scrollIndicator?.classList.toggle('is-hidden', shouldCompact || narrow);
    // Reduced motion: no transition to track, so realign the pill directly.
    if (was !== shouldCompact && prefersReducedMotion) {
      requestAnimationFrame(() => refreshNavIndicator({ instant: true }));
    }
  }

  function syncNavbarCompact() {
    if (!navbar) return;
    const narrow = window.matchMedia('(max-width: 768px)').matches;
    const shouldCompact = !narrow && (window.scrollY > 48 || document.querySelector('#home')?.getBoundingClientRect().bottom < window.innerHeight * 0.55);
    applyNavbarCompact(shouldCompact, narrow);
  }

  // Used the instant we KNOW the destination of a programmatic jump (nav
  // click, hero CTA, back-to-top), instead of the current scroll position.
  // Without this, the compact state briefly reflects the position mid-flight
  // (e.g. still "scrolled down" a moment after clicking Home) — losing
  // :hover right after the click then shrinks the navbar for a split
  // second before it expands again once the scroll lands on Home.
  function setNavbarCompactForTarget(targetId) {
    const narrow = window.matchMedia('(max-width: 768px)').matches;
    applyNavbarCompact(!narrow && targetId !== 'home', narrow);
  }

  window.addEventListener('scroll', () => {
    // While a click/back-to-top jump is animating, the destination is
    // already applied via setNavbarCompactForTarget — live positions during
    // the flight are stale, not more accurate, so ignore them here.
    if (isProgrammaticScroll) return;
    syncNavbarCompact();
  }, { passive: true });
  window.addEventListener('resize', () => {
    syncNavbarCompact();
    measureNavLabels();
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
    measureNavLabels();
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
    const targetId = stops[index].getAttribute('id');
    setActiveLink(targetId);
    // Long jumps gate live scroll handling (see beginProgrammaticScroll), so
    // set the destination's compact state directly instead of the stale
    // current position; short hops keep reading the live position as before.
    if (isLongJump) {
      setNavbarCompactForTarget(targetId);
    } else {
      syncNavbarCompact();
    }
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
