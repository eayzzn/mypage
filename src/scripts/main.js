document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  initI18n();
  window.Glitch?.init();

  /* ------------------------------------------------------------
     Theme toggle (dark default, light optional, persisted)
     ------------------------------------------------------------ */
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch { /* private mode */ }
  });

  /* ------------------------------------------------------------
     Header border once the page is scrolled
     ------------------------------------------------------------ */
  const header = document.querySelector('[data-header]');
  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  /* ------------------------------------------------------------
     Project filter — cards tagged "all" are always shown
     ------------------------------------------------------------ */
  const filterButtons = document.querySelectorAll('[data-filter]');
  const projectCards = document.querySelectorAll('[data-category]');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      projectCards.forEach(card => {
        const category = card.dataset.category;
        card.hidden = !(filter === 'all' || category === 'all' || category === filter);
      });
    });
  });

  /* ------------------------------------------------------------
     Scroll spy — underline the nav link of the visible section
     ------------------------------------------------------------ */
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const setActive = (id) => navLinks.forEach(link =>
    link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-35% 0px -60% 0px' });

  document.querySelectorAll('[data-section]').forEach(section => sectionObserver.observe(section));

  window.addEventListener('scroll', () => {
    if (window.scrollY < 40) setActive(null);
  }, { passive: true });
});
