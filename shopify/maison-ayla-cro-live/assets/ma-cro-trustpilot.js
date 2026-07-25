(function () {
  'use strict';

  var CONFIG_ID = 'ma-cro-trustpilot-config';
  var TEMPLATE_ID = 'maCroTrustpilotTemplate';
  var BOOTSTRAP_ID = 'ma-cro-trustpilot-bootstrap';
  var BLOCK_ID = 'maCroTrustpilot';

  var configNode = document.getElementById(CONFIG_ID);
  if (!configNode) return;

  var config;
  try {
    config = JSON.parse(configNode.textContent);
  } catch (error) {
    return;
  }

  var themeRole = (window.Shopify && window.Shopify.theme && window.Shopify.theme.role) || '';
  var isPublishedTheme = String(themeRole).toLowerCase() === 'main';
  var testMode = config.testMode === true && !isPublishedTheme;
  var isOfficial = config.configured === true;

  if (!isOfficial && !testMode) return;

  var state = { itemCount: null };

  function clampPercent(value) {
    var n = Number(value);
    if (!isFinite(n) || n <= 0) return 0;
    return Math.min(100, (n / 5) * 100);
  }

  function panelEl() {
    return document.getElementById('cdPanel');
  }

  function footerEl() {
    return document.getElementById('cdFooter');
  }

  function buildBlock() {
    var block = document.createElement('aside');
    block.id = BLOCK_ID;
    block.className = 'ma-cro-tp';
    block.hidden = true;

    if (isOfficial) {
      block.dataset.maTpMode = 'official';
      block.setAttribute('aria-label', 'Avis clients Trustpilot');

      var host = document.createElement('div');
      host.className = 'ma-cro-tp__widget';

      var template = document.getElementById(TEMPLATE_ID);
      if (template && template.content) host.appendChild(template.content.cloneNode(true));
      block.appendChild(host);

      if (testMode) {
        var staging = document.createElement('p');
        staging.className = 'ma-cro-tp__note';
        staging.textContent = 'Thème de staging non publié.';
        block.appendChild(staging);
      }
      return block;
    }

    block.dataset.maTpMode = 'mock';
    block.classList.add('ma-cro-tp--mock');
    block.setAttribute('aria-label', 'Aperçu de maquette non publié, note de test non vérifiée');

    var slot = document.createElement('div');
    slot.className = 'ma-cro-tp__widget ma-cro-tp__mock';

    var row = document.createElement('div');
    row.className = 'ma-cro-tp__mock-row';

    var label = document.createElement('span');
    label.className = 'ma-cro-tp__mock-label';
    label.textContent = 'Avis clients';
    row.appendChild(label);

    var rating = document.createElement('span');
    rating.className = 'ma-cro-tp__rating';

    var stars = document.createElement('span');
    stars.className = 'ma-cro-tp__stars';
    stars.setAttribute('aria-hidden', 'true');

    var base = document.createElement('span');
    base.className = 'ma-cro-tp__stars-base';
    base.textContent = '★★★★★';
    stars.appendChild(base);

    var fill = document.createElement('span');
    fill.className = 'ma-cro-tp__stars-fill';
    fill.textContent = '★★★★★';
    fill.style.width = clampPercent(config.testValue) + '%';
    stars.appendChild(fill);

    rating.appendChild(stars);

    var score = document.createElement('span');
    score.className = 'ma-cro-tp__mock-score';
    score.textContent = config.testScore || '';
    rating.appendChild(score);

    row.appendChild(rating);
    slot.appendChild(row);

    block.appendChild(slot);
    return block;
  }

  function mount() {
    var footer = footerEl();
    if (!footer) return false;

    var legacy = document.getElementById('maCroTrust');
    if (legacy) legacy.remove();

    var existing = document.getElementById(BLOCK_ID);
    if (existing) {
      if (footer.contains(existing)) return true;
      existing.remove();
    }

    var block = buildBlock();
    var cta = footer.querySelector('.cd-cta');

    if (cta) {
      cta.insertAdjacentElement('afterend', block);
    } else {
      var legal = footer.querySelector('.cd-legal');
      if (legal) footer.insertBefore(block, legal);
      else footer.appendChild(block);
    }
    return true;
  }

  function renderWidget() {
    if (!isOfficial) return;

    var block = document.getElementById(BLOCK_ID);
    if (!block || block.hidden) return;

    var widget = block.querySelector('.trustpilot-widget');
    if (!widget) return;

    if (widget.querySelector('iframe')) {
      block.dataset.trustpilotReady = 'true';
      return;
    }

    if (!window.Trustpilot || typeof window.Trustpilot.loadFromElement !== 'function') return;

    try {
      window.Trustpilot.loadFromElement(widget, true);
      block.dataset.trustpilotReady = 'true';
    } catch (error) {
      return;
    }
  }

  function hasItems() {
    if (typeof state.itemCount === 'number') return state.itemCount > 0;
    var footer = footerEl();
    return !!footer && footer.style.display !== 'none';
  }

  function sync() {
    if (!mount()) return;

    var block = document.getElementById(BLOCK_ID);
    if (!block) return;

    var visible = hasItems();
    block.hidden = !visible;

    if (!visible) {
      delete block.dataset.trustpilotReady;
      return;
    }
    renderWidget();
  }

  function watch() {
    var footer = footerEl();
    if (footer) {
      new MutationObserver(sync).observe(footer, {
        attributes: true,
        attributeFilter: ['style']
      });
    }

    var panel = panelEl();
    if (panel) {
      new MutationObserver(sync).observe(panel, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  function start() {
    if (mount()) {
      watch();
      sync();
      return true;
    }
    return false;
  }

  function bootstrap() {
    if (start()) return;

    var observer = new MutationObserver(function () {
      if (start()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.setTimeout(function () {
      observer.disconnect();
    }, 10000);
  }

  document.addEventListener('ma:cart-state', function (event) {
    var detail = event.detail || {};
    if (typeof detail.itemCount === 'number') state.itemCount = detail.itemCount;
    sync();
  });

  document.addEventListener('maison:openCart', sync);
  document.addEventListener('cart:updated', sync);

  var bootstrapScript = document.getElementById(BOOTSTRAP_ID);
  if (bootstrapScript) bootstrapScript.addEventListener('load', sync, { once: true });
  window.addEventListener('load', sync, { once: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
