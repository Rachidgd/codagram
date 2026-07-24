(function () {
  'use strict';

  /* ============================================================
     MAISON AYLA — Trustpilot officiel dans le cart drawer
     Fichier : assets/ma-cro-trustpilot.js

     Ce module n'affiche jamais de logo, d'étoile ou de wordmark
     reconstruit. Le rendu de marque vient exclusivement de la
     TrustBox officielle chargée par le script Trustpilot.
     ============================================================ */

  var CONFIG_ID = 'ma-cro-trustpilot-config';
  var TEMPLATE_ID = 'maCroTrustpilotTemplate';
  var BOOTSTRAP_ID = 'ma-cro-trustpilot-bootstrap';
  var BLOCK_ID = 'maCroTrustpilot';

  var configNode = document.getElementById(CONFIG_ID);
  if (!configNode) return;

  var config;
  try {
    config = JSON.parse(configNode.textContent);
  } catch (error) {
    return; /* Repli silencieux : le panier reste entièrement utilisable. */
  }

  /* ── Garde de publication ──────────────────────────────────────
     Le mode maquette est neutralisé dès que le thème est publié,
     même si le drapeau Liquid a été laissé à true par erreur. */
  var themeRole = (window.Shopify && window.Shopify.theme && window.Shopify.theme.role) || '';
  var isPublishedTheme = String(themeRole).toLowerCase() === 'main';
  var testMode = config.testMode === true && !isPublishedTheme;
  var isOfficial = config.configured === true;

  /* Ni identifiants officiels, ni maquette autorisée : on ne rend rien. */
  if (!isOfficial && !testMode) return;

  var state = { itemCount: null, mounted: false };

  function panelEl() {
    return document.getElementById('cdPanel');
  }

  function footerEl() {
    return document.getElementById('cdFooter');
  }

  /* ── Construction du bloc ─────────────────────────────────────── */
  function buildBlock() {
    var block = document.createElement('aside');
    block.id = BLOCK_ID;
    block.className = 'ma-cro-tp';
    block.hidden = true;

    if (isOfficial) {
      block.dataset.maTpMode = 'official';
      block.setAttribute('aria-label', 'Avis clients Trustpilot');

      var host = document.createElement('div');
      host.className = 'ma-cro-tp__widget';

      var template = document.getElementById(TEMPLATE_ID);
      if (template && template.content) host.appendChild(template.content.cloneNode(true));
      block.appendChild(host);

      if (testMode) {
        var staging = document.createElement('p');
        staging.className = 'ma-cro-tp__note';
        staging.textContent = 'Thème de staging non publié.';
        block.appendChild(staging);
      }
      return block;
    }

    /* Emplacement réservé de maquette : aucun logo, aucune étoile,
       aucune couleur de marque, aucune note présentée comme réelle. */
    block.dataset.maTpMode = 'placeholder';
    block.classList.add('ma-cro-tp--placeholder');
    block.setAttribute('aria-label', 'Emplacement réservé au widget Trustpilot officiel, maquette non publiée');

    var slot = document.createElement('div');
    slot.className = 'ma-cro-tp__widget ma-cro-tp__slot';

    var title = document.createElement('p');
    title.className = 'ma-cro-tp__slot-title';
    title.textContent = 'Emplacement du widget Trustpilot officiel';
    slot.appendChild(title);

    var note = document.createElement('p');
    note.className = 'ma-cro-tp__note';
    note.textContent =
      'Maquette de staging — valeur de test ' +
      (config.testScore || '') +
      ' non vérifiée. En attente des identifiants du compte Trustpilot Business.';
    slot.appendChild(note);

    block.appendChild(slot);
    return block;
  }

  /* ── Insertion : immédiatement sous le bouton de paiement ─────── */
  function mount() {
    var footer = footerEl();
    if (!footer) return false;

    /* Purge d'un éventuel bloc hérité de l'ancienne intégration maison. */
    var legacy = document.getElementById('maCroTrust');
    if (legacy) legacy.remove();

    var existing = document.getElementById(BLOCK_ID);
    if (existing) {
      if (footer.contains(existing)) return true;
      existing.remove(); /* Anti-doublon après remplacement du drawer. */
    }

    var block = buildBlock();
    var cta = footer.querySelector('.cd-cta');

    if (cta) {
      cta.insertAdjacentElement('afterend', block);
    } else {
      var legal = footer.querySelector('.cd-legal');
      if (legal) footer.insertBefore(block, legal);
      else footer.appendChild(block);
    }

    state.mounted = true;
    return true;
  }

  /* ── Rendu de la TrustBox officielle ──────────────────────────── */
  function renderWidget() {
    if (!isOfficial) return;

    var block = document.getElementById(BLOCK_ID);
    if (!block || block.hidden) return;

    var widget = block.querySelector('.trustpilot-widget');
    if (!widget) return;

    /* Widget déjà rendu : ne pas relancer, pas de requête inutile. */
    if (widget.querySelector('iframe')) {
      block.dataset.trustpilotReady = 'true';
      return;
    }

    if (!window.Trustpilot || typeof window.Trustpilot.loadFromElement !== 'function') return;

    try {
      window.Trustpilot.loadFromElement(widget, true);
      block.dataset.trustpilotReady = 'true';
    } catch (error) {
      /* Repli silencieux : Trustpilot n'est jamais bloquant pour le checkout. */
    }
  }

  /* ── Visibilité : masqué dès que le panier est vide ───────────── */
  function hasItems() {
    if (typeof state.itemCount === 'number') return state.itemCount > 0;

    /* Repli sans requête : le drawer masque #cdFooter tant que le panier est vide. */
    var footer = footerEl();
    return !!footer && footer.style.display !== 'none';
  }

  function sync() {
    if (!mount()) return;

    var block = document.getElementById(BLOCK_ID);
    if (!block) return;

    var visible = hasItems();
    block.hidden = !visible;

    if (!visible) {
      delete block.dataset.trustpilotReady;
      return;
    }
    renderWidget();
  }

  /* ── Observateurs : attributs uniquement, sur deux nœuds ───────
     Aucun childList, aucun subtree : le module ne peut pas
     déclencher ses propres observateurs, donc aucune boucle. */
  function watch() {
    var footer = footerEl();
    if (footer) {
      new MutationObserver(sync).observe(footer, {
        attributes: true,
        attributeFilter: ['style']
      });
    }

    var panel = panelEl();
    if (panel) {
      new MutationObserver(sync).observe(panel, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  function start() {
    if (mount()) {
      watch();
      sync();
      return true;
    }
    return false;
  }

  /* Filet de sécurité si la section du drawer arrive après ce script :
     cet observateur se déconnecte dès la première initialisation réussie. */
  function bootstrap() {
    if (start()) return;

    var observer = new MutationObserver(function () {
      if (start()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.setTimeout(function () {
      observer.disconnect();
    }, 10000);
  }

  /* ── Événements ───────────────────────────────────────────────── */

  /* Source autoritaire du nombre d'articles : émise par ma-cro-cart-ui.js,
     qui lit déjà /cart.js. Aucune requête réseau supplémentaire ici. */
  document.addEventListener('ma:cart-state', function (event) {
    var detail = event.detail || {};
    if (typeof detail.itemCount === 'number') state.itemCount = detail.itemCount;
    sync();
  });

  document.addEventListener('maison:openCart', sync);
  document.addEventListener('cart:updated', sync);

  var bootstrapScript = document.getElementById(BOOTSTRAP_ID);
  if (bootstrapScript) bootstrapScript.addEventListener('load', sync, { once: true });
  window.addEventListener('load', sync, { once: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
