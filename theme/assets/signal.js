(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isReduced = function () { return REDUCED.matches; };

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),summary';

  function trapFocus(container) {
    function onKey(e) {
      if (e.key !== 'Tab') return;
      var items = $$(FOCUSABLE, container).filter(function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      });
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener('keydown', onKey);
    return function () { container.removeEventListener('keydown', onKey); };
  }

  var lockCount = 0;
  function lockScroll(on) {
    lockCount = Math.max(0, lockCount + (on ? 1 : -1));
    document.body.classList.toggle('is-locked', lockCount > 0);
  }

  function raf(fn) { return window.requestAnimationFrame(fn); }

  var scrollSubs = [];
  var ticking = false;
  function onScroll(fn) { scrollSubs.push(fn); }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    raf(function () {
      var y = window.scrollY || window.pageYOffset;
      for (var i = 0; i < scrollSubs.length; i++) scrollSubs[i](y);
      ticking = false;
    });
  }, { passive: true });

  var revealObserver = null;

  function initReveal(scope) {
    var targets = $$('[data-reveal]', scope || document);
    if (!targets.length) return;

    if (isReduced() || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }

    var groups = new Map();
    targets.forEach(function (el) {
      if (el.classList.contains('is-in')) return;
      var parent = el.parentNode;
      var idx = groups.get(parent) || 0;
      groups.set(parent, idx + 1);
      if (!el.style.getPropertyValue('--reveal-delay')) {
        el.style.setProperty('--reveal-delay', Math.min(idx, 6) * 65 + 'ms');
      }
      revealObserver.observe(el);
    });
  }

  function initHeader() {
    var head = $('[data-header]');
    if (!head) return;

    var progress = $('[data-scroll-progress]');
    var lastY = window.scrollY || 0;
    var hidden = false;

    onScroll(function (y) {
      head.classList.toggle('is-stuck', y > 8);

      var delta = y - lastY;
      if (Math.abs(delta) > 6) {
        var shouldHide = delta > 0 && y > 220 && !head.classList.contains('is-open');
        if (shouldHide !== hidden) {
          hidden = shouldHide;
          head.classList.toggle('is-hidden', hidden);
        }
        lastY = y;
      }

      if (progress) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        progress.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      }
    });

    if ('IntersectionObserver' in window) {
      var applySurface = function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var surface = entry.target.getAttribute('data-surface') || 'dark';
          head.setAttribute('data-theme', surface);
        });
      };

      var build = function () {
        var h = head.offsetHeight || 64;
        var obs = new IntersectionObserver(applySurface, {
          rootMargin: '-' + (h - 1) + 'px 0px -' + Math.max(0, window.innerHeight - h) + 'px 0px',
          threshold: 0
        });
        $$('[data-surface]').forEach(function (el) { obs.observe(el); });
        return obs;
      };

      var observer = build();
      var resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { observer.disconnect(); observer = build(); }, 200);
      }, { passive: true });
    }

    var cmdKey = $('[data-cmd-key]');
    if (cmdKey && /Mac|iPhone|iPad/.test(navigator.platform || '')) cmdKey.textContent = '⌘';
  }

  function initNav() {
    var head = $('[data-header]');
    var groups = $$('[data-nav-group]');
    if (!groups.length) return;

    var openGroup = null;
    var hoverTimer = null;

    function close(group) {
      if (!group) return;
      group.classList.remove('is-open');
      var trigger = $('[data-nav-trigger]', group);
      var panel = $('[data-nav-panel]', group);
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (panel) setTimeout(function () { if (!group.classList.contains('is-open')) panel.hidden = true; }, 240);
      if (openGroup === group) openGroup = null;
      if (head && !openGroup) head.classList.remove('is-open');
    }

    function open(group) {
      if (openGroup && openGroup !== group) close(openGroup);
      var trigger = $('[data-nav-trigger]', group);
      var panel = $('[data-nav-panel]', group);
      if (panel) panel.hidden = false;
      raf(function () { group.classList.add('is-open'); });
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      openGroup = group;
      if (head) { head.classList.add('is-open'); head.classList.remove('is-hidden'); }
    }

    groups.forEach(function (group) {
      var trigger = $('[data-nav-trigger]', group);
      if (!trigger) return;

      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        if (group.classList.contains('is-open')) close(group); else open(group);
      });

      group.addEventListener('mouseenter', function () {
        if (window.innerWidth < 1080) return;
        clearTimeout(hoverTimer);
        open(group);
      });
      group.addEventListener('mouseleave', function () {
        if (window.innerWidth < 1080) return;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(function () { close(group); }, 180);
      });

      group.addEventListener('focusout', function (e) {
        if (!group.contains(e.relatedTarget)) close(group);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openGroup) {
        var trigger = $('[data-nav-trigger]', openGroup);
        close(openGroup);
        if (trigger) trigger.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (openGroup && !openGroup.contains(e.target)) close(openGroup);
    });
  }

  function initMobileNav() {
    var sheet = $('[data-mobile-sheet]');
    var toggle = $('[data-mobile-toggle]');
    if (!sheet || !toggle) return;

    var release = null;

    function open() {
      sheet.hidden = false;
      raf(function () { raf(function () { sheet.classList.add('is-open'); }); });
      toggle.setAttribute('aria-expanded', 'true');
      lockScroll(true);
      release = trapFocus(sheet);
      var first = $('[data-mobile-close]', sheet);
      if (first) setTimeout(function () { first.focus(); }, 60);
    }

    function close() {
      sheet.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      lockScroll(false);
      if (release) { release(); release = null; }
      setTimeout(function () { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, 420);
      toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (sheet.classList.contains('is-open')) close(); else open();
    });
    $$('[data-mobile-close]', sheet).forEach(function (el) { el.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('is-open')) close();
    });
    $$('a[href]', sheet).forEach(function (a) { a.addEventListener('click', close); });
  }

  function initPalette() {
    var root = $('[data-palette]');
    if (!root) return;

    var input = $('[data-palette-input]', root);
    var listEl = $('[data-palette-list]', root);
    var emptyEl = $('[data-palette-empty]', root);
    var dataEl = $('[data-palette-data]');
    if (!input || !listEl || !dataEl) return;

    var items = [];
    try { items = JSON.parse(dataEl.textContent) || []; } catch (err) { items = []; }
    if (!items.length) return;

    var release = null;
    var cursor = 0;
    var results = items.slice();

    function normalize(str) {
      return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }

    function score(item, q) {
      var hay = normalize(item.t + ' ' + (item.k || '') + ' ' + (item.g || ''));
      var title = normalize(item.t);
      if (!q) return 1;
      if (title.indexOf(q) === 0) return 100;
      if (hay.indexOf(' ' + q) > -1) return 60;
      var pos = hay.indexOf(q);
      if (pos > -1) return 40 - Math.min(20, pos / 4);
      return 0;
    }

    function render() {
      listEl.innerHTML = '';
      if (!results.length) {
        if (emptyEl) emptyEl.hidden = false;
        return;
      }
      if (emptyEl) emptyEl.hidden = true;

      var frag = document.createDocumentFragment();
      var lastGroup = null;

      results.forEach(function (item, i) {
        if (item.g && item.g !== lastGroup) {
          lastGroup = item.g;
          var h = document.createElement('p');
          h.className = 'cc-pal__group';
          h.textContent = item.g;
          frag.appendChild(h);
        }
        var a = document.createElement('a');
        a.className = 'cc-pal__item' + (i === cursor ? ' is-cursor' : '');
        a.href = item.u;
        a.setAttribute('role', 'option');
        a.setAttribute('aria-selected', i === cursor ? 'true' : 'false');
        a.dataset.index = i;

        var label = document.createElement('span');
        label.className = 'cc-pal__label';
        label.textContent = item.t;
        a.appendChild(label);

        if (item.d) {
          var desc = document.createElement('span');
          desc.className = 'cc-pal__desc';
          desc.textContent = item.d;
          a.appendChild(desc);
        }
        frag.appendChild(a);
      });

      listEl.appendChild(frag);
      var active = $('.is-cursor', listEl);
      if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
    }

    function search(q) {
      var norm = normalize(q).trim();
      results = items
        .map(function (item) { return { item: item, s: score(item, norm) }; })
        .filter(function (r) { return r.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, 24)
        .map(function (r) { return r.item; });
      cursor = 0;
      render();
    }

    function open() {
      root.hidden = false;
      raf(function () { raf(function () { root.classList.add('is-open'); }); });
      lockScroll(true);
      release = trapFocus(root);
      input.value = '';
      search('');
      setTimeout(function () { input.focus(); }, 60);
    }

    function close() {
      root.classList.remove('is-open');
      lockScroll(false);
      if (release) { release(); release = null; }
      setTimeout(function () { if (!root.classList.contains('is-open')) root.hidden = true; }, 260);
    }

    $$('[data-palette-open]').forEach(function (b) { b.addEventListener('click', open); });
    $$('[data-palette-close]', root).forEach(function (b) { b.addEventListener('click', close); });

    input.addEventListener('input', function () { search(input.value); });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!results.length) return;
        cursor = (cursor + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
        render();
      }
      if (e.key === 'Enter') {
        var target = results[cursor];
        if (target) { e.preventDefault(); window.location.href = target.u; }
      }
    });

    listEl.addEventListener('mousemove', function (e) {
      var item = e.target.closest('.cc-pal__item');
      if (!item) return;
      var idx = parseInt(item.dataset.index, 10);
      if (idx !== cursor) { cursor = idx; render(); }
    });

    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (root.classList.contains('is-open')) close(); else open();
      }
    });
  }

  function initCounters(scope) {
    var els = $$('[data-count]', scope || document);
    if (!els.length || !('IntersectionObserver' in window)) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        obs.unobserve(el);

        var raw = el.getAttribute('data-count');
        var target = parseFloat(String(raw).replace(',', '.'));
        if (isNaN(target)) return;

        var prefix = el.getAttribute('data-count-prefix') || '';
        var suffix = el.getAttribute('data-count-suffix') || '';
        var decimals = (String(raw).split(/[.,]/)[1] || '').length;

        if (isReduced()) {
          el.textContent = prefix + target.toFixed(decimals).replace('.', ',') + suffix;
          return;
        }

        var start = performance.now();
        var dur = 1100;
        (function step(now) {
          var t = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - t, 4);
          el.textContent = prefix + (target * eased).toFixed(decimals).replace('.', ',') + suffix;
          if (t < 1) raf(step);
        })(start);
      });
    }, { threshold: 0.5 });

    els.forEach(function (el) { obs.observe(el); });
  }

  function initSignalCanvas(scope) {
    var canvas = $('[data-signal-canvas]', scope || document);
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1;
    var t = 0;
    var running = false;
    var frame = null;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function noise(x) {
      return Math.sin(x * 1.7) * 0.5 + Math.sin(x * 4.3 + 1.2) * 0.28 + Math.sin(x * 9.1 + 0.4) * 0.14;
    }

    function draw() {
      if (!w || !h) { resize(); if (!w) { frame = raf(draw); return; } }
      ctx.clearRect(0, 0, w, h);

      var mid = h * 0.5;
      var steps = Math.max(60, Math.floor(w / 3));

      ctx.beginPath();
      for (var i = 0; i <= steps; i++) {
        var p = i / steps;
        var x = p * w;
        var damp = Math.pow(1 - p, 1.6);
        var y = mid + noise(p * 12 + t * 0.7) * h * 0.3 * damp;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(152,163,158,0.34)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      for (var j = 0; j <= steps; j++) {
        var q = j / steps;
        var xx = q * w;
        var rise = Math.pow(q, 1.35);
        var wave = Math.sin(q * 3.1 - t * 0.9) * h * 0.055 * (1 - q * 0.55);
        var yy = mid + h * 0.24 - rise * h * 0.42 + wave;
        j === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
      }
      ctx.strokeStyle = '#d6fb51';
      ctx.lineWidth = 1.8;
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      var grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(214,251,81,0.13)');
      grad.addColorStop(1, 'rgba(214,251,81,0)');
      ctx.fillStyle = grad;
      ctx.fill();

      var headQ = 1;
      var headY = mid + h * 0.24 - Math.pow(headQ, 1.35) * h * 0.42 + Math.sin(headQ * 3.1 - t * 0.9) * h * 0.055 * (1 - headQ * 0.55);
      ctx.beginPath();
      ctx.arc(w - 1, headY, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = '#d6fb51';
      ctx.fill();

      if (running) { t += 0.016; frame = raf(draw); }
    }

    function start() { if (running) return; running = true; frame = raf(draw); }
    function stop() { running = false; if (frame) cancelAnimationFrame(frame); }

    resize();
    window.addEventListener('resize', function () { resize(); if (!running) draw(); }, { passive: true });

    if (isReduced()) { draw(); return; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
      }, { threshold: 0.05 }).observe(canvas);
    } else { start(); }

    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  }

  function initSelector(scope) {
    $$('[data-selector]', scope || document).forEach(function (root) {
      var tabs = $$('[data-selector-tab]', root);
      var panels = $$('[data-selector-panel]', root);
      if (!tabs.length) return;

      function activate(id, focus) {
        tabs.forEach(function (tab) {
          var on = tab.getAttribute('data-selector-tab') === id;
          tab.classList.toggle('is-active', on);
          tab.setAttribute('aria-selected', on ? 'true' : 'false');
          tab.tabIndex = on ? 0 : -1;
          if (on && focus) tab.focus();
        });
        panels.forEach(function (panel) {
          var on = panel.getAttribute('data-selector-panel') === id;
          panel.hidden = !on;
          panel.classList.toggle('is-active', on);
        });
      }

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () { activate(tab.getAttribute('data-selector-tab')); });
      });

      root.addEventListener('keydown', function (e) {
        var idx = tabs.indexOf(document.activeElement);
        if (idx < 0) return;
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % tabs.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        activate(tabs[next].getAttribute('data-selector-tab'), true);
      });

      activate(tabs[0].getAttribute('data-selector-tab'));
    });
  }

  function initTimeline(scope) {
    $$('[data-timeline]', scope || document).forEach(function (root) {
      var line = $('[data-timeline-line]', root);
      var steps = $$('[data-timeline-step]', root);
      if (!line || !steps.length) return;

      if (isReduced()) { line.style.setProperty('--fill', '1'); steps.forEach(function (s) { s.classList.add('is-reached'); }); return; }

      onScroll(function () {
        var rect = root.getBoundingClientRect();
        var vh = window.innerHeight;
        var startY = vh * 0.78;
        var span = rect.height + vh * 0.35;
        var progressed = Math.min(1, Math.max(0, (startY - rect.top) / span));
        line.style.setProperty('--fill', progressed.toFixed(4));

        steps.forEach(function (step) {
          var sr = step.getBoundingClientRect();
          step.classList.toggle('is-reached', sr.top < vh * 0.72);
        });
      });
    });
  }

  function initDiagnostic() {
    var root = $('[data-diagnostic]');
    if (!root) return;

    var form = $('form', root);
    var steps = $$('[data-step]', root);
    var bar = $('[data-diagnostic-bar]', root);
    var counter = $('[data-diagnostic-counter]', root);
    var backBtn = $('[data-diagnostic-back]', root);
    var nextBtn = $('[data-diagnostic-next]', root);
    var submitBtn = $('[data-diagnostic-submit]', root);
    var entryField = $('[data-diagnostic-entry-field]', root);
    var release = null;
    var current = 0;

    if (!steps.length) return;

    function stepVisible(step) {
      var cond = step.getAttribute('data-step-when');
      if (!cond) return true;
      var parts = cond.split('=');
      var field = parts[0];
      var expected = (parts[1] || '').split('|');
      var checked = $('[name="' + CSS.escape(field) + '"]:checked', root);
      if (!checked) return false;
      return expected.indexOf(checked.value) > -1;
    }

    function visibleSteps() { return steps.filter(stepVisible); }

    function validate(step) {
      var ok = true;
      $$('[required]', step).forEach(function (input) {
        var valid = input.type === 'radio'
          ? !!$('[name="' + CSS.escape(input.name) + '"]:checked', step)
          : input.checkValidity() && String(input.value).trim() !== '';
        var wrap = input.closest('[data-field]') || step;
        var msg = $('[data-error]', wrap);
        input.setAttribute('aria-invalid', valid ? 'false' : 'true');
        if (msg) msg.hidden = valid;
        if (!valid && ok) {
          ok = false;
          (input.type === 'radio' ? wrap : input).focus({ preventScroll: false });
        }
      });
      return ok;
    }

    function paint() {
      var list = visibleSteps();
      var idx = list.indexOf(steps[current]);
      if (idx < 0) idx = 0;

      steps.forEach(function (step, i) {
        step.hidden = i !== current;
      });

      if (bar) bar.style.setProperty('--p', ((idx + 1) / list.length).toFixed(3));
      if (counter) counter.textContent = 'Étape ' + (idx + 1) + ' sur ' + list.length;
      if (backBtn) backBtn.hidden = idx === 0;

      var isLast = idx === list.length - 1;
      if (nextBtn) nextBtn.hidden = isLast;
      if (submitBtn) submitBtn.hidden = !isLast;
    }

    function go(dir) {
      var list = visibleSteps();
      var idx = list.indexOf(steps[current]);
      if (dir > 0) {
        if (!validate(steps[current])) return;
        if (idx < list.length - 1) current = steps.indexOf(list[idx + 1]);
      } else if (idx > 0) {
        current = steps.indexOf(list[idx - 1]);
      }
      paint();
      var heading = $('h3, h2, legend', steps[current]);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });
    if (backBtn) backBtn.addEventListener('click', function () { go(-1); });

    root.addEventListener('change', function (e) {
      var input = e.target;
      if (input.type !== 'radio') return;
      var step = input.closest('[data-step]');
      if (!step || !step.hasAttribute('data-step-auto')) return;
      setTimeout(function () { go(1); }, 220);
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        if (!validate(steps[current])) e.preventDefault();
      });
    }

    function open(entry) {
      root.hidden = false;
      raf(function () { raf(function () { root.classList.add('is-open'); }); });
      lockScroll(true);
      release = trapFocus(root);
      paint();
      if (entryField && entry) entryField.value = entry;
      setTimeout(function () {
        var focusable = $('[data-diagnostic-close]', root);
        if (focusable) focusable.focus();
      }, 60);
    }

    function close() {
      root.classList.remove('is-open');
      lockScroll(false);
      if (release) { release(); release = null; }
      setTimeout(function () { if (!root.classList.contains('is-open')) root.hidden = true; }, 380);
    }

    $$('[data-diagnostic-open]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(btn.getAttribute('data-diagnostic-entry') || 'site'); });
    });
    $$('[data-diagnostic-close]', root).forEach(function (btn) { btn.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('is-open')) close();
    });

    if (window.location.search.indexOf('contact_posted=true') > -1 && $('[data-diagnostic-success]', root)) {
      open('retour');
    }

    paint();
  }

  function initAccordions(scope) {
    $$('[data-accordion]', scope || document).forEach(function (group) {
      var items = $$('details', group);
      items.forEach(function (item) {
        item.addEventListener('toggle', function () {
          if (!item.open || !group.hasAttribute('data-accordion-single')) return;
          items.forEach(function (other) { if (other !== item) other.open = false; });
        });
      });
    });
  }

  function boot(scope) {
    initReveal(scope);
    initCounters(scope);
    initSignalCanvas(scope);
    initSelector(scope);
    initTimeline(scope);
    initAccordions(scope);
  }

  function bootGlobal() {
    initHeader();
    initNav();
    initMobileNav();
    initPalette();
    initDiagnostic();
    boot(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootGlobal);
  } else {
    bootGlobal();
  }

  document.addEventListener('shopify:section:load', function (e) {
    boot(e.target);
    if ($('[data-header]', e.target)) { initHeader(); initNav(); initMobileNav(); }
    if ($('[data-diagnostic]', e.target)) initDiagnostic();
  });
  document.addEventListener('shopify:section:select', function (e) { boot(e.target); });
})();
