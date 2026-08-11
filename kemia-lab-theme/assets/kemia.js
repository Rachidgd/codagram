(function () {
  'use strict';

  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  var scrollLocks = 0;

  function announce(message) {
    var el = document.getElementById('k-a11y-status');
    if (el) el.textContent = message;
  }

  function lockScroll() {
    scrollLocks += 1;
    if (scrollLocks === 1) {
      document.body.style.paddingRight = window.innerWidth - document.documentElement.clientWidth + 'px';
      document.body.style.overflow = 'hidden';
    }
  }

  function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks === 0) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }

  function trapFocus(container, event) {
    var nodes = Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), function (n) {
      return n.offsetParent !== null;
    });
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  var Overlay = {
    active: [],
    open: function (id, opener) {
      var el = document.getElementById(id);
      if (!el || el.classList.contains('is-open')) return;
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      el.__opener = opener || document.activeElement;
      lockScroll();
      Overlay.active.push(el);
      window.requestAnimationFrame(function () {
        var target = el.querySelector('[data-k-autofocus]') || el.querySelector(FOCUSABLE);
        if (target) target.focus();
      });
      document.dispatchEvent(new CustomEvent('k:overlay:open', { detail: { id: id } }));
    },
    close: function (el) {
      if (!el || !el.classList.contains('is-open')) return;
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      unlockScroll();
      Overlay.active = Overlay.active.filter(function (n) {
        return n !== el;
      });
      if (el.__opener && document.contains(el.__opener)) el.__opener.focus();
    },
    closeTop: function () {
      Overlay.close(Overlay.active[Overlay.active.length - 1]);
    }
  };

  document.addEventListener('click', function (event) {
    var opener = event.target.closest('[data-k-open]');
    if (opener) {
      event.preventDefault();
      Overlay.open(opener.getAttribute('data-k-open'), opener);
      return;
    }
    var closer = event.target.closest('[data-k-close]');
    if (closer) {
      event.preventDefault();
      Overlay.close(closer.closest('.k-drawer, .k-modal'));
    }
  });

  document.addEventListener('keydown', function (event) {
    if (!Overlay.active.length) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      Overlay.closeTop();
    } else if (event.key === 'Tab') {
      trapFocus(Overlay.active[Overlay.active.length - 1], event);
    }
  });

  function initRails(scope) {
    (scope || document).querySelectorAll('[data-k-rail]').forEach(function (root) {
      if (root.__railReady) return;
      root.__railReady = true;
      var track = root.querySelector('[data-k-rail-track]');
      if (!track) return;
      var prev = root.querySelector('[data-k-rail-prev]');
      var next = root.querySelector('[data-k-rail-next]');
      var dotsWrap = root.querySelector('[data-k-rail-dots]');
      var items = Array.prototype.slice.call(track.children);
      var dots = [];

      if (dotsWrap && items.length > 1) {
        dotsWrap.innerHTML = '';
        items.forEach(function (item, index) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'k-carousel__dot';
          dot.setAttribute('aria-label', 'Élément ' + (index + 1));
          dot.addEventListener('click', function () {
            track.scrollTo({ left: item.offsetLeft - track.offsetLeft, behavior: 'smooth' });
          });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        });
      }

      function step() {
        var first = items[0];
        if (!first) return track.clientWidth;
        var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) || 0;
        return first.getBoundingClientRect().width + gap;
      }

      function sync() {
        var max = track.scrollWidth - track.clientWidth - 2;
        if (prev) prev.disabled = track.scrollLeft <= 2;
        if (next) next.disabled = track.scrollLeft >= max;
        if (dots.length) {
          var index = Math.round(track.scrollLeft / step());
          dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === Math.min(index, dots.length - 1));
          });
        }
      }

      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
      track.addEventListener('scroll', function () {
        window.clearTimeout(root.__railTimer);
        root.__railTimer = window.setTimeout(sync, 60);
      });
      window.addEventListener('resize', sync);
      sync();
    });
  }

  function initQuantity(scope) {
    (scope || document).querySelectorAll('[data-k-quantity]').forEach(function (root) {
      if (root.__qtyReady) return;
      root.__qtyReady = true;
      var input = root.querySelector('input');
      root.addEventListener('click', function (event) {
        var button = event.target.closest('[data-k-qty-step]');
        if (!button || !input) return;
        var min = parseInt(input.min || '1', 10);
        var value = parseInt(input.value || '1', 10) + parseInt(button.getAttribute('data-k-qty-step'), 10);
        input.value = Math.max(min, value);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  function initFilters(scope) {
    (scope || document).querySelectorAll('[data-k-filter]').forEach(function (root) {
      if (root.__filterReady) return;
      root.__filterReady = true;
      var buttons = root.querySelectorAll('[data-k-filter-value]');
      var targets = root.querySelectorAll('[data-k-filter-item]');
      var empty = root.querySelector('[data-k-filter-empty]');
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var value = button.getAttribute('data-k-filter-value');
          var shown = 0;
          buttons.forEach(function (other) {
            other.classList.toggle('is-active', other === button);
            other.setAttribute('aria-pressed', other === button ? 'true' : 'false');
          });
          targets.forEach(function (item) {
            var tags = (item.getAttribute('data-k-filter-item') || '').split('|');
            var visible = value === '*' || tags.indexOf(value) !== -1;
            item.hidden = !visible;
            if (visible) shown += 1;
          });
          if (empty) empty.hidden = shown !== 0;
        });
      });
    });
  }

  function initProduct(scope) {
    (scope || document).querySelectorAll('[data-k-product]').forEach(function (root) {
      if (root.__productReady) return;
      root.__productReady = true;

      var variantInput = root.querySelector('[data-k-variant-id]');
      var options = root.querySelectorAll('[data-k-cure-option]');

      function applyVariant(option) {
        if (!option) return;
        var available = option.getAttribute('data-available') === 'true';
        var hasCompare = option.getAttribute('data-has-compare') === 'true';
        if (variantInput) variantInput.value = option.getAttribute('data-variant-id');

        root.querySelectorAll('[data-k-cure-option]').forEach(function (other) {
          other.classList.toggle('is-selected', other === option);
        });

        document.querySelectorAll('[data-k-price-current]').forEach(function (el) {
          el.textContent = option.getAttribute('data-price-formatted');
        });
        root.querySelectorAll('[data-k-price-compare]').forEach(function (el) {
          el.textContent = option.getAttribute('data-compare-formatted');
          el.hidden = !hasCompare;
        });
        root.querySelectorAll('[data-k-installment]').forEach(function (el) {
          el.textContent = option.getAttribute('data-installment-formatted');
        });
        root.querySelectorAll('[data-k-submit]').forEach(function (button) {
          button.disabled = !available;
          var label = button.querySelector('[data-k-submit-text]');
          if (label) {
            label.textContent = available
              ? button.getAttribute('data-label-available')
              : button.getAttribute('data-label-soldout');
          }
        });
        document.dispatchEvent(new CustomEvent('k:analytics', {
          detail: { event: 'cure_selected', variant_id: option.getAttribute('data-variant-id') }
        }));
      }

      options.forEach(function (option) {
        var input = option.querySelector('input[type="radio"]');
        if (!input) return;
        input.addEventListener('change', function () {
          if (input.checked) applyVariant(option);
        });
        if (input.checked) applyVariant(option);
      });

      var gallery = root.querySelector('[data-k-gallery]');
      if (gallery) {
        var main = gallery.querySelector('[data-k-gallery-main]');
        var thumbs = gallery.querySelectorAll('[data-k-gallery-thumb]');
        thumbs.forEach(function (thumb) {
          thumb.addEventListener('click', function () {
            var index = thumb.getAttribute('data-k-gallery-thumb');
            gallery.querySelectorAll('[data-k-gallery-slide]').forEach(function (slide) {
              slide.hidden = slide.getAttribute('data-k-gallery-slide') !== index;
            });
            thumbs.forEach(function (other) {
              other.classList.toggle('is-active', other === thumb);
              other.setAttribute('aria-current', other === thumb ? 'true' : 'false');
            });
            if (main) main.setAttribute('data-active', index);
          });
        });
      }
    });
  }

  function initStickyBar() {
    var bar = document.querySelector('[data-k-sticky-atc]');
    var anchor = document.querySelector('[data-k-sticky-anchor]');
    if (!bar || !anchor) return;

    var trigger = bar.querySelector('[data-k-sticky-submit]');
    if (trigger && !trigger.__ready) {
      trigger.__ready = true;
      trigger.addEventListener('click', function () {
        var form = document.querySelector('[data-k-atc-form]');
        if (form) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      });
    }

    if (!('IntersectionObserver' in window) || bar.__observed) return;
    bar.__observed = true;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
      });
    }, { threshold: 0 });
    observer.observe(anchor);
  }

  function initCart() {
    document.addEventListener('submit', function (event) {
      var form = event.target.closest('[data-k-atc-form]');
      if (!form) return;
      event.preventDefault();
      var button = form.querySelector('[data-k-submit]');
      if (button) button.classList.add('is-loading');
      var body = new FormData(form);
      body.append('sections', 'cart-drawer');

      fetch(window.Shopify && window.Shopify.routes ? window.Shopify.routes.root + 'cart/add.js' : '/cart/add.js', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: body
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (button) button.classList.remove('is-loading');
          var errorBox = form.querySelector('[data-k-atc-error]');
          if (!result.ok) {
            if (errorBox) {
              errorBox.textContent = result.data.description || result.data.message || '';
              errorBox.hidden = false;
            }
            return;
          }
          if (errorBox) errorBox.hidden = true;
          announce(form.getAttribute('data-added-message') || '');
          document.dispatchEvent(new CustomEvent('k:analytics', { detail: { event: 'product_added_to_cart' } }));
          refreshCart(result.data.sections && result.data.sections['cart-drawer']);
        })
        .catch(function () {
          if (button) button.classList.remove('is-loading');
        });
    });

    document.addEventListener('click', function (event) {
      var remove = event.target.closest('[data-k-cart-remove]');
      if (remove) {
        event.preventDefault();
        changeCart(remove.getAttribute('data-k-cart-remove'), 0);
      }
    });

    document.addEventListener('change', function (event) {
      var input = event.target.closest('[data-k-cart-qty]');
      if (input) changeCart(input.getAttribute('data-k-cart-qty'), input.value);
    });
  }

  function changeCart(line, quantity) {
    fetch(window.Shopify && window.Shopify.routes ? window.Shopify.routes.root + 'cart/change.js' : '/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: parseInt(line, 10), quantity: parseInt(quantity, 10), sections: 'cart-drawer' })
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        refreshCart(data.sections && data.sections['cart-drawer'], true);
      });
  }

  function refreshCart(markup, silent) {
    if (markup) {
      var parsed = new DOMParser().parseFromString(markup, 'text/html');
      var fresh = parsed.querySelector('[data-k-cart-content]');
      var current = document.querySelector('[data-k-cart-content]');
      if (fresh && current) current.innerHTML = fresh.innerHTML;
      var count = parsed.querySelector('[data-k-cart-count-source]');
      if (count) {
        document.querySelectorAll('[data-k-cart-count]').forEach(function (el) {
          el.textContent = count.textContent.trim();
        });
      }
      initQuantity(document);
    }
    if (!silent && document.getElementById('k-cart-drawer') && document.body.getAttribute('data-cart-drawer') !== 'false') {
      Overlay.open('k-cart-drawer');
    }
  }

  function initPopup() {
    var popup = document.querySelector('[data-k-popup]');
    if (!popup) return;
    var key = 'kemia:popup:' + (popup.getAttribute('data-k-popup') || 'default');
    var frequency = parseInt(popup.getAttribute('data-frequency') || '14', 10);
    var delay = parseInt(popup.getAttribute('data-delay') || '6', 10) * 1000;

    try {
      var stored = window.localStorage.getItem(key);
      if (stored && Date.now() - parseInt(stored, 10) < frequency * 86400000) return;
    } catch (error) {
      return;
    }

    function remember() {
      try { window.localStorage.setItem(key, String(Date.now())); } catch (error) {}
    }

    window.setTimeout(function () {
      if (Overlay.active.length) return;
      Overlay.open(popup.id);
      remember();
      document.dispatchEvent(new CustomEvent('k:analytics', { detail: { event: 'email_popup_viewed' } }));
    }, delay);

    popup.addEventListener('submit', function () {
      remember();
      document.dispatchEvent(new CustomEvent('k:analytics', { detail: { event: 'email_submitted' } }));
    });
  }

  function initHeader() {
    var header = document.querySelector('[data-k-header]');
    if (!header) return;
    var last = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      header.classList.toggle('is-stuck', y > 8);
      last = y;
    }, { passive: true });
  }

  function initAnalytics() {
    document.addEventListener('k:analytics', function (event) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(event.detail);
    });
    document.addEventListener('click', function (event) {
      var node = event.target.closest('[data-k-track]');
      if (node) {
        document.dispatchEvent(new CustomEvent('k:analytics', { detail: { event: node.getAttribute('data-k-track') } }));
      }
    });
  }

  function initAll() {
    initRails(document);
    initQuantity(document);
    initFilters(document);
    initProduct(document);
    initStickyBar();
    initHeader();
    initPopup();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAll();
    initCart();
    initAnalytics();
  });

  document.addEventListener('shopify:section:load', function (event) {
    initRails(event.target);
    initQuantity(event.target);
    initFilters(event.target);
    initProduct(event.target);
    initStickyBar();
  });

  window.KemiaOverlay = Overlay;
})();
