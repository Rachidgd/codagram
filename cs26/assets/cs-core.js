/* CS-26 · cs-core.js
   Socle JS : reveal au scroll (§4.3), compteurs (§4.7), état de scroll du
   header, progression du stack (§4.8), mini bus d'événements cs:* → dataLayer.
   Vanilla, zéro dépendance. Les modules (menu, popup, consent, particules)
   sont chargés statiquement par le layout ; chacun se garde lui-même. */
(function () {
  'use strict';

  var html = document.documentElement;
  var motion = html.getAttribute('data-motion') || 'full';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || motion === 'off';

  /* ----- Bus d'événements : CustomEvent cs:* relayé vers dataLayer ----- */
  window.dataLayer = window.dataLayer || [];
  function emit(nom, detail) {
    document.dispatchEvent(new CustomEvent(nom, { detail: detail || {} }));
    window.dataLayer.push(Object.assign({ event: nom }, detail || {}));
  }
  window.csEmit = emit;

  /* ----- Reveal au scroll §4.3 ----- */
  function initReveal() {
    var cibles = document.querySelectorAll('[data-reveal], [data-reveal-underline]');
    if (!cibles.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      cibles.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    cibles.forEach(function (el) { io.observe(el); });
    document.querySelectorAll('[data-reveal-group]').forEach(function (g) {
      var enfants = g.querySelectorAll('[data-reveal]');
      enfants.forEach(function (el, i) { el.style.setProperty('--i', i); });
    });
  }

  /* ----- Compteurs §4.7 ----- */
  function initCompteurs() {
    var compteurs = document.querySelectorAll('[data-count-to]');
    if (!compteurs.length) return;
    var fmt = new Intl.NumberFormat('fr-FR');
    function rendu(el, valeur) {
      el.textContent = (el.dataset.prefix || '') + fmt.format(valeur) + (el.dataset.suffix || '');
    }
    if (reduced || !('IntersectionObserver' in window)) return; /* valeur finale déjà dans le HTML */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target;
        var fin = parseFloat(el.dataset.countTo);
        if (isNaN(fin)) return;
        var decimales = (String(el.dataset.countTo).split('.')[1] || '').length;
        var t0 = null;
        var duree = 1400;
        function frame(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / duree, 1);
          var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); /* easeOutExpo */
          var v = fin * eased;
          rendu(el, decimales ? parseFloat(v.toFixed(decimales)) : Math.round(v));
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.6 });
    compteurs.forEach(function (el) { io.observe(el); });
  }

  /* ----- État de scroll du header (verre + hauteur réduite) ----- */
  function initHeaderScroll() {
    var derniere = false;
    function tick() {
      var passe = window.scrollY > 24;
      if (passe !== derniere) {
        derniere = passe;
        html.toggleAttribute('data-scrolled', passe);
      }
    }
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ----- Progression du stack §4.8 (motion full uniquement) ----- */
  function initStack() {
    if (motion !== 'full' || reduced) return;
    var stacks = document.querySelectorAll('[data-cs="stack"]');
    if (!stacks.length) return;
    stacks.forEach(function (stack) {
      var cartes = Array.prototype.slice.call(stack.querySelectorAll('.cs-stack__card'));
      if (cartes.length < 2) return;
      var actif = false;
      function frame() {
        cartes.forEach(function (carte, i) {
          if (i === cartes.length - 1) return;
          var suivante = cartes[i + 1];
          var r = carte.getBoundingClientRect();
          var rs = suivante.getBoundingClientRect();
          var p = Math.min(Math.max((r.bottom - rs.top) / r.height, 0), 1);
          carte.style.transform = p > 0 ? 'scale(' + (1 - p * 0.035) + ')' : '';
          carte.style.filter = p > 0 ? 'brightness(' + (1 - p * 0.06) + ')' : '';
        });
        if (actif) requestAnimationFrame(frame);
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          actif = e.isIntersecting;
          if (actif) requestAnimationFrame(frame);
        });
      });
      io.observe(stack);
    });
  }

  /* ----- Barre de progression de lecture (cs-article) ----- */
  function initProgression() {
    var barre = document.querySelector('[data-cs="progression"]');
    if (!barre) return;
    var article = document.querySelector('[data-cs="article-corps"]') || document.body;
    function tick() {
      var r = article.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var p = total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : 0;
      barre.style.transform = 'scaleX(' + p + ')';
    }
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ----- Barre sticky mobile §8.17 ----- */
  function initSticky() {
    var barre = document.querySelector('[data-cs="sticky-cta"]');
    if (!barre) return;
    var seuil = parseInt(barre.dataset.seuil || '480', 10);
    var estArticle = barre.dataset.article === 'true';
    function tick() {
      var limite = seuil;
      if (estArticle) {
        limite = (document.body.scrollHeight - window.innerHeight) * 0.6;
      }
      var visible = window.scrollY > limite && !html.hasAttribute('data-overlay-ouvert');
      barre.classList.toggle('is-visible', visible);
    }
    window.addEventListener('scroll', tick, { passive: true });
    document.addEventListener('cs:overlay', tick);
    tick();
  }

  /* ----- Filtres FLIP légers (cs-projets) §8.13 ----- */
  function initFiltres() {
    var zones = document.querySelectorAll('[data-cs="filtres"]');
    zones.forEach(function (zone) {
      var boutons = zone.querySelectorAll('[data-filtre]');
      var grille = document.getElementById(zone.getAttribute('data-cible'));
      if (!grille) return;
      var vide = grille.parentElement.querySelector('[data-cs="filtres-vide"]');
      boutons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          boutons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
          var filtre = btn.dataset.filtre;
          var visibles = 0;
          grille.querySelectorAll('[data-tags]').forEach(function (carte) {
            var ok = filtre === '*' || (' ' + carte.dataset.tags + ' ').indexOf(' ' + filtre + ' ') !== -1;
            if (ok) visibles++;
            if (reduced || motion === 'soft') {
              carte.hidden = !ok;
            } else {
              if (ok && carte.hidden) {
                carte.hidden = false;
                carte.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'scale(1)' }],
                  { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' });
              } else if (!ok && !carte.hidden) {
                var anim = carte.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(.96)' }],
                  { duration: 200, easing: 'ease-out' });
                anim.onfinish = function () { carte.hidden = true; };
              }
            }
          });
          if (vide) vide.hidden = visibles > 0;
        });
      });
    });
  }

  /* Chaque init est isolé : une erreur dans l'un ne casse pas les autres.
     Les modules (cs-menu, cs-popup, cs-consent, cs-particles) sont chargés
     statiquement par layout/theme.liquid — chacun se garde lui-même. */
  function sur(nom, fn) {
    try { fn(); } catch (e) { if (window.console) console.error('CS ' + nom, e); }
  }

  function boot() {
    sur('reveal', initReveal);
    sur('compteurs', initCompteurs);
    sur('header', initHeaderScroll);
    sur('stack', initStack);
    sur('progression', initProgression);
    sur('sticky', initSticky);
    sur('filtres', initFiltres);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
