/* CS-26 · cs-menu.js
   Mega menu (§6.2) : survol avec intention 80 ms + clic/Enter, Esc,
   clic extérieur, focus sortant, navigation aux flèches.
   Drawer mobile (§6.3) : focus piégé, body verrouillé, rendu du focus.
   Toggle thème (§3.7) et bandeau annonce (mémorisé en session). */
(function () {
  'use strict';

  var html = document.documentElement;
  var header = document.querySelector('[data-cs="menu"]');
  if (!header) return;

  /* ----- Mega menu ----- */
  var toggles = header.querySelectorAll('[data-cs-mega-toggle]');
  var delaiOuverture = null;
  var delaiFermeture = null;

  function panneauDe(btn) { return document.getElementById(btn.getAttribute('aria-controls')); }

  function ouvrir(btn) {
    fermerTout(btn);
    var panneau = panneauDe(btn);
    if (!panneau) return;
    panneau.hidden = false;
    requestAnimationFrame(function () { panneau.classList.add('is-ouvert'); });
    btn.setAttribute('aria-expanded', 'true');
  }

  function fermer(btn) {
    var panneau = panneauDe(btn);
    if (!panneau || panneau.hidden) return;
    panneau.classList.remove('is-ouvert');
    btn.setAttribute('aria-expanded', 'false');
    setTimeout(function () { if (!panneau.classList.contains('is-ouvert')) panneau.hidden = true; }, 350);
  }

  function fermerTout(sauf) {
    toggles.forEach(function (b) { if (b !== sauf) fermer(b); });
  }

  toggles.forEach(function (btn) {
    var item = btn.parentElement;
    var panneau = panneauDe(btn);

    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') fermer(btn);
      else ouvrir(btn);
    });

    if (window.matchMedia('(hover: hover)').matches) {
      item.addEventListener('pointerenter', function () {
        clearTimeout(delaiFermeture);
        delaiOuverture = setTimeout(function () { ouvrir(btn); }, 80);
      });
      item.addEventListener('pointerleave', function () {
        clearTimeout(delaiOuverture);
        delaiFermeture = setTimeout(function () { fermer(btn); }, 120);
      });
    }

    /* Navigation aux flèches entre items du panneau */
    if (panneau) {
      panneau.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        var liens = Array.prototype.slice.call(panneau.querySelectorAll('a, button'));
        var i = liens.indexOf(document.activeElement);
        var suivant = e.key === 'ArrowDown' ? liens[i + 1] || liens[0] : liens[i - 1] || liens[liens.length - 1];
        suivant.focus();
      });
      panneau.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) fermer(btn);
      });
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fermerTout();
  });
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) fermerTout();
  });

  /* ----- Drawer mobile ----- */
  var drawer = header.querySelector('.cs-drawer');
  var overlay = header.querySelector('.cs-drawer-overlay');
  var burger = header.querySelector('[data-cs-drawer-open]');
  var declencheur = null;

  function piegerFocus(e) {
    if (e.key !== 'Tab') return;
    var focusables = drawer.querySelectorAll('a[href], button:not([disabled]), input, select, textarea');
    if (!focusables.length) return;
    var premier = focusables[0];
    var dernier = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
  }

  function ouvrirDrawer() {
    declencheur = document.activeElement;
    drawer.hidden = false;
    overlay.hidden = false;
    requestAnimationFrame(function () { drawer.classList.add('is-ouvert'); });
    document.body.classList.add('no-scroll');
    burger.setAttribute('aria-expanded', 'true');
    html.setAttribute('data-overlay-ouvert', 'drawer');
    if (window.csEmit) window.csEmit('cs:overlay', { ouvert: true });
    drawer.addEventListener('keydown', piegerFocus);
    var premier = drawer.querySelector('button, a[href]');
    if (premier) premier.focus();
  }

  function fermerDrawer() {
    drawer.classList.remove('is-ouvert');
    document.body.classList.remove('no-scroll');
    burger.setAttribute('aria-expanded', 'false');
    html.removeAttribute('data-overlay-ouvert');
    if (window.csEmit) window.csEmit('cs:overlay', { ouvert: false });
    drawer.removeEventListener('keydown', piegerFocus);
    setTimeout(function () {
      if (!drawer.classList.contains('is-ouvert')) { drawer.hidden = true; overlay.hidden = true; }
    }, 350);
    if (declencheur) declencheur.focus();
  }

  if (drawer && burger) {
    burger.addEventListener('click', ouvrirDrawer);
    header.querySelectorAll('[data-cs-drawer-close]').forEach(function (el) {
      el.addEventListener('click', fermerDrawer);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-ouvert')) fermerDrawer();
    });
    drawer.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener('click', fermerDrawer);
    });

    /* Accordéon Services du drawer (ouvert par défaut §6.3) */
    drawer.querySelectorAll('[data-cs-drawer-accordeon]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cible = document.getElementById(btn.getAttribute('aria-controls'));
        var ouvert = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!ouvert));
        if (cible) cible.hidden = ouvert;
      });
    });
  }

  /* ----- Toggle thème visiteur §3.7 ----- */
  document.querySelectorAll('[data-cs-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var actuel = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', actuel);
      try { localStorage.setItem('cs_theme', actuel); } catch (e) { /* stockage indisponible */ }
    });
  });

  /* ----- Bandeau annonce : fermable, mémorisé en session ----- */
  var annonce = document.querySelector('[data-cs="annonce"]');
  if (annonce) {
    var cle = 'cs_annonce_' + (annonce.dataset.version || '1');
    try {
      if (sessionStorage.getItem(cle)) annonce.hidden = true;
    } catch (e) { /* stockage indisponible */ }
    var fermerBtn = annonce.querySelector('[data-cs-annonce-fermer]');
    if (fermerBtn) {
      fermerBtn.addEventListener('click', function () {
        annonce.hidden = true;
        try { sessionStorage.setItem(cle, '1'); } catch (e) { /* stockage indisponible */ }
      });
    }
  }

  /* ----- Footer : colonnes en accordéons mobiles ----- */
  document.querySelectorAll('[data-cs-footer-accordeon]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ouvert = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!ouvert));
    });
  });
})();
