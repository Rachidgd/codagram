/* ==========================================================================
   MOTEUR DE CRÉNEAUX

   Même logique que `assets/agenda.js` côté boutique, mais c'est ici la
   version qui fait autorité : elle seule connaît les réservations déjà
   prises. La boutique affiche une estimation, le serveur tranche.

   Aucune dépendance : le fichier est testable tel quel avec `node --test`.
   ========================================================================== */

export const JOURS = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
] as const;

export type Soin = {
  handle: string;
  nom: string;
  duree: number;
  battement: number;
  ordre?: number;
};

export type Plage = {
  jour: string;
  debut: string;
  fin: string;
  soins: string[];
};

export type Fermeture = { debut: string; fin: string };

/** Un rendez-vous déjà pris, exprimé en minutes depuis minuit. */
export type Occupation = { date: string; debut: number; fin: number };

export function enMinutes(heure: string): number | null {
  const [h, m] = String(heure ?? '').split(':');
  const total = Number(h) * 60 + Number(m);
  return Number.isFinite(total) ? total : null;
}

export function enHeure(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Date ISO ancrée à midi UTC : les accesseurs UTC deviennent sûrs, et
 *  aucun passage à l'heure d'été ne peut décaler un jour. */
export function jour(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

export function enISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Date et heure courantes telles que les vit le cabinet, pas le visiteur. */
export function maintenantAuCabinet(fuseau: string, reference = new Date()) {
  const format = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuseau,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const p = Object.fromEntries(
    format.formatToParts(reference).map((x) => [x.type, x.value])
  ) as Record<string, string>;
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    minutes: Number(p.hour) * 60 + Number(p.minute),
  };
}

export type Contexte = {
  soins: Soin[];
  plages: Plage[];
  fermetures: Fermeture[];
  occupations: Occupation[];
  fuseau: string;
  /** Nombre de jours proposés à l'avance. */
  horizon: number;
  /** Délai minimum avant un rendez-vous, en heures. */
  delai: number;
  reference?: Date;
};

function estFerme(iso: string, fermetures: Fermeture[]) {
  return fermetures.some((f) => f.debut && f.fin && iso >= f.debut && iso <= f.fin);
}

function plagesDuJour(iso: string, soin: Soin, plages: Plage[]) {
  const nom = JOURS[jour(iso).getUTCDay()];
  return plages.filter((p) => {
    if (p.jour !== nom) return false;
    // Une plage sans soin déclaré est ouverte à tous les soins.
    if (Array.isArray(p.soins) && p.soins.length) return p.soins.includes(soin.handle);
    return true;
  });
}

/** Deux rendez-vous se chevauchent dès qu'ils partagent une minute. Le
 *  battement est compté dans l'occupation : c'est du temps de cabine. */
function chevauche(debut: number, fin: number, occupations: Occupation[], iso: string) {
  return occupations.some((o) => o.date === iso && debut < o.fin && o.debut < fin);
}

export function creneauxDuJour(iso: string, soin: Soin, ctx: Contexte): number[] {
  if (estFerme(iso, ctx.fermetures)) return [];

  const maintenant = maintenantAuCabinet(ctx.fuseau, ctx.reference);
  if (iso < maintenant.date) return [];

  const pas = soin.duree + (soin.battement || 0);
  const plancher = iso === maintenant.date ? maintenant.minutes + ctx.delai * 60 : -1;

  const liste: number[] = [];
  for (const p of plagesDuJour(iso, soin, ctx.plages)) {
    const debut = enMinutes(p.debut);
    const fin = enMinutes(p.fin);
    if (debut === null || fin === null) continue;
    for (let t = debut; t + soin.duree <= fin; t += pas) {
      if (t <= plancher) continue;
      if (chevauche(t, t + pas, ctx.occupations, iso)) continue;
      liste.push(t);
    }
  }

  return [...new Set(liste)].sort((a, b) => a - b);
}

export function joursOuverts(soin: Soin, ctx: Contexte) {
  const sortie: { iso: string; creneaux: number[] }[] = [];
  const curseur = jour(maintenantAuCabinet(ctx.fuseau, ctx.reference).date);
  for (let i = 0; i < ctx.horizon; i += 1) {
    const iso = enISO(curseur);
    const creneaux = creneauxDuJour(iso, soin, ctx);
    if (creneaux.length) sortie.push({ iso, creneaux });
    curseur.setUTCDate(curseur.getUTCDate() + 1);
  }
  return sortie;
}

/** Vérifie qu'un créneau demandé est réellement réservable. C'est le seul
 *  contrôle qui compte : le reste n'est que de l'affichage. */
export function creneauValide(iso: string, minutes: number, soin: Soin, ctx: Contexte) {
  return creneauxDuJour(iso, soin, ctx).includes(minutes);
}
