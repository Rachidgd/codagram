/* CS-26 · cs-popup.js
   Popup lead 3 étapes (§11.1) : ouverture par data-cs="popup-open" uniquement
   (jamais automatique à l'arrivée), navigation entre panneaux, validation
   inline au blur, honeypot + délai minimal, concaténation des réponses dans
   contact[body], tag lead-audit / lead-devis, focus piégé, événements
   dataLayer cs:popup_open / cs:popup_step / cs:lead_submit. */
(function () {
  'use strict';

  var html = document.documentElement;
  var racine = document.querySelector('[data-cs="popup"]');
  var modal = racine && racine.querySelector('[data-cs-popup-modal]');
  var overlay = racine && racine.querySelector('.cs-popup-overlay');
  var form = racine && racine.querySelector('.cs-popup__form');
  var declencheur = null;
  var ouvertA = 0;
  var etape = 1;
  var TOTAL = 3;
  var resetStepper = null;

  /* Résolution paresseuse : le popup vit dans le groupe « superpositions », que
     l'éditeur de thème peut re-rendre. On relit toujours les nœuds courants au
     moment d'ouvrir, jamais une référence figée au chargement. */
  function resoudre() {
    racine = document.querySelector('[data-cs="popup"]');
    modal = racine && racine.querySelector('[data-cs-popup-modal]');
    overlay = racine && racine.querySelector('.cs-popup-overlay');
    form = racine && racine.querySelector('.cs-popup__form');
    return racine;
  }

  /* ----- Ouverture / fermeture ----- */
  function piegerFocus(e) {
    if (e.key !== 'Tab') return;
    var focusables = modal.querySelectorAll('a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea');
    var visibles = Array.prototype.filter.call(focusables, function (el) { return el.offsetParent !== null; });
    if (!visibles.length) return;
    var premier = visibles[0];
    var dernier = visibles[visibles.length - 1];
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
  }

  function ouvrirPopup(source) {
    if (!resoudre() || !modal || !overlay) return;
    declencheur = document.activeElement;
    ouvertA = Date.now();
    modal.hidden = false;
    overlay.hidden = false;
    requestAnimationFrame(function () {
      modal.classList.add('is-ouvert');
      overlay.classList.add('is-ouvert');
    });
    document.body.classList.add('no-scroll');
    html.setAttribute('data-overlay-ouvert', 'popup');
    if (window.csEmit) window.csEmit('cs:overlay', { ouvert: true });
    /* Init du formulaire APRÈS l'affichage : une erreur d'init ne doit jamais
       empêcher le popup de s'ouvrir. On repart toujours de l'étape 1. */
    try { if (form && !form.dataset.csInit) initForm(form); } catch (err) { /* popup ouvert quand même */ }
    if (resetStepper) { try { resetStepper(); } catch (err) { /* rien */ } }
    modal.addEventListener('keydown', piegerFocus);
    var focus = modal.querySelector('input:checked, input, button');
    if (focus) focus.focus();
    if (window.csEmit) window.csEmit('cs:popup_open', { source: source || 'inconnu' });
  }

  function fermerPopup(force) {
    if (!modal || !overlay) return;
    if (!force && etape >= 2 && form && !form.querySelector('[data-cs-popup-succes]')) {
      if (!window.confirm('Vos réponses seront perdues. Fermer quand même ?')) return;
    }
    modal.classList.remove('is-ouvert');
    overlay.classList.remove('is-ouvert');
    document.body.classList.remove('no-scroll');
    html.removeAttribute('data-overlay-ouvert');
    if (window.csEmit) window.csEmit('cs:overlay', { ouvert: false });
    modal.removeEventListener('keydown', piegerFocus);
    setTimeout(function () {
      if (!modal.classList.contains('is-ouvert')) { modal.hidden = true; overlay.hidden = true; }
    }, 350);
    if (declencheur) declencheur.focus();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cs="popup-open"]');
    if (btn) {
      e.preventDefault();
      var section = btn.closest('section, header, footer, div[id]');
      ouvrirPopup(section ? section.id || section.className.split(' ')[0] : 'page');
    }
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cs-popup-fermer]')) fermerPopup(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-ouvert')) fermerPopup(false);
  });

  /* Déclencheurs optionnels, désactivés par défaut (§11.1) */
  if (racine && racine.dataset.exitIntent === 'true' && window.matchMedia('(pointer: fine)').matches) {
    var exitFait = false;
    document.addEventListener('pointerleave', function (e) {
      if (!exitFait && e.clientY <= 0 && modal && !modal.classList.contains('is-ouvert')) {
        exitFait = true;
        ouvrirPopup('exit-intent');
      }
    });
  }
  if (racine && racine.dataset.scroll70 === 'true' && document.body.className.indexOf('template-suffix-service') !== -1) {
    var scrollFait = false;
    window.addEventListener('scroll', function () {
      if (scrollFait) return;
      var p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (p > 0.7) { scrollFait = true; ouvrirPopup('scroll-70'); }
    }, { passive: true });
  }

  /* ----- Stepper (partagé : popup + formulaire inline de cs-contact) ----- */
  function initStepper(conteneur) {
    var etapes = conteneur.querySelectorAll('[data-cs-etape]');
    if (!etapes.length) return;
    var barre = conteneur.querySelector('[data-cs-progression]');
    var label = conteneur.querySelector('[data-cs-etape-label]');
    var courante = 1;

    function afficher(n) {
      etapes.forEach(function (panneau) {
        var num = parseInt(panneau.dataset.csEtape, 10);
        panneau.classList.toggle('is-active', num === n);
        panneau.classList.toggle('is-avant', num < n);
      });
      if (barre) barre.style.width = (n / TOTAL * 100) + '%';
      if (label) label.textContent = 'Étape ' + n + ' sur ' + TOTAL;
      courante = n;
      if (conteneur === form || conteneur.contains(form)) etape = n;
      var actif = conteneur.querySelector('[data-cs-etape="' + n + '"]');
      var focus = actif && actif.querySelector('input:not([type="hidden"]), select, button');
      if (focus && n > 1) focus.focus();
      if (window.csEmit) window.csEmit('cs:popup_step', { etape: n });
    }

    conteneur.querySelectorAll('[data-cs-suivant]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (courante < TOTAL) afficher(courante + 1);
        majMode(conteneur);
      });
    });
    conteneur.querySelectorAll('[data-cs-retour]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (courante > 1) afficher(courante - 1);
      });
    });
    if (conteneur === form || conteneur.contains(form)) resetStepper = function () { afficher(1); };
    afficher(1);
  }

  /* Branche devis : adapte bouton final + tag (§11.1, décision A1) */
  function majMode(conteneur) {
    var choix = conteneur.querySelector('input[name="objectif"]:checked');
    var envoyer = conteneur.querySelector('[data-cs-envoyer]');
    var tags = conteneur.querySelector('[data-cs-tags]');
    var devis = choix && choix.dataset.devis === 'true';
    if (envoyer) envoyer.textContent = devis ? envoyer.dataset.labelDevis : envoyer.dataset.labelAudit;
    if (tags) tags.value = devis ? 'lead-devis' : 'lead-audit';
  }

  /* ----- Validation inline au blur (messages humains) ----- */
  function erreurChamp(input, message) {
    var champ = input.closest('.cs-field');
    if (!champ) return;
    var zone = champ.querySelector('.cs-field__erreur');
    champ.classList.toggle('a-erreur', !!message);
    if (zone) zone.textContent = message || '';
  }

  function validerEmail(input) {
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    erreurChamp(input, ok ? '' : racine.dataset.erreurEmail);
    return ok;
  }
  function validerPrenom(input) {
    var ok = input.value.trim().length > 0;
    erreurChamp(input, ok ? '' : racine.dataset.erreurPrenom);
    return ok;
  }

  function initForm(conteneur) {
    var f = conteneur.tagName === 'FORM' ? conteneur : conteneur.querySelector('form');
    if (!f || f.dataset.csInit) return;
    f.dataset.csInit = '1';

    initStepper(f);

    var email = f.querySelector('[data-cs-email]');
    var prenom = f.querySelector('[data-cs-prenom]');
    if (email) email.addEventListener('blur', function () { if (email.value) validerEmail(email); });
    if (prenom) prenom.addEventListener('blur', function () { if (document.activeElement !== prenom) validerPrenom(prenom); });
    f.querySelectorAll('input[name="objectif"]').forEach(function (radio) {
      radio.addEventListener('change', function () { majMode(f); });
    });

    var utm = f.querySelector('[data-cs-utm]');
    if (utm) {
      var params = new URLSearchParams(window.location.search);
      var valeurs = [];
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (cle) {
        if (params.get(cle)) valeurs.push(cle + '=' + params.get(cle));
      });
      utm.value = valeurs.join(' | ');
    }

    f.addEventListener('submit', function (e) {
      var hp = f.querySelector('[data-cs-hp]');
      if (hp && hp.value !== '') { e.preventDefault(); return; }        /* honeypot */
      if (Date.now() - (ouvertA || performance.timing.responseEnd) < 3000) { e.preventDefault(); return; } /* délai minimal */

      var valide = true;
      if (prenom && !validerPrenom(prenom)) valide = false;
      if (email && !validerEmail(email)) valide = false;
      var rgpd = f.querySelector('[data-cs-rgpd]');
      var rgpdErreur = f.querySelector('[data-cs-rgpd-erreur]');
      if (rgpd && !rgpd.checked) {
        valide = false;
        if (rgpdErreur) { rgpdErreur.textContent = racine.dataset.erreurRgpd; rgpdErreur.style.display = 'block'; }
      } else if (rgpdErreur) {
        rgpdErreur.textContent = '';
      }
      if (!valide) { e.preventDefault(); return; }

      /* Concaténation des réponses dans contact[body] */
      var corps = f.querySelector('[data-cs-corps]');
      if (corps) {
        var lignes = [];
        var objectif = f.querySelector('input[name="objectif"]:checked');
        if (objectif) lignes.push('Objectif : ' + objectif.value);
        var site = f.querySelector('input[name="site_url"]');
        var sansSite = f.querySelector('input[name="pas_de_site"]');
        lignes.push('Site : ' + (sansSite && sansSite.checked ? 'Pas encore de site' : (site && site.value) || 'Non renseigné'));
        var zone = f.querySelector('input[name="zone"]');
        if (zone && zone.value) lignes.push('Ville / zone : ' + zone.value);
        var budget = f.querySelector('select[name="budget"]');
        if (budget) lignes.push('Budget mensuel : ' + budget.value);
        var serviceCtx = f.querySelector('input[name="service_contexte"]');
        if (serviceCtx && serviceCtx.value) lignes.push('Service (contexte page) : ' + serviceCtx.value);
        var source = f.querySelector('input[name="page_source"]');
        if (source && source.value) lignes.push('Page source : ' + source.value);
        var utmChamp = f.querySelector('[data-cs-utm]');
        if (utmChamp && utmChamp.value) lignes.push('UTM : ' + utmChamp.value);
        var tel = f.querySelector('input[name="contact[phone]"]');
        if (tel && tel.value) lignes.push('Téléphone : ' + tel.value);
        lignes.push('Consentement RGPD : oui');
        corps.value = lignes.join('\n');
      }

      try { if (prenom) sessionStorage.setItem('cs_lead_prenom', prenom.value.trim()); } catch (err) { /* stockage indisponible */ }
      var tags = f.querySelector('[data-cs-tags]');
      if (window.csEmit) window.csEmit('cs:lead_submit', {
        objectif: (f.querySelector('input[name="objectif"]:checked') || {}).value || '',
        mode: tags ? tags.value.replace('lead-', '') : 'audit'
      });
    });
  }

  if (form) initForm(form);
  document.querySelectorAll('[data-cs="lead-inline"]').forEach(initForm);

  /* ----- Écran de succès après rechargement ----- */
  var succes = racine && racine.querySelector('[data-cs-popup-succes]');
  if (succes) {
    var prenomSpan = succes.querySelector('[data-cs-succes-prenom]');
    try {
      var p = sessionStorage.getItem('cs_lead_prenom');
      if (p && prenomSpan) prenomSpan.textContent = ', ' + p;
      sessionStorage.removeItem('cs_lead_prenom');
    } catch (err) { /* stockage indisponible */ }
    /* Le formulaire a été posté depuis le popup : on ré-affiche la confirmation. */
    if (window.location.search.indexOf('contact_posted=true') !== -1 &&
        !document.querySelector('[data-cs="lead-inline"]')) {
      ouvrirPopup('confirmation');
    }
  }
})();
