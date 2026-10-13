import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { App } from "./App";
import { validateSnippetSearch } from "./config/snippet-state";
import { getSnippet } from "./lib/snippet-api";
import { RenderPage } from "./render-page";

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
const renderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/render",
  component: RenderPage,
});

function SharedSnippet() {
  return <App initialState={sharedRoute.useLoaderData()} />;
}

const routeTree = rootRoute.addChildren([indexRoute, sharedRoute, renderRoute]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
