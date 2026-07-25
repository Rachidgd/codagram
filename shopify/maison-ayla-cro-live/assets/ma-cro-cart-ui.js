(function () {
  'use strict';

  const ROOT = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  const DELIVERY_MIN_DAYS = 8;
  const DELIVERY_MAX_DAYS = 12;
  const state = { cartTimer: null, enhanceTimer: null, previousFocus: null };

  function track(name, detail) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, detail || {}));
  }

  function drawerPanel() {
    return document.querySelector('.cd-panel, [data-cart-drawer-panel], cart-drawer .drawer__inner');
  }

  function addBusinessDays(count) {
    const date = new Date();
    let added = 0;
    while (added < count) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) added += 1;
    }
    return date;
  }

  function formatDay(date) {
    try {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    } catch (error) {
      return date.getDate() + '/' + (date.getMonth() + 1);
    }
  }

  function deliveryEstimate() {
    return 'Livraison estimée entre le ' +
      formatDay(addBusinessDays(DELIVERY_MIN_DAYS)) +
      ' et le ' +
      formatDay(addBusinessDays(DELIVERY_MAX_DAYS)) + '.';
  }

  function createShippingBlock() {
    const block = document.createElement('section');
    block.id = 'maCroShipping';
    block.className = 'ma-cro-shipping';
    block.hidden = true;
    block.setAttribute('role', 'status');
    block.setAttribute('aria-live', 'polite');
    block.innerHTML = '<div class="ma-cro-shipping__top"><p class="ma-cro-shipping__title">Livraison offerte débloquée</p><span class="ma-cro-shipping__status">100 %</span></div><div class="ma-cro-shipping__track" role="progressbar" aria-label="Livraison offerte" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><span class="ma-cro-shipping__fill"></span></div><p class="ma-cro-shipping__message">Félicitations — la livraison est offerte. Votre abaya vous attend.</p><p class="ma-cro-shipping__eta"></p>';
    const eta = block.querySelector('.ma-cro-shipping__eta');
    if (eta) eta.textContent = deliveryEstimate();
    return block;
  }

  function updateCartState() {
    window.clearTimeout(state.cartTimer);
    state.cartTimer = window.setTimeout(async function () {
      try {
        const response = await fetch(ROOT + 'cart.js', { headers: { Accept: 'application/json' } });
        if (!response.ok) return;
        const cart = await response.json();
        const itemCount = Number(cart.item_count || 0);
        const shipping = document.getElementById('maCroShipping');
        if (shipping) shipping.hidden = itemCount === 0;

        document.dispatchEvent(
          new CustomEvent('ma:cart-state', { detail: { itemCount: itemCount } })
        );
      } catch (error) {
        return;
      }
    }, 120);
  }

  function ensureDrawer() {
    const panel = drawerPanel();
    if (!panel) return;
    const header = panel.querySelector('.cd-header, [data-cart-drawer-header], .drawer__header');

    if (header && !document.getElementById('maCroShipping')) {
      header.insertAdjacentElement('afterend', createShippingBlock());
    }

    panel.querySelectorAll('.cd-up-card__add').forEach(function (button) {
      if (button.dataset.maCroUpsellReady === 'true') return;
      button.dataset.maCroUpsellReady = 'true';
      button.textContent = 'Choisir';
      button.setAttribute('aria-label', 'Choisir les options de ce produit');
    });
    updateCartState();
  }

  function patchShippingCopy() {
    document.querySelectorAll('.ma-cart__shipping-value, [data-cart-shipping-value]').forEach(function (node) {
      if (node.textContent.trim() !== 'Livraison offerte') node.textContent = 'Livraison offerte';
    });
  }

  function patchNewsletterConsent() {
    document.querySelectorAll('form input[type="checkbox"]').forEach(function (checkbox) {
      const key = ((checkbox.name || '') + ' ' + (checkbox.id || '')).toLowerCase();
      if (!/accepts.?marketing|newsletter/.test(key)) return;
      if (checkbox.dataset.maCroConsentReady === 'true') return;
      checkbox.dataset.maCroConsentReady = 'true';
      checkbox.checked = false;
      checkbox.defaultChecked = false;
      checkbox.removeAttribute('checked');
      checkbox.removeAttribute('required');
    });
  }

  function patchPaymentDisplay() {
    const template = document.getElementById('maCroPaymentTemplate');
    if (!template) return;

    document.querySelectorAll('.pdp__payment-logos').forEach(function (container) {
      if (container.dataset.maCroPayments === 'true') return;
      container.dataset.maCroPayments = 'true';
      container.innerHTML = '';
      const fragment = template.content.cloneNode(true);
      if (fragment.childElementCount > 0) container.appendChild(fragment);
      else container.hidden = true;
    });

    document.querySelectorAll('.cd-acc__body').forEach(function (container) {
      if (container.dataset.maCroPayments === 'true') return;
      if (!/visa|mastercard|paypal|apple pay/i.test(container.textContent || '')) return;
      container.dataset.maCroPayments = 'true';
      const content = container.querySelector('.cd-acc__content') || container;
      content.innerHTML = '<p>Paiement sécurisé. Les moyens disponibles sont confirmés au moment du paiement.</p>';
    });
  }

  function ensureAll() {
    ensureDrawer();
    patchShippingCopy();
    patchNewsletterConsent();
    patchPaymentDisplay();
  }

  function scheduleEnhance() {
    window.clearTimeout(state.enhanceTimer);
    state.enhanceTimer = window.setTimeout(ensureAll, 60);
  }

  document.addEventListener('click', function (event) {
    const upsellButton = event.target.closest('.cd-up-card__add');
    if (upsellButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const card = upsellButton.closest('.cd-up-card');
      const productLink = card && card.querySelector('a[href*="/products/"]');
      if (productLink && productLink.href) {
        track('ma_upsell_choose_options', { product_url: productLink.pathname });
        window.location.assign(productLink.href);
      }
      return;
    }

    const drawerTrigger = event.target.closest('[data-cart-link], [href$="/cart"], [aria-controls*="cart"]');
    if (drawerTrigger) {
      state.previousFocus = drawerTrigger;
      window.setTimeout(function () {
        ensureDrawer();
        const panel = drawerPanel();
        const close = panel && panel.querySelector('.cd-close, .cd-header__close, [data-cart-drawer-close], button[aria-label*="Fermer"]');
        if (close) close.focus({ preventScroll: true });
        track('ma_cart_drawer_open');
      }, 120);
    }

    const closeButton = event.target.closest('.cd-close, .cd-header__close, [data-cart-drawer-close], button[aria-label*="Fermer le panier"]');
    if (closeButton && state.previousFocus && typeof state.previousFocus.focus === 'function') {
      window.setTimeout(function () { state.previousFocus.focus({ preventScroll: true }); }, 50);
    }
  }, true);

  document.addEventListener('maison:openCart', function () {
    window.setTimeout(function () {
      ensureDrawer();
      updateCartState();
    }, 100);
  });

  document.addEventListener('DOMContentLoaded', ensureAll, { once: true });
  const observer = new MutationObserver(scheduleEnhance);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
