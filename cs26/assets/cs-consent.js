/* CS-26 · cs-consent.js
   Bannière cookies + Consent Mode v2 (§11.2).
   Défauts denied posés inline dans le head. Ici : lecture du cookie
   first-party cs_consent (JSON versionné), consent update, chargement de
   GA4 UNIQUEMENT si analytics accordé, réouverture via « Gérer mes cookies ». */
(function () {
  'use strict';

  var racine = document.querySelector('[data-cs="consent"]');
  if (!racine) return;

  var carte = racine.querySelector('.cs-consent');
  var panneau = racine.querySelector('[data-cs-consent-panneau]');
  var actions = racine.querySelector('[data-cs-consent-actions]');
  var swAnalytics = racine.querySelector('[data-cs-consent-analytics]');
  var swAds = racine.querySelector('[data-cs-consent-ads]');
  var ga4 = racine.dataset.ga4 || '';
  var duree = parseInt(racine.dataset.duree, 10) || 180;
  var VERSION = 1;
  var ga4Charge = false;

  function lireCookie() {
    var m = document.cookie.match(/(?:^|;\s*)cs_consent=([^;]+)/);
    if (!m) return null;
    try {
      var v = JSON.parse(decodeURIComponent(m[1]));
      return v && v.v === VERSION ? v : null;
    } catch (e) { return null; }
  }

  function ecrireCookie(consent) {
    var valeur = encodeURIComponent(JSON.stringify(consent));
    document.cookie = 'cs_consent=' + valeur +
      '; max-age=' + (duree * 86400) +
      '; path=/; SameSite=Lax; Secure';
  }

  function chargerGA4() {
    if (ga4Charge || !ga4) return;
    ga4Charge = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga4);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', ga4, { anonymize_ip: true });
  }

  function appliquer(consent, persister) {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.ads ? 'granted' : 'denied',
      ad_user_data: consent.ads ? 'granted' : 'denied',
      ad_personalization: consent.ads ? 'granted' : 'denied'
    });
    if (consent.analytics) chargerGA4();
    if (persister) {
      ecrireCookie(consent);
      if (window.csEmit) window.csEmit('cs:consent_update', { analytics: consent.analytics, ads: consent.ads });
    }
  }

  function afficher() {
    var actuel = lireCookie();
    if (swAnalytics) swAnalytics.checked = actuel ? !!actuel.analytics : false;
    if (swAds) swAds.checked = actuel ? !!actuel.ads : false;
    carte.hidden = false;
    requestAnimationFrame(function () { carte.classList.add('is-visible'); });
    var premier = carte.querySelector('button');
    if (premier) premier.focus();
  }

  function masquer() {
    carte.classList.remove('is-visible');
    setTimeout(function () { if (!carte.classList.contains('is-visible')) carte.hidden = true; }, 350);
  }

  function choisir(analytics, ads) {
    appliquer({ v: VERSION, analytics: analytics, ads: ads, ts: Date.now() }, true);
    masquer();
  }

  racine.querySelector('[data-cs-consent-tout]').addEventListener('click', function () {
    choisir(true, swAds ? true : false);
  });
  racine.querySelector('[data-cs-consent-rien]').addEventListener('click', function () {
    choisir(false, false);
  });
  var boutonPerso = racine.querySelector('[data-cs-consent-perso]');
  boutonPerso.addEventListener('click', function () {
    var ouvert = !panneau.hidden;
    panneau.hidden = ouvert;
    boutonPerso.setAttribute('aria-expanded', String(!ouvert));
  });
  racine.querySelector('[data-cs-consent-enregistrer]').addEventListener('click', function () {
    choisir(swAnalytics ? swAnalytics.checked : false, swAds ? swAds.checked : false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !carte.hidden) masquer();
  });

  /* Réouverture : « Gérer mes cookies » dans le footer (§7) */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cs="consent-open"]')) {
      panneau.hidden = false;
      boutonPerso.setAttribute('aria-expanded', 'true');
      afficher();
    }
  });

  /* Premier rendu : cookie valide = consentement appliqué, pas de bannière.
     Sinon la bannière entre après 800 ms (jamais concurrente du LCP). */
  var existant = lireCookie();
  if (existant) {
    appliquer(existant, false);
  } else {
    setTimeout(afficher, 800);
  }
})();
