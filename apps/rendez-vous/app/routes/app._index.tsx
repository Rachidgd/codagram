/* L'écran d'accueil de l'app : l'agenda des jours à venir, rendez-vous par
   rendez-vous. C'est la vue qu'on ouvre le matin — elle doit répondre à une
   seule question, « qui vient aujourd'hui, et à quelle heure ». */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import {
  Badge,
  BlockStack,
  Button,
  Card,
  EmptyState,
  InlineStack,
  Layout,
  Page,
  Text,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import prisma from '../db.server';
import { authenticate } from '../shopify.server';
import { enHeure, enISO, jour, maintenantAuCabinet } from '../creneaux';

const FUSEAU = process.env.FUSEAU_CABINET || 'Europe/Paris';

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const aujourdHui = maintenantAuCabinet(FUSEAU).date;

  const horizon = jour(aujourdHui);
  horizon.setUTCDate(horizon.getUTCDate() + 30);

  const reservations = await prisma.reservation.findMany({
    where: {
      shop: session.shop,
      statut: { not: 'annule' },
      date: { gte: aujourdHui, lte: enISO(horizon) },
    },
    orderBy: [{ date: 'asc' }, { debut: 'asc' }],
  });

  return { reservations, aujourdHui };
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const formulaire = await request.formData();
  const id = String(formulaire.get('id'));
  const statut = String(formulaire.get('statut'));

  if (!['demande', 'confirme', 'annule'].includes(statut)) {
    return { erreur: 'Statut inconnu' };
  }

  // Le `shop` dans la clause protège d'une modification croisée entre
  // boutiques si l'app est un jour distribuée à plusieurs cabinets.
  await prisma.reservation.updateMany({
    where: { id, shop: session.shop },
    data: { statut },
  });

  return { ok: true };
}

function formaterJour(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(jour(iso));
}

export default function Agenda() {
  const { reservations, aujourdHui } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const parJour = reservations.reduce<Record<string, typeof reservations>>((acc, r) => {
    (acc[r.date] ||= []).push(r);
    return acc;
  }, {});

  const jours = Object.keys(parJour).sort();

  return (
    <Page>
      <TitleBar title="Agenda" />
      <Layout>
        <Layout.Section>
          {jours.length === 0 ? (
            <Card>
              <EmptyState
                heading="Aucun rendez-vous sur les trente prochains jours"
                image=""
              >
                <p>
                  Les demandes envoyées depuis la boutique arrivent ici. Vérifiez que vos plages
                  d&apos;ouverture sont bien renseignées.
                </p>
              </EmptyState>
            </Card>
          ) : (
            <BlockStack gap="400">
              {jours.map((iso) => (
                <Card key={iso}>
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="h2" variant="headingMd">
                        {formaterJour(iso)}
                      </Text>
                      {iso === aujourdHui ? <Badge tone="info">Aujourd&apos;hui</Badge> : null}
                    </InlineStack>

                    {parJour[iso].map((r) => (
                      <InlineStack key={r.id} gap="400" blockAlign="center" wrap={false}>
                        <Text as="span" variant="headingSm" numeric>
                          {enHeure(r.debut)}
                        </Text>
                        <BlockStack gap="050">
                          <Text as="span" fontWeight="medium">
                            {r.nom} — {r.soinNom}
                          </Text>
                          <Text as="span" tone="subdued" variant="bodySm">
                            {r.telephone} · {r.email}
                            {r.message ? ` · ${r.message}` : ''}
                          </Text>
                        </BlockStack>
                        <Badge tone={r.statut === 'confirme' ? 'success' : 'attention'}>
                          {r.statut === 'confirme' ? 'Confirmé' : 'À confirmer'}
                        </Badge>
                        {r.statut !== 'confirme' ? (
                          <Button
                            onClick={() =>
                              fetcher.submit({ id: r.id, statut: 'confirme' }, { method: 'post' })
                            }
                          >
                            Confirmer
                          </Button>
                        ) : null}
                        <Button
                          tone="critical"
                          variant="tertiary"
                          onClick={() =>
                            fetcher.submit({ id: r.id, statut: 'annule' }, { method: 'post' })
                          }
                        >
                          Annuler
                        </Button>
                      </InlineStack>
                    ))}
                  </BlockStack>
                </Card>
              ))}
            </BlockStack>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
