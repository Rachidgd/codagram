/* ==========================================================================
   ÉLY'SKIN PARIS — comportements
   JavaScript natif, modules ES, éléments personnalisés. Aucune dépendance.

   Règles tenues par ce fichier :
   — le contenu est lisible sans JavaScript ; rien n'est masqué durablement ;
   — chaque observateur et chaque écouteur est démonté (AbortController) ;
   — `prefers-reduced-motion` coupe tout mouvement, jamais la fonctionnalité ;
   — on n'anime que `transform` et `opacity`.
   ========================================================================== */

const reduit = matchMedia('(prefers-reduced-motion: reduce)');
const finPointeur = matchMedia('(hover: hover) and (pointer: fine)');
const corps = document.body;

const reglage = (nom) => corps.dataset[nom] === 'true';

/* --------------------------------------------------------------------------
   1. APPARITIONS AU DÉFILEMENT
   -------------------------------------------------------------------------- */
function apparitions() {
  const cibles = document.querySelectorAll('[data-reveal], [data-reveal-rule]');
  if (!cibles.length) return;

  const actif = reglage('animApparitions') && !reduit.matches;
  if (!actif) {
    cibles.forEach((el) => el.classList.add('est-visible'));
    return;
  }

  // Décalage automatique dans les groupes : évite d'écrire un délai par élément.
  document.querySelectorAll('[data-reveal-groupe]').forEach((groupe) => {
    const pas = Number(groupe.dataset.revealPas || 70);
    groupe.querySelectorAll(':scope > [data-reveal]').forEach((enfant, i) => {
      if (!enfant.style.getPropertyValue('--reveal-delay')) {
        enfant.style.setProperty('--reveal-delay', `${i * pas}ms`);
      }
    });
  });

  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (!entree.isIntersecting) return;
        entree.target.classList.add('est-visible');
        observateur.unobserve(entree.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  );

  cibles.forEach((el) => {
    // Ce qui est déjà à l'écran au chargement ne doit pas clignoter.
    const boite = el.getBoundingClientRect();
    if (boite.top < window.innerHeight * 0.92 && boite.bottom > 0) {
      el.classList.add('est-visible');
      return;
    }
    observateur.observe(el);
  });
}

/* --------------------------------------------------------------------------
   2. COMPTEURS CHIFFRÉS
   -------------------------------------------------------------------------- */
function compteurs() {
  const cibles = document.querySelectorAll('[data-compteur]');
  if (!cibles.length) return;

  const actif = reglage('animCompteurs') && !reduit.matches;
  if (!actif) return;

  const formate = (valeur, decimales) =>
    valeur.toLocaleString('fr-FR', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });

  const anime = (el) => {
    const cible = parseFloat(String(el.dataset.compteur).replace(',', '.'));
    if (Number.isNaN(cible)) return;
    const decimales = (String(el.dataset.compteur).split(/[.,]/)[1] || '').length;
    const duree = 1400;
    const debut = performance.now();

    const pas = (maintenant) => {
      const p = Math.min((maintenant - debut) / duree, 1);
      // Sortie douce, sans rebond : cohérent avec le reste du thème.
      const eleve = 1 - Math.pow(1 - p, 3);
      el.textContent = formate(cible * eleve, decimales);
      if (p < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  };

  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (!entree.isIntersecting) return;
        anime(entree.target);
        observateur.unobserve(entree.target);
      });
    },
    { threshold: 0.5 }
  );

  cibles.forEach((el) => observateur.observe(el));
}

/* --------------------------------------------------------------------------
   3. CURSEUR CONTEXTUEL
   -------------------------------------------------------------------------- */
function curseur() {
  if (!reglage('animCurseur') || !finPointeur.matches || reduit.matches) return;

  const point = document.createElement('div');
  point.className = 'curseur';
  point.setAttribute('aria-hidden', 'true');
  document.body.appendChild(point);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let cx = x;
  let cy = y;
  let boucle = 0;

  const signal = new AbortController();

  const rendu = () => {
    cx += (x - cx) * 0.18;
    cy += (y - cy) * 0.18;
    point.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    boucle = requestAnimationFrame(rendu);
  };

  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      point.classList.add('est-visible');
      const survole = e.target instanceof Element ? e.target.closest('a, button, [data-curseur]') : null;
      point.classList.toggle('est-actif', Boolean(survole));
    },
    { passive: true, signal: signal.signal }
  );

  document.addEventListener(
    'pointerleave',
    () => point.classList.remove('est-visible'),
    { signal: signal.signal }
  );

  boucle = requestAnimationFrame(rendu);

  // Démontage propre si la préférence change en cours de session.
  reduit.addEventListener('change', () => {
    if (!reduit.matches) return;
    cancelAnimationFrame(boucle);
    signal.abort();
    point.remove();
  });
}

/* --------------------------------------------------------------------------
   4. EN-TÊTE
   -------------------------------------------------------------------------- */
class ElyEntete extends HTMLElement {
  connectedCallback() {
    this.signal = new AbortController();
    const s = this.signal.signal;

    this.seuil = Number(this.dataset.condenseSeuil || 24);
    this.mega = this.querySelector('[data-mega]');
    this.declencheur = this.querySelector('[data-mega-declencheur]');
    this.tiroir = document.querySelector('[data-tiroir]');

    this.surDefilement = this.surDefilement.bind(this);
    window.addEventListener('scroll', this.surDefilement, { passive: true, signal: s });
    this.surDefilement();

    this.brancherMega(s);
    this.brancherTiroir(s);
    this.brancherInversion();
  }

  disconnectedCallback() {
    this.signal?.abort();
    this.obsInversion?.disconnect();
  }

  surDefilement() {
    this.classList.toggle('est-condense', window.scrollY > this.seuil);
  }

  /* — Méga-menu : ouvrable au clic, au clavier et au survol — */
  brancherMega(s) {
    if (!this.mega || !this.declencheur) return;

    let minuterie = 0;
    const hote = this.declencheur.closest('.entete__mega-hote');

    this.ouvrirMega = () => {
      clearTimeout(minuterie);
      if (this.declencheur.getAttribute('aria-expanded') === 'true') return;
      this.mega.hidden = false;
      // Force un cycle de rendu pour que la transition parte de l'état masqué.
      requestAnimationFrame(() => this.mega.classList.add('est-ouvert'));
      this.declencheur.setAttribute('aria-expanded', 'true');
    };

    this.fermerMega = (immediat = false) => {
      if (this.declencheur.getAttribute('aria-expanded') === 'false') return;
      this.declencheur.setAttribute('aria-expanded', 'false');
      this.mega.classList.remove('est-ouvert');
      const cacher = () => {
        this.mega.hidden = true;
      };
      if (immediat || reduit.matches) cacher();
      else setTimeout(cacher, 240);
    };

    this.declencheur.addEventListener(
      'click',
      () => {
        const ouvert = this.declencheur.getAttribute('aria-expanded') === 'true';
        ouvert ? this.fermerMega() : this.ouvrirMega();
      },
      { signal: s }
    );

    if (finPointeur.matches) {
      const entrer = () => {
        clearTimeout(minuterie);
        minuterie = setTimeout(() => this.ouvrirMega(), 90);
      };
      const sortir = () => {
        clearTimeout(minuterie);
        minuterie = setTimeout(() => this.fermerMega(), 180);
      };
      hote?.addEventListener('pointerenter', entrer, { signal: s });
      hote?.addEventListener('pointerleave', sortir, { signal: s });
      this.mega.addEventListener('pointerenter', entrer, { signal: s });
      this.mega.addEventListener('pointerleave', sortir, { signal: s });
    }

    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'Escape') return;
        if (this.declencheur.getAttribute('aria-expanded') !== 'true') return;
        this.fermerMega(true);
        this.declencheur.focus();
      },
      { signal: s }
    );

    document.addEventListener(
      'focusin',
      (e) => {
        if (this.declencheur.getAttribute('aria-expanded') !== 'true') return;
        if (this.contains(e.target)) return;
        this.fermerMega(true);
      },
      { signal: s }
    );

    document.addEventListener(
      'pointerdown',
      (e) => {
        if (this.declencheur.getAttribute('aria-expanded') !== 'true') return;
        if (this.contains(e.target)) return;
        this.fermerMega();
      },
      { signal: s }
    );

    // Aperçu qui se substitue au survol de chaque protocole.
    const apercus = this.querySelectorAll('[data-apercu-cible]');
    if (apercus.length) {
      this.querySelectorAll('[data-apercu]').forEach((lien) => {
        const montrer = () => {
          const index = lien.dataset.apercu;
          apercus.forEach((fig) => {
            fig.classList.toggle('est-actif', fig.dataset.apercuCible === index);
          });
        };
        lien.addEventListener('pointerenter', montrer, { signal: s });
        lien.addEventListener('focus', montrer, { signal: s });
      });
    }
  }

  /* — Tiroir mobile : <dialog> natif — */
  brancherTiroir(s) {
    if (!this.tiroir) return;

    const ouvrir = this.querySelector('[data-tiroir-ouvrir]');
    const fermer = this.tiroir.querySelector('[data-tiroir-fermer]');

    ouvrir?.addEventListener(
      'click',
      () => {
        this.tiroir.showModal();
        ouvrir.setAttribute('aria-expanded', 'true');
        document.documentElement.style.overflow = 'hidden';
      },
      { signal: s }
    );

    const refermer = () => {
      // close() déclenche l'événement « close » qui remet l'état en place.
      this.tiroir.close();
    };

    fermer?.addEventListener('click', refermer, { signal: s });

    // Clic sur l'arrière-plan : la zone du dialogue exclut le panneau.
    this.tiroir.addEventListener(
      'click',
      (e) => {
        if (e.target === this.tiroir) refermer();
      },
      { signal: s }
    );

    this.tiroir.addEventListener(
      'close',
      () => {
        ouvrir?.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
      },
      { signal: s }
    );

    // Une navigation interne ferme le tiroir.
    this.tiroir.querySelectorAll('a[href]').forEach((lien) => {
      lien.addEventListener('click', () => this.tiroir.close(), { signal: s });
    });
  }

  /* — Inversion des couleurs au-dessus d'un bloc sombre — */
  brancherInversion() {
    const sombres = document.querySelectorAll('[data-entete-inverse]');
    if (!sombres.length) return;

    const construire = () => {
      this.obsInversion?.disconnect();
      const h = this.querySelector('.lisiere')?.getBoundingClientRect().height || 72;
      const reste = Math.max(window.innerHeight - h - 1, 0);

      this.obsInversion = new IntersectionObserver(
        (entrees) => {
          entrees.forEach((entree) => {
            entree.target.dataset.souEntete = entree.isIntersecting ? 'oui' : 'non';
          });
          const survol = [...sombres].some((el) => el.dataset.souEntete === 'oui');
          this.classList.toggle('sur-sombre', survol);
        },
        { rootMargin: `-${Math.round(h)}px 0px -${Math.round(reste)}px 0px`, threshold: 0 }
      );

      sombres.forEach((el) => this.obsInversion.observe(el));
    };

    construire();

    let redim = 0;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(redim);
        redim = setTimeout(construire, 180);
      },
      { passive: true, signal: this.signal.signal }
    );
  }
}

/* --------------------------------------------------------------------------
   5. ACCORDÉON
   -------------------------------------------------------------------------- */
class ElyAccordeon extends HTMLElement {
  connectedCallback() {
    this.signal = new AbortController();
    this.solo = this.dataset.solo === 'true';

    this.querySelectorAll('[data-accordeon-tete]').forEach((tete) => {
      // Le panneau est déplié dans le rendu serveur ; c'est le script qui le
      // referme et qui le rend inatteignable au clavier tant qu'il l'est.
      this.definir(tete, tete.getAttribute('aria-expanded') === 'true');
      tete.addEventListener('click', () => this.basculer(tete), { signal: this.signal.signal });
    });
  }

  disconnectedCallback() {
    this.signal?.abort();
  }

  basculer(tete) {
    const ouvert = tete.getAttribute('aria-expanded') === 'true';
    if (this.solo && !ouvert) {
      this.querySelectorAll('[data-accordeon-tete][aria-expanded="true"]').forEach((autre) => {
        this.definir(autre, false);
      });
    }
    this.definir(tete, !ouvert);
  }

  definir(tete, ouvrir) {
    tete.setAttribute('aria-expanded', String(ouvrir));
    const corpsPanneau = document.getElementById(tete.getAttribute('aria-controls'));
    if (!corpsPanneau) return;
    corpsPanneau.dataset.ouvert = ouvrir ? 'oui' : 'non';
    // L'attribut inert n'est retiré qu'à l'ouverture : le clavier ne traverse
    // pas un panneau replié.
    if (ouvrir) corpsPanneau.removeAttribute('inert');
    else corpsPanneau.setAttribute('inert', '');
  }
}

/* --------------------------------------------------------------------------
   5 bis. INDEX DES PROTOCOLES — aperçu flottant
   L'image suit le pointeur sur grand écran. Sur tactile, au clavier et en
   mouvement réduit, l'élément n'est jamais activé : l'index reste une simple
   liste de liens.
   -------------------------------------------------------------------------- */
class ElyIndex extends HTMLElement {
  connectedCallback() {
    if (!finPointeur.matches || reduit.matches) return;

    this.apercu = this.querySelector('[data-index-apercu]');
    this.images = this.querySelectorAll('[data-index-image]');
    if (!this.apercu || !this.images.length) return;

    this.signal = new AbortController();
    const s = this.signal.signal;

    this.x = 0;
    this.y = 0;
    this.cx = 0;
    this.cy = 0;
    this.actif = false;
    this.boucle = 0;

    const rendu = () => {
      this.cx += (this.x - this.cx) * 0.14;
      this.cy += (this.y - this.cy) * 0.14;
      // Légère inclinaison proportionnelle à la vitesse horizontale.
      const inclinaison = Math.max(-6, Math.min(6, (this.x - this.cx) * 0.08));
      this.apercu.style.transform = `translate3d(${this.cx}px, ${this.cy}px, 0) translate(-50%, -50%) rotate(${inclinaison}deg)`;
      this.boucle = requestAnimationFrame(rendu);
    };

    this.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse') return;
        this.x = e.clientX;
        this.y = e.clientY;
        if (!this.actif) {
          this.cx = this.x;
          this.cy = this.y;
        }
      },
      { passive: true, signal: s }
    );

    this.querySelectorAll('[data-index-ligne]').forEach((ligne) => {
      ligne.addEventListener(
        'pointerenter',
        (e) => {
          if (e.pointerType !== 'mouse') return;
          const index = ligne.dataset.indexLigne;
          let trouvee = false;
          this.images.forEach((img) => {
            const correspond = img.dataset.indexImage === index;
            img.classList.toggle('est-actif', correspond);
            if (correspond) trouvee = true;
          });
          this.actif = trouvee;
          this.apercu.classList.toggle('est-visible', trouvee);
        },
        { signal: s }
      );
    });

    this.addEventListener(
      'pointerleave',
      () => {
        this.actif = false;
        this.apercu.classList.remove('est-visible');
      },
      { signal: s }
    );

    this.boucle = requestAnimationFrame(rendu);
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.boucle);
    this.signal?.abort();
  }
}

/* --------------------------------------------------------------------------
   6. CHAMPS DE FORMULAIRE
   Les libellés flottants ont besoin de connaître l'état « rempli » y compris
   après un remplissage automatique du navigateur.
   -------------------------------------------------------------------------- */
function champs() {
  const saisies = document.querySelectorAll('.champ__saisie');
  if (!saisies.length) return;

  const marquer = (el) => {
    el.dataset.rempli = el.value.trim().length > 0 ? 'oui' : 'non';
  };

  saisies.forEach((el) => {
    marquer(el);
    el.addEventListener('input', () => marquer(el));
    el.addEventListener('change', () => marquer(el));
  });

  // Le remplissage automatique n'émet pas toujours d'événement.
  setTimeout(() => saisies.forEach(marquer), 350);
}

/* --------------------------------------------------------------------------
   6 bis. FORMULAIRE EN PLUSIEURS TEMPS
   Le formulaire fonctionne entièrement sans ce script : les panneaux sont
   alors simplement affichés à la suite. Ici on les replie, on valide au fil
   de la saisie et on affiche l'avancement.
   -------------------------------------------------------------------------- */
class ElyFormulaire extends HTMLElement {
  connectedCallback() {
    this.panneaux = [...this.querySelectorAll('[data-panneau]')];
    if (this.panneaux.length < 2) return;

    this.signal = new AbortController();
    const s = this.signal.signal;

    this.formulaire = this.closest('form');
    this.courant = 0;
    this.avancement = this.querySelector('[data-formulaire-avancement]');
    this.compteur = this.querySelector('[data-formulaire-compteur]');
    this.actions = this.querySelector('[data-formulaire-actions]');
    this.envoyer = this.querySelector('[data-formulaire-envoyer]');

    if (this.avancement) this.avancement.hidden = false;

    this.precedent = document.createElement('button');
    this.precedent.type = 'button';
    this.precedent.className = 'btn btn--ligne';
    this.precedent.textContent = this.dataset.libellePrecedent || 'Précédent';
    this.precedent.addEventListener('click', () => this.aller(this.courant - 1), { signal: s });

    this.suivant = document.createElement('button');
    this.suivant.type = 'button';
    this.suivant.className = 'btn';
    this.suivant.textContent = this.dataset.libelleSuivant || 'Suivant';
    this.suivant.addEventListener(
      'click',
      () => {
        if (this.validerPanneau(this.courant)) this.aller(this.courant + 1);
      },
      { signal: s }
    );

    this.actions?.prepend(this.precedent, this.suivant);

    // Un champ corrigé efface son erreur sans attendre la validation suivante.
    this.querySelectorAll('[data-requis], [data-type]').forEach((champ) => {
      champ.addEventListener(
        'input',
        () => {
          if (champ.getAttribute('aria-invalid') === 'true') this.validerChamp(champ);
        },
        { signal: s }
      );
      champ.addEventListener('blur', () => this.validerChamp(champ), { signal: s });

      // Cocher n'importe quel bouton du groupe lève l'erreur portée par le
      // premier — sans quoi le message resterait affiché après correction.
      if (champ.type === 'radio' && champ.name) {
        this.querySelectorAll(`input[type="radio"][name="${CSS.escape(champ.name)}"]`).forEach((frere) => {
          frere.addEventListener('change', () => this.validerChamp(champ), { signal: s });
        });
      }
    });

    // Dernier filet : si le script a laissé passer quelque chose, on bloque
    // l'envoi et on ramène l'utilisateur sur le premier panneau fautif.
    this.formulaire?.addEventListener(
      'submit',
      (e) => {
        for (let i = 0; i < this.panneaux.length; i += 1) {
          if (!this.validerPanneau(i)) {
            e.preventDefault();
            this.aller(i);
            return;
          }
        }
      },
      { signal: s }
    );

    this.aller(0);
  }

  disconnectedCallback() {
    this.signal?.abort();
  }

  aller(index) {
    this.courant = Math.max(0, Math.min(index, this.panneaux.length - 1));

    this.panneaux.forEach((panneau, i) => {
      const actif = i === this.courant;
      panneau.hidden = !actif;
      if (actif) panneau.removeAttribute('inert');
      else panneau.setAttribute('inert', '');
    });

    const dernier = this.courant === this.panneaux.length - 1;
    this.precedent.hidden = this.courant === 0;
    this.suivant.hidden = dernier;
    if (this.envoyer) this.envoyer.hidden = !dernier;

    if (this.compteur) {
      this.compteur.textContent = (this.dataset.libelleEtape || 'Étape %C% sur %T%')
        .replace('%C%', String(this.courant + 1))
        .replace('%T%', String(this.panneaux.length));
    }
    this.avancement?.style.setProperty('--avancement', String((this.courant + 1) / this.panneaux.length));

    // Le focus suit la progression, mais pas au premier rendu.
    if (this.aDemarre) {
      const cible = this.panneaux[this.courant].querySelector('input, select, textarea');
      cible?.focus({ preventScroll: true });
    }
    this.aDemarre = true;
  }

  validerPanneau(index) {
    const champs = this.panneaux[index].querySelectorAll('[data-requis], [data-type]');
    let valide = true;
    let premierFautif = null;

    champs.forEach((champ) => {
      if (!this.validerChamp(champ)) {
        valide = false;
        if (!premierFautif) premierFautif = champ;
      }
    });

    premierFautif?.focus({ preventScroll: true });
    return valide;
  }

  validerChamp(champ) {
    // Un groupe de boutons radio ne se juge pas bouton par bouton : c'est le
    // groupe entier qui est rempli ou vide. Seul le premier bouton porte
    // « data-requis », il répond pour tous.
    const valeur =
      champ.type === 'checkbox'
        ? champ.checked
        : champ.type === 'radio'
          ? Boolean(this.querySelector(`input[type="radio"][name="${CSS.escape(champ.name)}"]:checked`))
          : champ.value.trim();
    let message = '';

    if (champ.hasAttribute('data-requis') && !valeur) {
      message =
        champ.dataset.type === 'consentement'
          ? this.dataset.erreurConsentement || ''
          : this.dataset.erreurRequis || '';
    } else if (valeur && champ.dataset.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur)) {
      message = this.dataset.erreurEmail || '';
    } else if (valeur && champ.dataset.type === 'telephone') {
      const chiffres = String(valeur).replace(/\D/g, '');
      if (chiffres.length < 9) message = this.dataset.erreurTelephone || '';
    }

    this.afficherErreur(champ, message);
    return !message;
  }

  afficherErreur(champ, message) {
    // Un champ simple porte son message dans son propre `.champ`. Un groupe
    // (cases à cocher, boutons radio) n'en a pas : on remonte jusqu'au
    // premier ancêtre qui contient une zone d'erreur, sans jamais sortir du
    // formulaire.
    let conteneur = champ.closest('.champ');
    if (!conteneur) {
      conteneur = champ.parentElement;
      while (conteneur && conteneur !== this && !conteneur.querySelector('[data-erreur]')) {
        conteneur = conteneur.parentElement;
      }
    }
    const zone = conteneur?.querySelector('[data-erreur]');

    if (message) {
      champ.setAttribute('aria-invalid', 'true');
      if (zone) {
        zone.textContent = message;
        zone.hidden = false;
        if (!zone.id) zone.id = `err-${Math.random().toString(36).slice(2, 9)}`;
        champ.setAttribute('aria-describedby', zone.id);
      }
    } else {
      champ.removeAttribute('aria-invalid');
      champ.removeAttribute('aria-describedby');
      if (zone) {
        zone.textContent = '';
        zone.hidden = true;
      }
    }
  }
}

/* --------------------------------------------------------------------------
   7. CHARGEMENT À LA DEMANDE
   Les modules lourds — diagnostic, agenda — ne sont téléchargés que si la
   page contient réellement l'outil, et seulement à son approche.
   -------------------------------------------------------------------------- */
function moduleALaDemande(selecteur) {
  const hote = document.querySelector(selecteur);
  if (!hote || hote.dataset.moduleDemande === 'oui') return;
  hote.dataset.moduleDemande = 'oui';

  const charger = () => {
    const url = hote.dataset.module;
    if (!url) return;
    import(/* @vite-ignore */ url).catch((e) => {
      // En cas d'échec, le repli sans JavaScript reste affiché et utilisable.
      console.warn('[ely] module indisponible', selecteur, e);
    });
  };

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entrees) => {
        if (!entrees.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        charger();
      },
      { rootMargin: '400px' }
    );
    obs.observe(hote);
  } else {
    charger();
  }
}

/* --------------------------------------------------------------------------
   6 ter. COMPARAISON AVANT / APRÈS
   Le curseur est un input[type=range] natif : souris, tactile et clavier
   fonctionnent sans code. Ce module ne fait que reporter la valeur dans une
   variable CSS, et ajouter le glisser directement sur l'image.
   -------------------------------------------------------------------------- */
class ElyComparaison extends HTMLElement {
  connectedCallback() {
    this.curseur = this.querySelector('[data-comparaison-curseur]');
    if (!this.curseur) return;

    this.signal = new AbortController();
    const s = this.signal.signal;

    const appliquer = () => {
      this.style.setProperty('--position', `${this.curseur.value}%`);
    };

    this.curseur.addEventListener('input', appliquer, { signal: s });
    appliquer();

    // Glisser n'importe où sur l'image, pas seulement sur la poignée.
    // On ne capture le pointeur qu'après un appui : le défilement tactile
    // vertical reste possible tant que l'utilisateur n'a pas saisi le volet.
    let actif = false;

    const positionner = (e) => {
      const boite = this.getBoundingClientRect();
      if (!boite.width) return;
      const ratio = ((e.clientX - boite.left) / boite.width) * 100;
      this.curseur.value = String(Math.max(0, Math.min(100, ratio)));
      appliquer();
    };

    this.addEventListener(
      'pointerdown',
      (e) => {
        if (e.target === this.curseur) return;
        actif = true;
        this.setPointerCapture(e.pointerId);
        positionner(e);
      },
      { signal: s }
    );

    this.addEventListener(
      'pointermove',
      (e) => {
        if (!actif) return;
        e.preventDefault();
        positionner(e);
      },
      { signal: s }
    );

    const relacher = (e) => {
      if (!actif) return;
      actif = false;
      if (this.hasPointerCapture?.(e.pointerId)) this.releasePointerCapture(e.pointerId);
    };
    this.addEventListener('pointerup', relacher, { signal: s });
    this.addEventListener('pointercancel', relacher, { signal: s });

    this.dataset.pret = 'oui';
  }

  disconnectedCallback() {
    this.signal?.abort();
  }
}

/* --------------------------------------------------------------------------
   7 bis. SOMMAIRE D'ARTICLE
   Construit depuis les titres réellement présents dans le corps de l'article.
   Si l'article n'a aucun titre, le sommaire ne s'affiche pas du tout.
   -------------------------------------------------------------------------- */
class ElySommaire extends HTMLElement {
  connectedCallback() {
    const corps = document.querySelector(this.dataset.cible || '#corps-article');
    const nav = this.querySelector('nav');
    if (!corps || !nav) return;

    const titres = [...corps.querySelectorAll('h2, h3')];
    if (titres.length < 2) return;

    this.signal = new AbortController();

    titres.forEach((titre, i) => {
      if (!titre.id) {
        const base =
          titre.textContent
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 48) || 'section';
        titre.id = `${base}-${i}`;
      }
      const lien = document.createElement('a');
      lien.className = 'sommaire__lien';
      lien.href = `#${titre.id}`;
      lien.dataset.niveau = titre.tagName === 'H3' ? '3' : '2';
      lien.textContent = titre.textContent;
      nav.appendChild(lien);
    });

    this.hidden = false;

    // Surlignage du titre courant : bande de détection en haut du viewport.
    const liens = new Map([...nav.children].map((a) => [a.getAttribute('href').slice(1), a]));
    this.observateur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((entree) => {
          if (!entree.isIntersecting) return;
          liens.forEach((a) => a.classList.remove('est-actif'));
          liens.get(entree.target.id)?.classList.add('est-actif');
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    titres.forEach((t) => this.observateur.observe(t));
  }

  disconnectedCallback() {
    this.observateur?.disconnect();
    this.signal?.abort();
  }
}

/* --------------------------------------------------------------------------
   7 ter. PROGRESSION DE LECTURE
   -------------------------------------------------------------------------- */
function progression() {
  const barre = document.querySelector('[data-progression]');
  if (!barre) return;

  const article = document.querySelector('#corps-article');
  if (!article) {
    barre.remove();
    return;
  }

  let planifie = false;
  const calculer = () => {
    const boite = article.getBoundingClientRect();
    const parcouru = -boite.top;
    const total = boite.height - window.innerHeight;
    const ratio = total > 0 ? Math.min(Math.max(parcouru / total, 0), 1) : 0;
    barre.style.setProperty('--progression', String(ratio));
    planifie = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (planifie) return;
      planifie = true;
      requestAnimationFrame(calculer);
    },
    { passive: true }
  );
  calculer();
}

/* --------------------------------------------------------------------------
   8. DÉMARRAGE
   -------------------------------------------------------------------------- */
if (!customElements.get('ely-entete')) customElements.define('ely-entete', ElyEntete);
if (!customElements.get('ely-accordeon')) customElements.define('ely-accordeon', ElyAccordeon);
if (!customElements.get('ely-index')) customElements.define('ely-index', ElyIndex);
if (!customElements.get('ely-formulaire')) customElements.define('ely-formulaire', ElyFormulaire);
if (!customElements.get('ely-sommaire')) customElements.define('ely-sommaire', ElySommaire);
if (!customElements.get('ely-comparaison')) customElements.define('ely-comparaison', ElyComparaison);

apparitions();
compteurs();
curseur();
champs();
moduleALaDemande('ely-diagnostic');
moduleALaDemande('ely-agenda');
progression();

// Signale au filet de sécurité posé dans <head> que le thème a bien démarré.
window.__elyPret = true;

// L'éditeur de thème remonte les sections : on relance ce qui doit l'être.
document.addEventListener('shopify:section:load', () => {
  apparitions();
  compteurs();
  champs();
  moduleALaDemande('ely-diagnostic');
  moduleALaDemande('ely-agenda');
});
