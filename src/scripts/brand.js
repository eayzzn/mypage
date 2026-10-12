/* ================================================================
   Brand per domain — eayzzn.com shows "eayzzn", evrem.dev shows "evrem".
   Loaded in <head>: a MutationObserver rewrites nodes as the parser adds
   them (before first paint) and again whenever i18n swaps text later.
   Profile links (github.com/eayzzn, linkedin.com/in/eayzzn) stay: those
   are the real account names.
   ================================================================ */
(function () {
  'use strict';

  var DEFAULT = { name: 'eayzzn', email: 'contact@eayzzn.com' };
  var BRANDS = {
    'evrem.dev': { name: 'evrem', email: 'contact@evrem.dev' },
  };

  // "evrem.dev.localhost" maps to evrem.dev for local testing
  var host = location.hostname.replace(/^www\./, '').replace(/\.localhost$/, '');
  var brand = BRANDS[host] || DEFAULT;
  window.BRAND = brand;
  document.documentElement.setAttribute('data-brand', brand.name);
  if (brand.name === DEFAULT.name) return;

  var MAIL = /contact@eayzzn\.com/g, NAME = /eayzzn/g;
  var swap = function (s) { return s.replace(MAIL, brand.email).replace(NAME, brand.name); };
  var ATTRS = ['content', 'aria-label', 'title', 'alt'];

  function fixElement(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute(ATTRS[i]);
      if (v && v.indexOf('eayzzn') !== -1) el.setAttribute(ATTRS[i], swap(v));
    }
    var href = el.getAttribute('href');
    if (href && href.indexOf('mailto:') === 0 && href.indexOf('contact@eayzzn.com') !== -1) el.setAttribute('href', swap(href));
  }
  function fix(node) {
    if (node.nodeType === 3) {
      if (node.nodeValue.indexOf('eayzzn') !== -1) node.nodeValue = swap(node.nodeValue);
      return;
    }
    if (node.nodeType !== 1 || node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
    fixElement(node);
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var n;
    while ((n = walker.nextNode())) {
      if (n.nodeType === 3) {
        var p = n.parentNode;
        if (p && (p.tagName === 'SCRIPT' || p.tagName === 'STYLE')) continue;
        if (n.nodeValue.indexOf('eayzzn') !== -1) n.nodeValue = swap(n.nodeValue);
      } else fixElement(n);
    }
  }

  new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (r.type === 'characterData') fix(r.target);
      else if (r.type === 'attributes') fixElement(r.target);
      else for (var j = 0; j < r.addedNodes.length; j++) fix(r.addedNodes[j]);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat('href') });

  // anything parsed before this script ran, plus a final pass once the document is complete
  fix(document.documentElement);
  document.addEventListener('DOMContentLoaded', function () { fix(document.documentElement); document.title = swap(document.title); });
})();
