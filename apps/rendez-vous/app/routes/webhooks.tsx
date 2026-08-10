import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import prisma from '../db.server';

export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, session } = await authenticate.webhook(request);

  if (topic === 'APP_UNINSTALLED' && session) {
    // Les sessions partent, les réservations restent : ce sont des rendez-vous
    // pris avec de vraies personnes, pas des données d'application.
    await prisma.session.deleteMany({ where: { shop } });
  }

  return new Response();
}
