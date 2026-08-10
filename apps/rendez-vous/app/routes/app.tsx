import type { HeadersFunction, LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useRouteError } from '@remix-run/react';
import { AppProvider } from '@shopify/shopify-app-remix/react';
import { NavMenu } from '@shopify/app-bridge-react';
import polarisStyles from '@shopify/polaris/build/esm/styles.css?url';
import { authenticate } from '../shopify.server';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: polarisStyles }];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || '' };
}

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Agenda
        </Link>
        <Link to="/app/demandes">Demandes</Link>
        <Link to="/app/disponibilites">Disponibilités</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify a besoin que les erreurs et les en-têtes remontent telles quelles
// pour que l'app reste utilisable dans l'iframe de l'admin.
export function ErrorBoundary() {
  return <div>{String(useRouteError())}</div>;
}

export const headers: HeadersFunction = (args) => ({ ...args.parentHeaders });
