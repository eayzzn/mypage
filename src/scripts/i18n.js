/* ------------------------------------------------------------
   i18n — Deutsch & English, browser default, manual override
   ------------------------------------------------------------ */

const translations = {
  de: {
    meta: {
      title: 'eayzzn — Portfolio',
      description: 'eayzzn — Web & iOS Developer, UI/UX Designer. Projekte und Code.',
      ogDescription: 'Web & iOS Developer, UI/UX Designer. Projekte und Code.',
    },
    aria: {
      toTop: 'eayzzn — nach oben',
      nav: 'Hauptnavigation',
      langToggle: 'Sprache wechseln',
      themeToggle: 'Farbmodus wechseln',
      glitch: 'Glitch, das Maskottchen von eayzzn — klick mich',
      filter: 'Projekte filtern',
      glitchContact: 'Glitch hüpft mit einem Brief',
    },
    nav: {
      projects: 'projekte',
      skills: 'skills',
      contact: 'kontakt',
    },
    intro: {
      role: 'Web & iOS Developer · UI/UX Designer',
    },
    projects: {
      heading: 'projekte',
      filterAll: 'alle',
      portfolio: {
        title: 'Portfolio-Website',
        desc: 'Diese Seite. Dark/Light, DE/EN.',
      },
      ios: {
        title: 'iOS App',
        desc: 'Native App, MVVM.',
      },
      wip: {
        title: 'Nächstes Projekt',
        status: 'in arbeit',
        desc: 'Glitch arbeitet gerade daran.',
        link: 'fortschritt ↗',
      },
    },
    skills: {
      heading: 'skills',
    },
    contact: {
      heading: 'kontakt',
    },
    footer: {
      copyright: '© 2026 eayzzn · website im aufbau',
      imprint: 'impressum',
      privacy: 'datenschutz',
    },
  },

  en: {
    meta: {
      title: 'eayzzn — Portfolio',
      description: 'eayzzn — Web & iOS Developer, UI/UX Designer. Projects and code.',
      ogDescription: 'Web & iOS Developer, UI/UX Designer. Projects and code.',
    },
    aria: {
      toTop: 'eayzzn — back to top',
      nav: 'Main navigation',
      langToggle: 'Switch language',
      themeToggle: 'Toggle color mode',
      glitch: 'Glitch, eayzzn’s mascot — click me',
      filter: 'Filter projects',
      glitchContact: 'Glitch hopping with a letter',
    },
    nav: {
      projects: 'projects',
      skills: 'skills',
      contact: 'contact',
    },
    intro: {
      role: 'Web & iOS Developer · UI/UX Designer',
    },
    projects: {
      heading: 'projects',
      filterAll: 'all',
      portfolio: {
        title: 'Portfolio Website',
        desc: 'This site. Dark/light, DE/EN.',
      },
      ios: {
        title: 'iOS App',
        desc: 'Native app, MVVM.',
      },
      wip: {
        title: 'Next project',
        status: 'in progress',
        desc: 'Glitch is working on it.',
        link: 'progress ↗',
      },
    },
    skills: {
      heading: 'skills',
    },
    contact: {
      heading: 'contact',
    },
    footer: {
      copyright: '© 2026 eayzzn · website under construction',
      imprint: 'imprint',
      privacy: 'privacy',
    },
  },
};

const SUPPORTED = ['de', 'en'];
const STORAGE_KEY = 'lang';
const LANG_FADE_MS = 300;

function detectBrowserLang() {
  const code = (navigator.language || navigator.userLanguage || 'de').split('-')[0].toLowerCase();
  return code === 'en' ? 'en' : 'de';
}

function getStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function getLang() {
  return getStoredLang() || detectBrowserLang();
}

function t(lang, key) {
  let value = translations[lang];
  for (const part of key.split('.')) {
    value = value?.[part];
  }
  return value ?? '';
}

function applyMeta(lang) {
  document.documentElement.lang = lang;
  document.title = t(lang, 'meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t(lang, 'meta.description'));
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', t(lang, 'meta.ogDescription'));
}

function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(lang, el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(lang, el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(lang, el.dataset.i18nAria));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.setAttribute('title', t(lang, el.dataset.i18nTitle));
  });
  applyMeta(lang);
}

function updateLangButtons(lang) {
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let isSwitching = false;

async function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === getLang() || isSwitching) return;

  try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* private mode */ }
  updateLangButtons(lang);

  if (prefersReducedMotion) {
    applyTranslations(lang);
    return;
  }

  isSwitching = true;
  document.documentElement.classList.add('is-lang-switching');
  await new Promise(resolve => setTimeout(resolve, LANG_FADE_MS));
  applyTranslations(lang);
  document.documentElement.classList.remove('is-lang-switching');
  isSwitching = false;
}

function initI18n() {
  const lang = getLang();
  applyTranslations(lang);
  updateLangButtons(lang);
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}

window.I18n = {
  getLang,
  setLang,
  t: (key) => t(getLang(), key),
};
