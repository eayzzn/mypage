/* ------------------------------------------------------------
   i18n — Deutsch & English, browser default, manual override
   ------------------------------------------------------------ */

const translations = {
  de: {
    meta: {
      description: 'eayzzn — Web Development, iOS Apps & UI/UX Design. Digitale Erlebnisse mit Fokus auf Klarheit, Bewegung und Präzision.',
      ogDescription: 'Digitale Erlebnisse mit Fokus auf Klarheit, Bewegung und Präzision.',
      title: 'eayzzn | Portfolio',
    },
    aria: {
      scrollTop: 'eayzzn — nach oben scrollen',
      navHome: 'Start',
      navPhilosophy: 'Philosophie',
      navSkills: 'Skills',
      navProjects: 'Projekte',
      navContact: 'Kontakt',
      themeToggle: 'Farbmodus wechseln',
      menuOpen: 'Menü öffnen',
      scrollDown: 'Nach unten scrollen',
      scrollUp: 'Nach oben scrollen',
      langToggle: 'Sprache wechseln',
      github: 'GitHub',
      linkedin: 'LinkedIn',
    },
    nav: {
      home: 'Start',
      philosophy: 'Philosophie',
      skills: 'Skills',
      projects: 'Projekte',
      contact: 'Kontakt',
    },
    hero: {
      eyebrow: 'Web & iOS Developer · UI/UX Designer',
      headline: 'Digitale Erlebnisse,<br>die sich richtig anfühlen.',
      subtitle: 'Ich entwickle und gestalte Websites, Apps und Interfaces — mit Fokus auf Klarheit, Bewegung und Präzision im Detail.',
      ctaProjects: 'Projekte entdecken',
      ctaContact: 'Kontakt aufnehmen',
    },
    philosophy: {
      eyebrow: 'Philosophie',
      statement: 'Ich glaube, dass die beste Technologie sich nicht wie Technologie anfühlt. Einfach. Klar. Selbstverständlich — bis ins letzte Detail durchdacht.',
    },
    skills: {
      eyebrow: 'Skills',
      title: 'Ein Werkzeugkasten,<br><span class="text-gradient">durchdacht zusammengestellt.</span>',
      frontend: { title: 'Frontend', desc: 'React, JavaScript und moderne CSS-Architektur für schnelle, saubere Interfaces.' },
      native: { title: 'Native Apps', desc: 'Swift & SwiftUI nach den Apple Human Interface Guidelines.' },
      backend: { title: 'Backend', desc: 'Node.js für schnelle, skalierbare und wartbare Schnittstellen.' },
      design: { title: 'Design', desc: 'UI/UX-Konzepte von der ersten Skizze bis zum fertigen Prototyp.' },
      performance: { title: 'Performance', desc: 'Schlanker Code, kurze Ladezeiten und flüssige Interaktionen.' },
      details: { title: 'Details', desc: 'Pixelgenaue Umsetzung und durchdachte Mikrointeraktionen.' },
    },
    projects: {
      eyebrow: 'Projekte',
      title: 'Ausgewählte<br><span class="text-gradient">Arbeiten.</span>',
      portfolio: {
        title: 'Portfolio-Website',
        desc: 'Diese Seite: eine Single-Page-Experience mit Snap-Scroll, animiertem Hintergrund und eigenem Dark-/Light-Mode-System.',
      },
      ios: {
        title: 'iOS App',
        desc: 'Eine native SwiftUI-Anwendung, gebaut nach dem MVVM-Pattern und den Human Interface Guidelines.',
      },
      wip: {
        title: 'In Arbeit',
        desc: 'Weitere Projekte entstehen gerade. Schreib mir, wenn du gemeinsam etwas bauen willst.',
      },
      comingSoon: 'Coming Soon',
    },
    contact: {
      eyebrow: 'Kontakt',
      title: 'Lass uns etwas<br><span class="text-gradient">gemeinsam bauen.</span>',
      subtitle: 'Ob Projekt, Frage oder einfach nur Hallo — ich freue mich, von dir zu hören.',
    },
    footer: {
      imprint: 'Impressum',
      privacy: 'Datenschutz',
      comingSoon: 'Folgt in Kürze',
      copyright: '© 2026 eayzzn. Alle Rechte vorbehalten.',
    },
  },

  en: {
    meta: {
      description: 'eayzzn — Web Development, iOS Apps & UI/UX Design. Digital experiences focused on clarity, motion, and precision.',
      ogDescription: 'Digital experiences focused on clarity, motion, and precision.',
      title: 'eayzzn | Portfolio',
    },
    aria: {
      scrollTop: 'eayzzn — scroll to top',
      navHome: 'Home',
      navPhilosophy: 'Philosophy',
      navSkills: 'Skills',
      navProjects: 'Projects',
      navContact: 'Contact',
      themeToggle: 'Toggle color mode',
      menuOpen: 'Open menu',
      scrollDown: 'Scroll down',
      scrollUp: 'Scroll to top',
      langToggle: 'Switch language',
      github: 'GitHub',
      linkedin: 'LinkedIn',
    },
    nav: {
      home: 'Home',
      philosophy: 'Philosophy',
      skills: 'Skills',
      projects: 'Projects',
      contact: 'Contact',
    },
    hero: {
      eyebrow: 'Web & iOS Developer · UI/UX Designer',
      headline: 'Digital experiences<br>that feel right.',
      subtitle: 'I develop and design websites, apps, and interfaces — with a focus on clarity, motion, and precision in every detail.',
      ctaProjects: 'Explore projects',
      ctaContact: 'Get in touch',
    },
    philosophy: {
      eyebrow: 'Philosophy',
      statement: 'I believe the best technology doesn\'t feel like technology. Simple. Clear. Effortless — thought through down to the last detail.',
    },
    skills: {
      eyebrow: 'Skills',
      title: 'A toolkit,<br><span class="text-gradient">thoughtfully assembled.</span>',
      frontend: { title: 'Frontend', desc: 'React, JavaScript, and modern CSS architecture for fast, clean interfaces.' },
      native: { title: 'Native Apps', desc: 'Swift & SwiftUI following Apple\'s Human Interface Guidelines.' },
      backend: { title: 'Backend', desc: 'Node.js for fast, scalable, and maintainable APIs.' },
      design: { title: 'Design', desc: 'UI/UX concepts from the first sketch to the finished prototype.' },
      performance: { title: 'Performance', desc: 'Lean code, short load times, and fluid interactions.' },
      details: { title: 'Details', desc: 'Pixel-perfect implementation and thoughtful micro-interactions.' },
    },
    projects: {
      eyebrow: 'Projects',
      title: 'Selected<br><span class="text-gradient">work.</span>',
      portfolio: {
        title: 'Portfolio Website',
        desc: 'This site: a single-page experience with snap-scroll, animated background, and a custom dark/light mode system.',
      },
      ios: {
        title: 'iOS App',
        desc: 'A native SwiftUI application built with the MVVM pattern and Human Interface Guidelines.',
      },
      wip: {
        title: 'In Progress',
        desc: 'More projects are on the way. Reach out if you\'d like to build something together.',
      },
      comingSoon: 'Coming Soon',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Let\'s build something<br><span class="text-gradient">together.</span>',
      subtitle: 'Whether it\'s a project, a question, or just hello — I\'d love to hear from you.',
    },
    footer: {
      imprint: 'Imprint',
      privacy: 'Privacy',
      comingSoon: 'Coming soon',
      copyright: '© 2026 eayzzn. All rights reserved.',
    },
  },
};

const SUPPORTED = ['de', 'en'];
const STORAGE_KEY = 'lang';

function detectBrowserLang() {
  const code = (navigator.language || navigator.userLanguage || 'de').split('-')[0].toLowerCase();
  return code === 'en' ? 'en' : 'de';
}

function getStoredLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return SUPPORTED.includes(stored) ? stored : null;
}

function getLang() {
  return getStoredLang() || detectBrowserLang();
}

function t(lang, key) {
  const parts = key.split('.');
  let value = translations[lang];
  for (const part of parts) {
    value = value?.[part];
  }
  return value ?? '';
}

function applyMeta(lang) {
  document.documentElement.lang = lang;
  document.title = t(lang, 'meta.title');

  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', t(lang, 'meta.description'));

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', t(lang, 'meta.ogDescription'));
}

function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (el.hasAttribute('data-word-reveal')) return;
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
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const LANG_FADE_MS = 600;
const LANG_SWAP_MS = 320;
const langControl = document.querySelector('[data-lang-control]');
const langIndicator = document.querySelector('[data-lang-indicator]');
let isSwitching = false;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function moveLangIndicator(btn) {
  if (!langIndicator || !btn) return;
  langIndicator.style.width = `${btn.offsetWidth}px`;
  langIndicator.style.transform = `translateX(${btn.offsetLeft}px)`;
}

function updateLangControl(lang) {
  if (!langControl) return;

  langControl.querySelectorAll('[data-lang]').forEach(btn => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  const activeBtn = langControl.querySelector(`[data-lang="${lang}"]`);
  requestAnimationFrame(() => moveLangIndicator(activeBtn));
}

function pressLangButton(btn) {
  if (!btn || prefersReducedMotion) return;
  const siteControls = document.querySelector('[data-site-controls]');
  btn.classList.add('is-pressing');
  siteControls?.classList.add('is-pressing');
  setTimeout(() => {
    btn.classList.remove('is-pressing');
    siteControls?.classList.remove('is-pressing');
  }, 220);
}

async function setLang(lang, { animate = true } = {}) {
  if (!SUPPORTED.includes(lang) || lang === getLang() || isSwitching) return;

  localStorage.setItem(STORAGE_KEY, lang);
  updateLangControl(lang);

  if (!animate || prefersReducedMotion) {
    applyTranslations(lang);
    return;
  }

  isSwitching = true;
  document.documentElement.classList.add('is-lang-switching');
  await delay(LANG_SWAP_MS);

  applyTranslations(lang);
  void document.documentElement.offsetHeight;

  document.documentElement.classList.remove('is-lang-switching');
  await delay(LANG_FADE_MS);
  isSwitching = false;
}

function initI18n() {
  const lang = getLang();
  applyTranslations(lang);
  updateLangControl(lang);

  langControl?.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      pressLangButton(btn);
      setLang(btn.dataset.lang);
    });
  });

  window.addEventListener('resize', () => {
    const active = langControl?.querySelector('.lang-control-btn.is-active');
    if (active) moveLangIndicator(active);
  });
}

/* Early lang attribute (before paint, mirrors theme bootstrap) */
(function applyEarlyLang() {
  const lang = getStoredLang() || detectBrowserLang();
  document.documentElement.setAttribute('lang', lang);
})();

window.I18n = {
  getLang,
  setLang,
  t: (key) => t(getLang(), key),
};
