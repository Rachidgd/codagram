(function () {
  'use strict';

  var CONFIG_ID = 'ma-matw-config';
  var CART_ID = 'maMatwCart';
  var PRODUCT_ID = 'maMatwProduct';

  var configNode = document.getElementById(CONFIG_ID);
  if (!configNode) return;

  var config;
  try {
    config = JSON.parse(configNode.textContent);
  } catch (error) {
    return;
  }

  var state = { itemCount: null };

  function buildBubble(id, overline, text, withLink) {
    var block = document.createElement('aside');
    block.id = id;
    block.className = 'ma-matw';
    block.setAttribute('aria-label', 'Engagement solidaire de Maison Ayla');

    var label = document.createElement('p');
    label.className = 'ma-matw__overline';
    label.textContent = overline;
    block.appendChild(label);

    var body = document.createElement('p');
    body.className = 'ma-matw__text';
    body.textContent = text;
    block.appendChild(body);

    if (withLink && config.url) {
      var link = document.createElement('a');
      link.className = 'ma-matw__link';
      link.href = config.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = config.linkLabel;
      block.appendChild(link);
    }
    return block;
  }

  function footerEl() {
    return document.getElementById('cdFooter');
  }

  function panelEl() {
    return document.getElementById('cdPanel');
  }

  function hasItems() {
    if (typeof state.itemCount === 'number') return state.itemCount > 0;
    var footer = footerEl();
    return !!footer && footer.style.display !== 'none';
  }

  function mountCart() {
    var panel = panelEl();
    if (!panel) return false;

    var existing = document.getElementById(CART_ID);
    if (existing && panel.contains(existing)) return true;
    if (existing) existing.remove();

    var anchor = document.getElementById('maCroShipping') ||
      panel.querySelector('.cd-header');
    if (!anchor) return false;

    var block = buildBubble(CART_ID, config.cartOverline, config.cartText, false);
    block.classList.add('ma-matw--cart');
    block.hidden = true;
    anchor.insertAdjacentElement('afterend', block);
    return true;
  }

  function syncCart() {
    if (!mountCart()) return;
    var block = document.getElementById(CART_ID);
    if (block) block.hidden = !hasItems();
  }

  function watchCart() {
    var footer = footerEl();
    if (footer) {
      new MutationObserver(syncCart).observe(footer, {
        attributes: true,
        attributeFilter: ['style']
      });
    }
    var panel = panelEl();
    if (panel) {
      new MutationObserver(syncCart).observe(panel, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  function mountProduct() {
    if (document.getElementById(PRODUCT_ID)) return true;

    var form = document.querySelector('form[action*="/cart/add"]');
    if (!form) return false;

    var block = buildBubble(PRODUCT_ID, config.productOverline, config.productText, true);
    block.classList.add('ma-matw--product');
    form.insertAdjacentElement('afterend', block);
    return true;
  }

  function startCart() {
    if (mountCart()) {
      watchCart();
      syncCart();
      return true;
    }
    return false;
  }

  function bootstrap() {
    var cartReady = startCart();
    var productReady = mountProduct();
    if (cartReady && productReady) return;

    var observer = new MutationObserver(function () {
      if (!cartReady) cartReady = startCart();
      if (!productReady) productReady = mountProduct();
      if (cartReady && productReady) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.setTimeout(function () {
      observer.disconnect();
    }, 10000);
  }

  document.addEventListener('ma:cart-state', function (event) {
    var detail = event.detail || {};
    if (typeof detail.itemCount === 'number') state.itemCount = detail.itemCount;
    syncCart();
  });

  document.addEventListener('maison:openCart', syncCart);
  document.addEventListener('cart:updated', syncCart);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
