import type {
  RouterContextProps,
  CreateRouterOptions,
  RoutesConfig,
  RouterSubscriptionCallback,
} from '../types';
import { locationsMatch } from './locationsMatch';
import { matchRoutes } from './matchRoutes';
import { prepareMatch } from './prepareMatch';
import { routesToEntryMap } from './routesToEntryMap';

/**
 * Creates a router from a passed in history type (Browser, Hash, or Memory)
 * and an array of route configs. The router listens to history changes and
 * preloads the necessary matching route component and preload data to be rendered.
 */
export const createRouter = <Routes extends RoutesConfig>({
  assistPreload = false,
  awaitComponent = false,
  awaitPreload = false,
  history,
  routes,
}: CreateRouterOptions<Routes>): RouterContextProps => {
  const routesEntryMap = routesToEntryMap(routes);

  const entryMatch = matchRoutes(routesEntryMap, history.location);
  let currentEntry = prepareMatch(entryMatch, assistPreload, awaitPreload);

  if (!locationsMatch(entryMatch.location, history.location, true)) {
    // Entry path has redirected, update history
    history.replace(entryMatch.location);
  }

  let nextId = 0;
  const subscribers: Map<number, RouterSubscriptionCallback> = new Map();

  history.listen(({ location }) => {
    if (locationsMatch(currentEntry.location, location, true)) {
      // Still on same route.
      return;
    }

    const match = matchRoutes(routesEntryMap, location);
    const nextEntry = prepareMatch(match, assistPreload, awaitPreload);

    if (!locationsMatch(match.location, location, true)) {
      history.replace(match.location);

      return;
    }

    currentEntry = nextEntry;
    subscribers.forEach((historyCallback) => historyCallback(nextEntry));
  });

  const context: RouterContextProps = {
    assistPreload,
    awaitComponent,
    get: () => currentEntry,
    history,
    isActive: (path, exact) => locationsMatch(history.location, path, exact),
    preloadCode: (pathname) => {
      const matchedRoute = matchRoutes(routesEntryMap, pathname);

      if (matchedRoute) {
        void matchedRoute.route.component.load();
      }
    },
    subscribe: (historyCallback) => {
      const id = nextId++;

      const dispose = () => {
        subscribers.delete(id);
      };

      subscribers.set(id, historyCallback);

      return dispose;
    },
    warmRoute: (pathname) => {
      const match = matchRoutes(routesEntryMap, pathname);

      if (match) {
        prepareMatch(match, assistPreload, awaitPreload);
      }
    },
  };

  return context;
};
