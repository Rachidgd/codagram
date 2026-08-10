/* ==========================================================================
   RÉSERVATION FERME — point d'entrée appelé par la boutique via l'app proxy.

   C'est ici, et nulle part ailleurs, qu'un créneau devient indisponible pour
   les autres. Deux protections se superposent :

   1. le créneau demandé est revalidé côté serveur contre les plages, les
      fermetures, le délai minimum et les rendez-vous déjà pris — ce que le
      navigateur affiche n'engage à rien ;
   2. la contrainte d'unicité (shop, date, début) tranche la course entre
      deux personnes qui cliquent à la même seconde. La seconde reçoit une
      réponse claire plutôt qu'un doublon silencieux.
   ========================================================================== */

import type { ActionFunctionArgs } from '@remix-run/node';
import prisma from '../db.server';
import { authenticate } from '../shopify.server';
import { lireDonnees } from '../donnees.server';
import { creneauValide, enMinutes } from '../creneaux';

const FUSEAU = process.env.FUSEAU_CABINET || 'Europe/Paris';
const HORIZON = Number(process.env.HORIZON_JOURS || 28);
const DELAI = Number(process.env.DELAI_HEURES || 24);

const json = (corps: unknown, statut = 200) =>
  new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

export async function action({ request }: ActionFunctionArgs) {
  // `authenticate.public.appProxy` vérifie la signature Shopify : une requête
  // qui ne vient pas de la boutique n'atteint jamais la base.
  const { admin, session } = await authenticate.public.appProxy(request);
  if (!admin || !session) return json({ erreur: 'Boutique inconnue' }, 401);

  const f = await request.formData();
  const soinHandle = String(f.get('soin') || '');
  const date = String(f.get('date') || '');
  const heure = String(f.get('heure') || '');
  const nom = String(f.get('nom') || '').trim();
  const email = String(f.get('email') || '').trim();
  const telephone = String(f.get('telephone') || '').trim();
  const message = String(f.get('message') || '').trim() || null;

  // Piège à robots : rempli, donc pas un humain. On répond comme si tout
  // s'était bien passé, sans rien enregistrer.
  if (String(f.get('reference') || '')) return json({ ok: true });

  if (!nom || !email || !telephone) {
    return json({ erreur: 'Nom, adresse e-mail et téléphone sont nécessaires.' }, 422);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ erreur: 'Date invalide.' }, 422);

  const debut = enMinutes(heure);
  if (debut === null) return json({ erreur: 'Heure invalide.' }, 422);

  const { soins, plages, fermetures } = await lireDonnees(admin);
  const soin = soins.find((s) => s.handle === soinHandle);
  if (!soin) return json({ erreur: 'Ce soin n’est plus proposé à la réservation.' }, 422);

  const occupations = (
    await prisma.reservation.findMany({
      where: { shop: session.shop, date, statut: { not: 'annule' } },
      select: { date: true, debut: true, fin: true },
    })
  ).map((r) => ({ date: r.date, debut: r.debut, fin: r.fin }));

  const contexte = {
    soins,
    plages,
    fermetures,
    occupations,
    fuseau: FUSEAU,
    horizon: HORIZON,
    delai: DELAI,
  };

  if (!creneauValide(date, debut, soin, contexte)) {
    return json({ erreur: 'Ce créneau vient d’être pris ou n’est plus ouvert.', repris: true }, 409);
  }

  try {
    const reservation = await prisma.reservation.create({
      data: {
        shop: session.shop,
        soin: soin.handle,
        soinNom: soin.nom,
        date,
        debut,
        fin: debut + soin.duree + soin.battement,
        nom,
        email,
        telephone,
        message,
      },
    });
    return json({ ok: true, id: reservation.id });
  } catch {
    // Violation d'unicité : quelqu'un a réservé entre la vérification et
    // l'écriture. C'est exactement le cas que la contrainte doit couvrir.
    return json({ erreur: 'Ce créneau vient d’être pris.', repris: true }, 409);
  }
}
