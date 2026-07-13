/* CS-26 · cs-menu.js
   Mega menu (§6.2), drawer mobile (§6.3), toggle thème (§3.7), bandeau annonce,
   accordéons footer. Tout est délégué sur `document` : le menu fonctionne quel
   que soit le moment où le header entre dans le DOM, et survit aux re-rendus de
   l'éditeur de thème Shopify (shopify:section:load). Zéro dépendance. */
(function () {
  'use strict';

  var html = document.documentElement;
  var hoverCapable = window.matchMedia('(hover: hover)').matches;

  /* =====================  MEGA MENU  ===================== */
  function panneauDe(btn) { return btn && document.getElementById(btn.getAttribute('aria-controls')); }
  function estOuvert(btn) { return btn && btn.getAttribute('aria-expanded') === 'true'; }

  function ouvrirMega(btn) {
    if (!btn || estOuvert(btn)) return;
    fermerTousMega(btn);
    var p = panneauDe(btn);
    btn.setAttribute('aria-expanded', 'true');
    if (!p) return;
    p.hidden = false;
    requestAnimationFrame(function () { p.classList.add('is-ouvert'); });
  }

  function fermerMega(btn) {
    if (!btn) return;
    btn.setAttribute('aria-expanded', 'false');
    var p = panneauDe(btn);
    if (!p) return;
    p.classList.remove('is-ouvert');
    setTimeout(function () { if (!p.classList.contains('is-ouvert')) p.hidden = true; }, 320);
  }

  function fermerTousMega(sauf) {
    var boutons = document.querySelectorAll('[data-cs-mega-toggle]');
    for (var i = 0; i < boutons.length; i++) if (boutons[i] !== sauf) fermerMega(boutons[i]);
  }

  /* Clic (délégué) : le clic est la commande primaire, fiable au tactile comme
     à la souris. Il ouvre ou ferme, sans jamais entrer en conflit avec le survol. */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-cs-mega-toggle]');
    if (toggle) {
      e.preventDefault();
      if (estOuvert(toggle)) fermerMega(toggle); else ouvrirMega(toggle);
      return;
    }
    /* Clic hors d'un panneau ouvert : on referme tout. */
    if (!e.target.closest('.cs-mega')) fermerTousMega(null);
  });

  /* Survol avec intention (desktop). Enhancement pur : n'annule jamais un clic.
     pointerover / pointerout remontent (contrairement à pointerenter/leave), donc
     la délégation sur document fonctionne même après re-rendu du header. */
  if (hoverCapable) {
    var tOuvre = null, tFerme = null, itemActif = null;
    document.addEventListener('pointerover', function (e) {
      var item = e.target.closest('.cs-header__item--mega');
      if (!item) return;
      clearTimeout(tFerme);
      if (itemActif === item) return;
      itemActif = item;
      clearTimeout(tOuvre);
      var btn = item.querySelector('[data-cs-mega-toggle]');
      tOuvre = setTimeout(function () { ouvrirMega(btn); }, 90);
    });
    document.addEventListener('pointerout', function (e) {
      var item = e.target.closest('.cs-header__item--mega');
      if (!item) return;
      /* Toujours dans le même item (bouton → panneau) : on ne ferme pas. */
      if (e.relatedTarget && item.contains(e.relatedTarget)) return;
      clearTimeout(tOuvre);
      itemActif = null;
      var btn = item.querySelector('[data-cs-mega-toggle]');
      tFerme = setTimeout(function () { fermerMega(btn); }, 220);
    });
  }

  /* Navigation clavier dans un panneau ouvert (flèches) + fermeture au focus sortant. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    var panneau = e.target.closest('.cs-mega');
    if (!panneau) return;
    e.preventDefault();
    var liens = Array.prototype.slice.call(panneau.querySelectorAll('a, button'));
    var i = liens.indexOf(document.activeElement);
    var suiv = e.key === 'ArrowDown' ? liens[i + 1] || liens[0] : liens[i - 1] || liens[liens.length - 1];
    if (suiv) suiv.focus();
  });
  document.addEventListener('focusout', function (e) {
    var item = e.target.closest('.cs-header__item--mega');
    if (item && !item.contains(e.relatedTarget)) {
      fermerMega(item.querySelector('[data-cs-mega-toggle]'));
    }
  });

  /* =====================  DRAWER MOBILE  ===================== */
  function leHeader(el) { return (el && el.closest('.cs-header')) || document.querySelector('.cs-header'); }
  var declencheurDrawer = null;

  function pieger(e) {
    if (e.key !== 'Tab') return;
    var drawer = document.querySelector('.cs-drawer.is-ouvert');
    if (!drawer) return;
    var f = drawer.querySelectorAll('a[href], button:not([disabled]), input, select, textarea');
    if (!f.length) return;
    var premier = f[0], dernier = f[f.length - 1];
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
  }

  function ouvrirDrawer(header) {
    var drawer = header.querySelector('.cs-drawer');
    var overlay = header.querySelector('.cs-drawer-overlay');
    var burger = header.querySelector('[data-cs-drawer-open]');
    if (!drawer) return;
    declencheurDrawer = document.activeElement;
    drawer.hidden = false;
    if (overlay) overlay.hidden = false;
    requestAnimationFrame(function () { drawer.classList.add('is-ouvert'); });
    document.body.classList.add('no-scroll');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    html.setAttribute('data-overlay-ouvert', 'drawer');
    if (window.csEmit) window.csEmit('cs:overlay', { ouvert: true });
    document.addEventListener('keydown', pieger);
    var premier = drawer.querySelector('button, a[href]');
    if (premier) premier.focus();
  }

  function fermerDrawer(drawer) {
    if (!drawer) drawer = document.querySelector('.cs-drawer.is-ouvert');
    if (!drawer) return;
    var header = leHeader(drawer);
    var overlay = header && header.querySelector('.cs-drawer-overlay');
    var burger = header && header.querySelector('[data-cs-drawer-open]');
    drawer.classList.remove('is-ouvert');
    document.body.classList.remove('no-scroll');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    html.removeAttribute('data-overlay-ouvert');
    if (window.csEmit) window.csEmit('cs:overlay', { ouvert: false });
    document.removeEventListener('keydown', pieger);
    setTimeout(function () {
      if (!drawer.classList.contains('is-ouvert')) { drawer.hidden = true; if (overlay) overlay.hidden = true; }
    }, 320);
    if (declencheurDrawer && declencheurDrawer.focus) declencheurDrawer.focus();
  }

  /* Ouverture / fermeture / accordéons / liens : tout délégué. */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cs-drawer-open]')) {
      ouvrirDrawer(leHeader(e.target));
      return;
    }
    if (e.target.closest('[data-cs-drawer-close]')) {
      fermerDrawer(null);
      return;
    }
    var acc = e.target.closest('[data-cs-drawer-accordeon]');
    if (acc) {
      var cible = document.getElementById(acc.getAttribute('aria-controls'));
      var ouvert = acc.getAttribute('aria-expanded') === 'true';
      acc.setAttribute('aria-expanded', String(!ouvert));
      if (cible) cible.hidden = ouvert;
      return;
    }
    /* Un lien réel dans le drawer : on referme puis la navigation suit. */
    var lien = e.target.closest('.cs-drawer a[href]');
    if (lien) fermerDrawer(null);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      fermerTousMega(null);
      fermerDrawer(null);
    }
  });

  /* =====================  TOGGLE THÈME §3.7  ===================== */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-cs-theme-toggle]')) return;
    var actuel = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', actuel);
    try { localStorage.setItem('cs_theme', actuel); } catch (err) { /* stockage indisponible */ }
  });

  /* =====================  BANDEAU ANNONCE  ===================== */
  function initAnnonce() {
    var annonce = document.querySelector('[data-cs="annonce"]');
    if (!annonce || annonce.dataset.csInit) return;
    annonce.dataset.csInit = '1';
    var cle = 'cs_annonce_' + (annonce.dataset.version || '1');
    try { if (sessionStorage.getItem(cle)) annonce.hidden = true; } catch (err) { /* rien */ }
    var btn = annonce.querySelector('[data-cs-annonce-fermer]');
    if (btn) btn.addEventListener('click', function () {
      annonce.hidden = true;
      try { sessionStorage.setItem(cle, '1'); } catch (err) { /* rien */ }
    });
  }
  initAnnonce();

  /* =====================  FOOTER : colonnes en accordéons mobiles  ===================== */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cs-footer-accordeon]');
    if (!btn) return;
    btn.setAttribute('aria-expanded', String(btn.getAttribute('aria-expanded') !== 'true'));
  });

  /* Re-rendu par l'éditeur de thème : rien à re-lier (tout est délégué),
     on ré-applique seulement l'état mémorisé du bandeau annonce. */
  document.addEventListener('shopify:section:load', initAnnonce);
})();
