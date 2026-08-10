/* ==========================================================================
   ÉLY'SKIN PARIS — agenda de rendez-vous
   Module chargé à la demande par ely.js, uniquement si la section est
   présente et proche du viewport.

   Les créneaux ne sont pas stockés : ils sont recalculés à chaque affichage
   à partir des plages d'ouverture saisies dans l'admin. Il n'y a donc rien à
   synchroniser, et modifier une plage se voit immédiatement sur la boutique.

   Deux précautions de fond :

   — Le temps est traité en heure du cabinet, jamais en heure du visiteur.
     Quelqu'un qui réserve depuis Casablanca voit les horaires parisiens, ce
     qui est la seule lecture utile pour se présenter à un rendez-vous. Les
     dates sont ancrées à midi UTC et manipulées avec les accesseurs UTC :
     aucun changement d'heure ne peut décaler un jour.

   — Une demande n'est pas une réservation. Sans serveur, rien ne verrouille
     un créneau entre deux visiteurs ; la section l'annonce explicitement et
     le cabinet confirme.
   ========================================================================== */

const reduit = matchMedia('(prefers-reduced-motion: reduce)');

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function lireJSON(hote, selecteur) {
  const noeud = hote.querySelector(selecteur);
  if (!noeud) return null;
  try {
    return JSON.parse(noeud.textContent);
  } catch (e) {
    console.warn('[ely] données d\'agenda illisibles', e);
    return null;
  }
}

/* « HH:MM » → minutes depuis minuit. */
function enMinutes(heure) {
  const [h, m] = String(heure || '').split(':');
  const total = Number(h) * 60 + Number(m);
  return Number.isFinite(total) ? total : null;
}

function enHeure(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* Date ISO ancrée à midi UTC : les accesseurs UTC deviennent sûrs. */
function jour(iso) {
  return new Date(`${iso}T12:00:00Z`);
}

function enISO(date) {
  return date.toISOString().slice(0, 10);
}

/* Date et heure courantes telles que les vit le cabinet, pas le visiteur. */
function maintenantAuCabinet(fuseau) {
  const format = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuseau,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const p = Object.fromEntries(format.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    minutes: Number(p.hour) * 60 + Number(p.minute),
  };
}

class ElyAgenda extends HTMLElement {
  connectedCallback() {
    if (this.dataset.pret === 'oui') return;

    this.soins = (lireJSON(this, '[data-agenda-soins]') || []).filter((s) => s.duree > 0);
    this.plages = lireJSON(this, '[data-agenda-plages]') || [];
    this.fermetures = lireJSON(this, '[data-agenda-fermetures]') || [];
    if (!this.soins.length || !this.plages.length) return;

    this.repli = this.querySelector('[data-agenda-repli]');
    this.formulaire = this.querySelector('[data-agenda-formulaire]');
    this.succes = this.querySelector('[data-agenda-succes]');
    this.rappel = this.querySelector('[data-agenda-rappel]');

    this.fuseau = this.dataset.fuseau || 'Europe/Paris';
    this.horizon = Number(this.dataset.horizon || 28);
    this.delai = Number(this.dataset.delai || 24) * 60;

    this.langue = document.documentElement.lang || 'fr';
    this.formatJour = new Intl.DateTimeFormat(this.langue, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    });
    this.formatCourt = new Intl.DateTimeFormat(this.langue, {
      weekday: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

    this.soin = null;
    this.date = null;
    this.creneau = null;

    this.scene = document.createElement('div');
    this.scene.className = 'agenda__scene';
    const capture = this.querySelector('.agenda__capture');
    if (capture) this.insertBefore(this.scene, capture);
    else this.appendChild(this.scene);

    if (this.repli) {
      this.repli.hidden = true;
      this.repli.setAttribute('inert', '');
    }

    this.dataset.pret = 'oui';

    if (this.succes) this.dessinerEnvoi();
    else this.dessiner();

    // L'app, si elle est installée, connaît les rendez-vous déjà pris. On
    // affiche d'abord notre estimation — instantanée — puis on la corrige.
    this.interrogerServeur();
    this.brancherEnvoi();
  }

  /* Sans l'app, le formulaire part par e-mail : c'est une demande, et la
     section le dit. Avec l'app, l'envoi passe d'abord par le proxy, qui pose
     un vrai verrou sur le créneau. En cas de panne du proxy, on laisse
     l'envoi natif se faire : mieux vaut une demande par e-mail qu'un
     prospect perdu. */
  brancherEnvoi() {
    const proxy = this.dataset.proxy;
    const formulaire = this.querySelector('.agenda__capture');
    if (!proxy || !formulaire) return;

    formulaire.addEventListener('submit', async (e) => {
      if (formulaire.dataset.replier === 'oui') return;
      if (!formulaire.reportValidity()) return;
      e.preventDefault();

      const champs = new FormData(formulaire);
      const corps = new FormData();
      corps.set('soin', champs.get('contact[Soin — identifiant]') || '');
      corps.set('date', champs.get('contact[Date souhaitée]') || '');
      corps.set('heure', champs.get('contact[Heure souhaitée]') || '');
      corps.set('nom', champs.get('contact[name]') || '');
      corps.set('email', champs.get('contact[email]') || '');
      corps.set('telephone', champs.get('contact[phone]') || '');
      corps.set('message', champs.get('contact[body]') || '');
      corps.set('reference', champs.get('contact[reference-rdv]') || '');

      let reponse;
      try {
        reponse = await fetch(`${proxy}/reserver`, { method: 'POST', body: corps });
      } catch {
        formulaire.dataset.replier = 'oui';
        formulaire.submit();
        return;
      }

      if (reponse.ok) {
        this.confirmer();
        return;
      }

      if (reponse.status === 409) {
        // Quelqu'un a pris le créneau entre l'affichage et l'envoi.
        this.creneau = null;
        await this.interrogerServeur();
        this.dessiner();
        this.signaler(this.dataset.libelleRepris || '');
        return;
      }

      formulaire.dataset.replier = 'oui';
      formulaire.submit();
    });
  }

  signaler(message) {
    if (!message) return;
    const zone = document.createElement('p');
    zone.className = 'formulaire__message formulaire__message--erreur';
    zone.setAttribute('role', 'alert');
    zone.tabIndex = -1;
    zone.textContent = message;
    this.scene.prepend(zone);
    zone.focus();
  }

  confirmer() {
    this.masquerCapture();
    this.scene.innerHTML = '';
    const message = document.createElement('p');
    message.className = 'formulaire__message formulaire__message--succes';
    message.setAttribute('role', 'status');
    message.tabIndex = -1;
    message.textContent = this.dataset.libelleReserve || '';
    this.scene.appendChild(message);
    message.focus();
  }

  /* — Créneaux fermes, quand l'app est installée —
     Le calcul local ignore les réservations : il ne peut pas les connaître.
     Le proxy, lui, les déduit. Tant qu'il ne répond pas, la section reste
     utilisable avec son estimation ; c'est ce qui la rend indépendante de
     l'hébergement de l'app. */
  async interrogerServeur() {
    const proxy = this.dataset.proxy;
    if (!proxy) return;

    try {
      const reponse = await fetch(`${proxy}/creneaux`, { headers: { Accept: 'application/json' } });
      if (!reponse.ok) return;
      const data = await reponse.json();
      if (!Array.isArray(data?.soins) || !data.soins.length) return;

      this.serveur = new Map(data.soins.map((s) => [s.handle, s.jours]));

      // L'app répond : le créneau devient ferme, et la mention affichée doit
      // le dire. Tant qu'elle n'a pas répondu, c'est la mention prudente qui
      // reste — on ne promet pas une réservation qu'on ne peut pas tenir.
      const mention = this.querySelector('[data-agenda-mention]');
      if (mention && this.dataset.mentionFerme) mention.textContent = this.dataset.mentionFerme;

      this.dessiner();
    } catch {
      // Hors ligne, app arrêtée, proxy mal configuré : on garde l'estimation.
    }
  }

  /* — Calcul des créneaux — */

  estFerme(iso) {
    return this.fermetures.some((f) => f.debut && f.fin && iso >= f.debut && iso <= f.fin);
  }

  plagesDuJour(iso, soin) {
    const nomJour = JOURS[jour(iso).getUTCDay()];
    return this.plages.filter((p) => {
      if (p.jour !== nomJour) return false;
      // Une plage sans soin déclaré est ouverte à tous les soins.
      if (Array.isArray(p.soins) && p.soins.length) return p.soins.includes(soin.handle);
      return true;
    });
  }

  creneaux(iso, soin) {
    if (this.estFerme(iso)) return [];

    const pas = soin.duree + (soin.battement || 0);
    const maintenant = maintenantAuCabinet(this.fuseau);
    const plancher = iso === maintenant.date ? maintenant.minutes + this.delai : -1;
    if (iso < maintenant.date) return [];

    const liste = [];
    this.plagesDuJour(iso, soin).forEach((p) => {
      const debut = enMinutes(p.debut);
      const fin = enMinutes(p.fin);
      if (debut === null || fin === null) return;
      for (let t = debut; t + soin.duree <= fin; t += pas) {
        if (t > plancher) liste.push(t);
      }
    });

    return [...new Set(liste)].sort((a, b) => a - b);
  }

  joursOuverts(soin) {
    // Réponse du serveur : elle fait autorité, elle a déduit les rendez-vous
    // déjà pris.
    const ferme = this.serveur?.get(soin.handle);
    if (ferme) {
      return ferme
        .map((j) => ({ iso: j.date, creneaux: j.creneaux.map(enMinutes).filter((m) => m !== null) }))
        .filter((j) => j.creneaux.length);
    }

    const liste = [];
    const curseur = jour(maintenantAuCabinet(this.fuseau).date);
    for (let i = 0; i < this.horizon; i += 1) {
      const iso = enISO(curseur);
      const creneaux = this.creneaux(iso, soin);
      if (creneaux.length) liste.push({ iso, creneaux });
      curseur.setUTCDate(curseur.getUTCDate() + 1);
    }
    return liste;
  }

  /* — Rendu — */

  dessiner() {
    this.scene.innerHTML = '';
    this.scene.append(this.blocSoins());

    if (!this.soin) {
      this.masquerCapture();
      return;
    }

    const ouverts = this.joursOuverts(this.soin);
    this.scene.append(this.blocJours(ouverts));

    if (!ouverts.length) {
      this.masquerCapture();
      return;
    }

    const jourActif = ouverts.find((j) => j.iso === this.date) || ouverts[0];
    this.date = jourActif.iso;
    this.scene.append(this.blocCreneaux(jourActif));

    if (this.creneau === null || !jourActif.creneaux.includes(this.creneau)) {
      this.masquerCapture();
    } else {
      this.afficherCapture();
    }
  }

  titre(texte) {
    const t = document.createElement('p');
    t.className = 'agenda__legende';
    t.textContent = texte;
    return t;
  }

  blocSoins() {
    const bloc = document.createElement('fieldset');
    bloc.className = 'agenda__bloc';

    const legende = document.createElement('legend');
    legende.className = 'agenda__legende';
    legende.textContent = this.dataset.libelleSoin || 'Quel soin ?';
    bloc.appendChild(legende);

    const liste = document.createElement('div');
    liste.className = 'agenda__soins';

    this.soins.forEach((soin, i) => {
      const id = `agenda-soin-${i}`;
      const etiquette = document.createElement('label');
      etiquette.className = 'agenda__soin';
      etiquette.setAttribute('for', id);

      const saisie = document.createElement('input');
      saisie.type = 'radio';
      saisie.name = 'agenda-soin';
      saisie.id = id;
      saisie.className = 'agenda__radio';
      saisie.checked = this.soin ? this.soin.handle === soin.handle : false;
      saisie.addEventListener('change', () => {
        this.soin = soin;
        this.date = null;
        this.creneau = null;
        this.dessiner();
      });

      const texte = document.createElement('span');
      texte.className = 'agenda__soin-texte';
      texte.textContent = soin.nom;

      const duree = document.createElement('span');
      duree.className = 'agenda__soin-duree';
      duree.textContent = (this.dataset.libelleDuree || '%D% min').replace('%D%', String(soin.duree));

      etiquette.append(saisie, texte, duree);
      liste.appendChild(etiquette);
    });

    bloc.appendChild(liste);
    return bloc;
  }

  blocJours(ouverts) {
    const bloc = document.createElement('div');
    bloc.className = 'agenda__bloc';
    bloc.append(this.titre(this.dataset.libelleJour || 'Quel jour ?'));

    if (!ouverts.length) {
      const vide = document.createElement('p');
      vide.className = 'agenda__vide';
      vide.textContent = this.dataset.libelleAucunJour || '';
      bloc.appendChild(vide);
      return bloc;
    }

    const piste = document.createElement('div');
    piste.className = 'agenda__jours';
    piste.setAttribute('role', 'tablist');

    ouverts.forEach((j) => {
      const bouton = document.createElement('button');
      bouton.type = 'button';
      bouton.className = 'agenda__jour';
      bouton.setAttribute('role', 'tab');
      bouton.setAttribute('aria-selected', String(j.iso === this.date));
      if (j.iso === this.date) bouton.classList.add('est-actif');

      const d = jour(j.iso);
      const parties = this.formatCourt.formatToParts(d);
      const nom = parties.find((p) => p.type === 'weekday')?.value || '';
      const num = parties.find((p) => p.type === 'day')?.value || '';

      bouton.innerHTML = `<span class="agenda__jour-nom"></span><span class="agenda__jour-num"></span>`;
      bouton.firstChild.textContent = nom;
      bouton.lastChild.textContent = num;
      bouton.setAttribute('aria-label', this.formatJour.format(d));

      bouton.addEventListener('click', () => {
        this.date = j.iso;
        this.creneau = null;
        this.dessiner();
      });

      piste.appendChild(bouton);
    });

    bloc.appendChild(piste);
    return bloc;
  }

  blocCreneaux(jourActif) {
    const bloc = document.createElement('div');
    bloc.className = 'agenda__bloc';

    const legende = this.titre(
      (this.dataset.libelleCreneau || 'Quelle heure, le %J% ?').replace(
        '%J%',
        this.formatJour.format(jour(jourActif.iso))
      )
    );
    bloc.append(legende);

    const grille = document.createElement('div');
    grille.className = 'agenda__creneaux';

    jourActif.creneaux.forEach((minutes) => {
      const bouton = document.createElement('button');
      bouton.type = 'button';
      bouton.className = 'agenda__creneau';
      bouton.textContent = enHeure(minutes);
      bouton.setAttribute('aria-pressed', String(minutes === this.creneau));
      if (minutes === this.creneau) bouton.classList.add('est-actif');
      bouton.addEventListener('click', () => {
        this.creneau = minutes;
        this.dessiner();
        if (this.formulaire && !this.formulaire.hidden) {
          const cible = this.formulaire.querySelector('input:not([type="hidden"])');
          cible?.focus({ preventScroll: !reduit.matches });
        }
      });
      grille.appendChild(bouton);
    });

    bloc.appendChild(grille);
    return bloc;
  }

  /* — Formulaire de demande — */

  afficherCapture() {
    if (!this.formulaire) return;

    const d = jour(this.date);
    const libelle = `${this.formatJour.format(d)} — ${enHeure(this.creneau)}`;

    this.remplirChamp('soin', this.soin.nom);
    this.remplirChamp('handle', this.soin.handle);
    this.remplirChamp('date', this.date);
    this.remplirChamp('heure', enHeure(this.creneau));
    this.remplirChamp('recap', `${this.soin.nom} — ${libelle} (${this.soin.duree} min)`);

    if (this.rappel) {
      this.rappel.textContent = (this.dataset.libelleRappel || '%S% — %Q%')
        .replace('%S%', this.soin.nom)
        .replace('%Q%', libelle);
      this.rappel.hidden = false;
    }

    this.formulaire.hidden = false;
  }

  masquerCapture() {
    if (this.formulaire) this.formulaire.hidden = true;
  }

  remplirChamp(cle, valeur) {
    const champ = this.querySelector(`[data-agenda-champ="${cle}"]`);
    if (champ) champ.value = valeur;
  }

  dessinerEnvoi() {
    this.masquerCapture();
    this.scene.innerHTML = '';
    this.scene.appendChild(this.succes);

    const reprendre = document.createElement('button');
    reprendre.type = 'button';
    reprendre.className = 'agenda__reprendre';
    reprendre.textContent = this.dataset.libelleReprendre || 'Demander un autre créneau';
    reprendre.addEventListener('click', () => {
      this.soin = null;
      this.date = null;
      this.creneau = null;
      this.dessiner();
    });
    this.scene.appendChild(reprendre);

    this.succes.focus();
  }
}

if (!customElements.get('ely-agenda')) {
  customElements.define('ely-agenda', ElyAgenda);
}

export { ElyAgenda, enMinutes, enHeure };
