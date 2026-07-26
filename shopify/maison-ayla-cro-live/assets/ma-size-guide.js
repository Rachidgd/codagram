(function () {
  'use strict';

  var PAGE_URL = '/pages/guide-des-tailles';
  var LABEL = 'Guide des tailles';
  var MARK = 'data-ma-size-guide';

  function injectStyles() {
    if (document.getElementById('maSizeGuideStyles')) return;
    var css = [
      '.ma-size-guide{display:inline-flex;align-items:center;gap:.35em;margin-left:auto;',
      'font-family:inherit;font-size:.72rem;font-weight:400;letter-spacing:.06em;',
      'color:#6B6B6B;text-decoration:none;border-bottom:1px solid currentColor;',
      'padding-bottom:1px;line-height:1.2;white-space:nowrap}',
      '.ma-size-guide:hover,.ma-size-guide:focus-visible{color:#0A0A0A}',
      '.ma-size-guide svg{width:.85em;height:.85em;flex:none}',
      '.ma-size-guide--block{display:flex;margin:0 0 .75rem;justify-content:flex-end}'
    ].join('');
    var style = document.createElement('style');
    style.id = 'maSizeGuideStyles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildLink(extraClass) {
    var a = document.createElement('a');
    a.className = 'ma-size-guide' + (extraClass ? ' ' + extraClass : '');
    a.href = PAGE_URL;
    a.setAttribute(MARK, '');
    a.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="2" y="8" width="20" height="8" rx="1"></rect>' +
      '<path d="M6 8v3M10 8v4M14 8v3M18 8v4"></path></svg>' +
      '<span>' + LABEL + '</span>';
    return a;
  }

  // An element is a size label if its own text (ignoring children that are
  // themselves controls) reads like "Taille" or "Size".
  function isSizeLabel(el) {
    var text = (el.textContent || '').trim();
    if (!text || text.length > 24) return false;
    return /^(taille|size|pointure)\s*:?\s*$/i.test(text);
  }

  function findAnchor() {
    var candidates = document.querySelectorAll(
      'legend, label, .form__label, [class*="option"] > .label, [class*="variant"] [class*="label"]'
    );
    for (var i = 0; i < candidates.length; i++) {
      if (isSizeLabel(candidates[i])) return candidates[i];
    }
    return null;
  }

  function findFallback() {
    var form = document.querySelector('form[action*="/cart/add"]');
    if (!form) return null;
    return form.querySelector('button[type="submit"], [name="add"]');
  }

  function mount() {
    if (document.querySelector('[' + MARK + ']')) return true;

    // Never add a second link if the theme already offers one.
    var existing = document.querySelector('a[href*="guide-des-tailles"], a[href*="size-guide"]');
    if (existing) return true;

    var anchor = findAnchor();
    if (anchor) {
      injectStyles();
      var parent = anchor.parentNode;
      var style = window.getComputedStyle(parent);
      if (style.display === 'flex' || style.display === 'grid') {
        parent.insertBefore(buildLink(), anchor.nextSibling);
      } else {
        var row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'baseline';
        row.style.justifyContent = 'space-between';
        row.style.gap = '1rem';
        parent.insertBefore(row, anchor);
        row.appendChild(anchor);
        row.appendChild(buildLink());
      }
      return true;
    }

    var cta = findFallback();
    if (cta) {
      injectStyles();
      cta.parentNode.insertBefore(buildLink('ma-size-guide--block'), cta);
      return true;
    }

    return false;
  }

  function start() {
    // Only product pages carry a size selector worth linking from.
    if (!document.querySelector('form[action*="/cart/add"]')) return;
    if (mount()) return;

    // Some themes render the variant picker after first paint. Watch for it,
    // but only until it appears, and never longer than a few seconds.
    var observer = new MutationObserver(function () {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(function () {
      observer.disconnect();
    }, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
