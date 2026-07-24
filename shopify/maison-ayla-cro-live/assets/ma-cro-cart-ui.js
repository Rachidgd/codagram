(function () {
  'use strict';

  const ROOT = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  const state = { cartTimer: null, enhanceTimer: null, previousFocus: null };

  function track(name, detail) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, detail || {}));
  }

  function drawerPanel() {
    return document.querySelector('.cd-panel, [data-cart-drawer-panel], cart-drawer .drawer__inner');
  }

  function createShippingBlock() {
    const block = document.createElement('section');
    block.id = 'maCroShipping';
    block.className = 'ma-cro-shipping';
    block.hidden = true;
    block.setAttribute('role', 'status');
    block.setAttribute('aria-live', 'polite');
    block.innerHTML = '<div class="ma-cro-shipping__top"><p class="ma-cro-shipping__title">Livraison offerte débloquée</p><span class="ma-cro-shipping__status">100 %</span></div><div class="ma-cro-shipping__track" role="progressbar" aria-label="Livraison offerte" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><span class="ma-cro-shipping__fill"></span></div><p class="ma-cro-shipping__message">Félicitations — la livraison est offerte. Votre abaya vous attend.</p>';
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

  function patchFooterLinks() {
    document.querySelectorAll('footer a[href="#"], .footer-wrapper a[href="#"]').forEach(function (link) {
      const text = (link.textContent || '').trim();
      if (text.indexOf('@') > -1) {
        link.href = 'mailto:' + text.replace(/\s/g, '');
        return;
      }
      const digits = text.replace(/[^0-9+]/g, '');
      if (digits.replace(/\D/g, '').length >= 9) {
        link.href = 'tel:' + digits;
        return;
      }
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.style.cursor = 'default';
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

    document.querySelectorAll('.cd-acc-body').forEach(function (container) {
      if (container.dataset.maCroPayments === 'true') return;
      if (!/visa|mastercard|paypal|apple pay/i.test(container.textContent || '')) return;
      container.dataset.maCroPayments = 'true';
      container.innerHTML = '<p>Les moyens disponibles seront confirmés au paiement sécurisé.</p>';
    });
  }

  function ensureAll() {
    ensureDrawer();
    patchShippingCopy();
    patchFooterLinks();
    patchNewsletterConsent();
    patchPaymentDisplay();
  }

  function scheduleEnhance() {
    window.clearTimeout(state.enhanceTimer);
    state.enhanceTimer = window.setTimeout(ensureAll, 60);
  }

  function setPromoMessage(message, isError) {
    const node = document.getElementById('cdPromoMsg');
    if (!node) return;
    node.textContent = message;
    node.setAttribute('role', isError ? 'alert' : 'status');
    node.setAttribute('aria-live', 'polite');
  }

  document.addEventListener('click', async function (event) {
    const promoButton = event.target.closest('#cdPromoBtn');
    if (promoButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const input = document.getElementById('cdPromoInput');
      const code = input ? input.value.trim() : '';
      if (!code) {
        setPromoMessage('Saisissez un code promotionnel.', true);
        return;
      }
      promoButton.disabled = true;
      setPromoMessage('Vérification du code…', false);
      try {
        const response = await fetch(ROOT + 'cart/update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ discount: code })
        });
        const payload = await response.json().catch(function () { return {}; });
        if (!response.ok) throw new Error(payload.description || payload.message || 'Code non enregistré.');
        window.localStorage.setItem('maison_ayla_discount', code);
        setPromoMessage('Code enregistré — son éligibilité sera confirmée au paiement.', false);
        track('ma_discount_code_saved', { discount_code: code });
      } catch (error) {
        window.localStorage.removeItem('maison_ayla_discount');
        setPromoMessage(error.message || 'Impossible de vérifier ce code pour le moment.', true);
        track('ma_discount_code_error', { error_message: error.message || 'unknown' });
      } finally {
        promoButton.disabled = false;
      }
      return;
    }

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
        const close = panel && panel.querySelector('.cd-close, [data-cart-drawer-close], button[aria-label*="Fermer"]');
        if (close) close.focus({ preventScroll: true });
        track('ma_cart_drawer_open');
      }, 120);
    }

    const closeButton = event.target.closest('.cd-close, [data-cart-drawer-close], button[aria-label*="Fermer le panier"]');
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
