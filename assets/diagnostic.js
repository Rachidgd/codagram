/* ==========================================================================
   ÉLY'SKIN PARIS — diagnostic interactif
   Module chargé à la demande par ely.js, uniquement si la section est
   présente et proche du viewport.

   Le score n'est pas une boîte noire : chaque protocole est noté sur quatre
   critères réglés par le cabinet dans l'éditeur de thème. Une contre-
   indication (réactivité ou éviction incompatible) est éliminatoire, pas
   simplement pénalisante — c'est un choix de responsabilité, pas de calcul.
   ========================================================================== */

const reduit = matchMedia('(prefers-reduced-motion: reduce)');

/* Barème. Les valeurs sont volontairement lisibles et ajustables. */
const POIDS = {
  objectif: 5,
  zone: 2,
  reactiviteAdaptee: 2,
  evictionCompatible: 2,
  evictionPlusCourte: 1,
};

const RANG_EVICTION = { aucune: 0, courte: 1, longue: 2 };
const RANG_DISPO = { aucune: 0, courte: 1, longue: 2 };

function lireJSON(hote, selecteur) {
  const noeud = hote.querySelector(selecteur);
  if (!noeud) return null;
  try {
    return JSON.parse(noeud.textContent);
  } catch (e) {
    console.warn('[ely] données de diagnostic illisibles', e);
    return null;
  }
}

function noter(protocole, reponses) {
  let score = 0;
  const raisons = [];

  // — Contre-indications éliminatoires —
  if (reponses.peau === 'reactive' && protocole.reactivite === 'deconseille') {
    return { score: -1, raisons, ecarte: true };
  }
  if (RANG_EVICTION[protocole.eviction] > RANG_DISPO[reponses.dispo]) {
    return { score: -1, raisons, ecarte: true };
  }

  // — Objectif : le critère qui pèse le plus —
  if (protocole.objectifs.includes(reponses.objectif)) {
    score += POIDS.objectif;
    raisons.push('objectif');
  }

  // — Zone —
  if (protocole.zones.includes(reponses.zone)) {
    score += POIDS.zone;
    raisons.push('zone');
  }

  // — Tolérance —
  if (reponses.peau === 'reactive' && protocole.reactivite === 'adapte') {
    score += POIDS.reactiviteAdaptee;
    raisons.push('tolerance');
  }

  // — Suites : à égalité, on préfère le protocole qui immobilise le moins —
  const ecart = RANG_DISPO[reponses.dispo] - RANG_EVICTION[protocole.eviction];
  if (ecart === 0) score += POIDS.evictionCompatible;
  else if (ecart > 0) score += POIDS.evictionPlusCourte;

  return { score, raisons, ecarte: false };
}

function classer(protocoles, reponses) {
  return protocoles
    .map((p) => ({ protocole: p, ...noter(p, reponses) }))
    .filter((r) => !r.ecarte && r.score > 0)
    .sort((a, b) => b.score - a.score);
}

class ElyDiagnostic extends HTMLElement {
  connectedCallback() {
    if (this.dataset.pret === 'oui') return;

    this.questions = lireJSON(this, '[data-diagnostic-questions]') || [];
    this.protocoles = lireJSON(this, '[data-diagnostic-protocoles]') || [];
    if (!this.questions.length || !this.protocoles.length) return;

    this.repli = this.querySelector('[data-diagnostic-repli]');
    this.etape = 0;
    this.reponses = {};
    this.minuterie = 0;

    this.scene = document.createElement('div');
    this.scene.className = 'diagnostic__scene';
    this.appendChild(this.scene);

    // Le repli reste dans le document pour l'indexation, mais sort du flux
    // visuel et de l'ordre de tabulation une fois l'outil opérationnel.
    if (this.repli) {
      this.repli.hidden = true;
      this.repli.setAttribute('inert', '');
    }

    this.dataset.pret = 'oui';
    this.dessinerQuestion();
  }

  disconnectedCallback() {
    clearTimeout(this.minuterie);
  }

  get total() {
    return this.questions.length;
  }

  libelleEtape(courante) {
    return (this.dataset.libelleEtape || 'Étape %C% sur %T%')
      .replace('%C%', String(courante))
      .replace('%T%', String(this.total));
  }

  /* — Rendu d'une question — */
  dessinerQuestion() {
    const question = this.questions[this.etape];
    const avancement = this.etape / this.total;

    this.scene.innerHTML = '';
    this.scene.style.setProperty('--avancement', String(avancement));

    const entete = document.createElement('div');
    entete.className = 'diagnostic__entete';
    entete.innerHTML = `
      <span class="diagnostic__compteur">${this.libelleEtape(this.etape + 1)}</span>
      <span class="diagnostic__jauge" aria-hidden="true"></span>
    `;

    const groupe = document.createElement('fieldset');
    groupe.className = 'diagnostic__groupe';

    const legende = document.createElement('legend');
    legende.className = 'diagnostic__question';
    legende.id = `diag-q-${this.etape}`;
    legende.textContent = question.titre;
    legende.tabIndex = -1;

    const liste = document.createElement('div');
    liste.className = 'diagnostic__options';

    question.options.forEach((option, i) => {
      const id = `diag-${question.cle}-${i}`;
      const etiquette = document.createElement('label');
      etiquette.className = 'diagnostic__option';
      etiquette.setAttribute('for', id);

      const saisie = document.createElement('input');
      saisie.type = 'radio';
      saisie.name = question.cle;
      saisie.id = id;
      saisie.value = option.code;
      saisie.className = 'diagnostic__radio';
      saisie.checked = this.reponses[question.cle] === option.code;

      const texte = document.createElement('span');
      texte.className = 'diagnostic__option-texte';
      texte.textContent = option.libelle;

      saisie.addEventListener('change', () => this.repondre(question.cle, option.code));

      etiquette.append(saisie, texte);
      liste.appendChild(etiquette);
    });

    groupe.append(legende, liste);

    const actions = document.createElement('div');
    actions.className = 'diagnostic__actions';
    if (this.etape > 0) {
      const precedent = document.createElement('button');
      precedent.type = 'button';
      precedent.className = 'btn btn--ligne diagnostic__precedent';
      precedent.textContent = this.dataset.libellePrecedent || 'Précédent';
      precedent.addEventListener('click', () => {
        this.etape -= 1;
        this.dessinerQuestion();
      });
      actions.appendChild(precedent);
    }

    this.scene.append(entete, groupe, actions);

    // Le premier rendu ne vole pas le focus ; les suivants le déplacent sur
    // la nouvelle question pour que le lecteur d'écran suive la progression.
    if (this.aDemarre) legende.focus();
    this.aDemarre = true;
  }

  repondre(cle, code) {
    this.reponses[cle] = code;
    clearTimeout(this.minuterie);
    // Court délai : l'utilisateur voit son choix se marquer avant la
    // transition. Supprimé si les animations sont réduites.
    const delai = reduit.matches ? 0 : 280;
    this.minuterie = setTimeout(() => {
      if (this.etape < this.total - 1) {
        this.etape += 1;
        this.dessinerQuestion();
      } else {
        this.dessinerResultat();
      }
    }, delai);
  }

  /* — Rendu du résultat — */
  dessinerResultat() {
    const classement = classer(this.protocoles, this.reponses);
    const principal = classement[0];
    const alternative = classement[1];

    this.scene.innerHTML = '';
    this.scene.style.setProperty('--avancement', '1');

    const bloc = document.createElement('div');
    bloc.className = 'diagnostic__resultat';
    bloc.setAttribute('role', 'status');
    bloc.setAttribute('aria-live', 'polite');

    if (!principal) {
      // Aucun protocole ne passe les contre-indications : on le dit, et on
      // renvoie vers le bilan plutôt que de proposer un soin par défaut.
      bloc.innerHTML = `
        <p class="diagnostic__resultat-surtitre">${this.echapper(this.dataset.libelleResultat || '')}</p>
        <p class="diagnostic__resultat-nom">Un bilan, avant tout</p>
        <p class="diagnostic__resultat-argument">
          Vos réponses écartent les protocoles proposés en ligne. Ce n'est pas un refus :
          cela veut dire que le choix se fait en cabinet, après lecture de la peau.
        </p>
      `;
      this.ajouterActions(bloc, null);
    } else {
      const p = principal.protocole;
      bloc.innerHTML = `
        <p class="diagnostic__resultat-surtitre">${this.echapper(this.dataset.libelleResultat || '')}</p>
        <p class="diagnostic__resultat-nom">${this.echapper(p.nom)}</p>
        <p class="diagnostic__resultat-intro">${this.echapper(this.dataset.libelleIntro || '')}</p>
        ${p.argument ? `<p class="diagnostic__resultat-argument">${this.echapper(p.argument)}</p>` : ''}
        ${this.mesures(p)}
      `;
      this.ajouterActions(bloc, p);

      if (alternative) {
        const suite = document.createElement('div');
        suite.className = 'diagnostic__alternative';
        suite.innerHTML = `
          <span class="surtitre">${this.echapper(this.dataset.libelleAlternative || '')}</span>
          <a class="diagnostic__alternative-lien" href="${this.echapper(alternative.protocole.lien || '#')}">
            <span>${this.echapper(alternative.protocole.nom)}</span>
          </a>
        `;
        bloc.appendChild(suite);
      }
    }

    const recommencer = document.createElement('button');
    recommencer.type = 'button';
    recommencer.className = 'diagnostic__recommencer';
    recommencer.textContent = this.dataset.libelleRecommencer || 'Recommencer';
    recommencer.addEventListener('click', () => {
      this.reponses = {};
      this.etape = 0;
      this.dessinerQuestion();
    });
    bloc.appendChild(recommencer);

    this.scene.appendChild(bloc);
    bloc.querySelector('.diagnostic__resultat-nom')?.setAttribute('tabindex', '-1');
    bloc.querySelector('.diagnostic__resultat-nom')?.focus();
  }

  mesures(p) {
    const lignes = [];
    if (p.duree) lignes.push(`<span class="mesure">Durée <span class="mesure__valeur">${this.echapper(p.duree)}</span></span>`);
    if (p.seances) lignes.push(`<span class="mesure">Séances <span class="mesure__valeur">${this.echapper(p.seances)}</span></span>`);
    return lignes.length ? `<div class="diagnostic__mesures">${lignes.join('')}</div>` : '';
  }

  ajouterActions(bloc, protocole) {
    const actions = document.createElement('div');
    actions.className = 'diagnostic__resultat-actions';

    const rdv = this.dataset.urlRdv;
    if (rdv) {
      const a = document.createElement('a');
      a.className = 'btn btn--clair';
      a.href = rdv;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = this.dataset.libelleReserver || 'Réserver';
      actions.appendChild(a);
    }

    if (protocole && protocole.lien) {
      const b = document.createElement('a');
      b.className = 'btn btn--fantome';
      b.href = protocole.lien;
      b.textContent = this.dataset.libelleFiche || 'Voir la fiche';
      actions.appendChild(b);
    }

    if (actions.childElementCount) bloc.appendChild(actions);
  }

  echapper(valeur) {
    const d = document.createElement('div');
    d.textContent = valeur == null ? '' : String(valeur);
    return d.innerHTML;
  }
}

if (!customElements.get('ely-diagnostic')) {
  customElements.define('ely-diagnostic', ElyDiagnostic);
}

export { ElyDiagnostic, classer, noter };
