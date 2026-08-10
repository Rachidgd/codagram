/* Créneaux réellement libres, rendez-vous déjà pris déduits.

   La boutique sait calculer ses créneaux toute seule — c'est ce qui lui
   permet de fonctionner sans l'app. Mais elle ignore les réservations. Dès
   que l'app est installée, le module d'agenda interroge ce point d'entrée et
   remplace son estimation par la vérité. */

import type { LoaderFunctionArgs } from '@remix-run/node';
import prisma from '../db.server';
import { authenticate } from '../shopify.server';
import { lireDonnees } from '../donnees.server';
import { enHeure, joursOuverts } from '../creneaux';

const FUSEAU = process.env.FUSEAU_CABINET || 'Europe/Paris';
const HORIZON = Number(process.env.HORIZON_JOURS || 28);
const DELAI = Number(process.env.DELAI_HEURES || 24);

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.public.appProxy(request);
  if (!admin || !session) {
    return new Response(JSON.stringify({ erreur: 'Boutique inconnue' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const { soins, plages, fermetures } = await lireDonnees(admin);

  const occupations = (
    await prisma.reservation.findMany({
      where: { shop: session.shop, statut: { not: 'annule' } },
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

  const resultat = soins.map((soin) => ({
    handle: soin.handle,
    nom: soin.nom,
    duree: soin.duree,
    jours: joursOuverts(soin, contexte).map((j) => ({
      date: j.iso,
      creneaux: j.creneaux.map(enHeure),
    })),
  }));

  return new Response(JSON.stringify({ fuseau: FUSEAU, soins: resultat }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Court, mais suffisant pour absorber une rafale de visiteurs sans
      // servir un agenda périmé.
      'Cache-Control': 'public, max-age=60',
    },
  });
}
