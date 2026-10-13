import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { App } from "./App";
import { validateSnippetSearch } from "./config/snippet-state";
import { getSnippet } from "./lib/snippet-api";

const rootRoute = createRootRoute({ component: () => <Outlet /> });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: validateSnippetSearch,
  component: App,
});
const sharedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/s/$snippetId",
  loader: ({ params }) => getSnippet(params.snippetId),
  component: SharedSnippet,
});

function SharedSnippet() {
  return <App initialState={sharedRoute.useLoaderData()} />;
}

const routeTree = rootRoute.addChildren([indexRoute, sharedRoute]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
