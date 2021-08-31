import type { Update } from 'history';
import { parsePath } from 'history';
import type {
  RouterContextProps,
  CreateRouterOptions,
  RoutesConfig,
  RouterSubscriptionHistoryCallback,
  RouterSubscriptionTransitionCallback,
} from '../types';
import { locationsMatch } from './locationsMatch';
import { matchRoutes } from './matchRoutes';
import { pathStringToPath } from './pathStringToPath';
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

  let subscriberId = 0;
  const subscribers: Map<
    number,
    [
      RouterSubscriptionHistoryCallback,
      RouterSubscriptionTransitionCallback | undefined
    ]
  > = new Map();

  history.listen((update) => {
    const { location } = update;

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
    subscribers.forEach(([historyCallback]) =>
      historyCallback(nextEntry, update)
    );
  });

  const routeTransitionCompleted = (historyUpdate: Update) => {
    subscribers.forEach(([, transitionCallback]) =>
      transitionCallback?.(historyUpdate)
    );
  };

  const context: RouterContextProps = {
    assistPreload,
    awaitComponent,
    get: () => currentEntry,
    history: {
      ...history,
      // This functions are overwritten because of bug in History v5 where
      // if a string `to` argument is passed in, location search and location hash
      // are not cleared but will use the existing locations search and hash.
      // See: https://github.com/erictaylor/yarr/issues/4
      push: (to, state) =>
        history.push(
          {
            hash: '',
            search: '',
            ...(typeof to === 'string' ? parsePath(to) : to),
          },
          state
        ),
      replace: (to, state) =>
        history.replace(
          {
            hash: '',
            search: '',
            ...(typeof to === 'string' ? parsePath(to) : to),
          },
          state
        ),
    },
    isActive: (path, exact) => locationsMatch(history.location, path, exact),
    preloadCode: (to) => {
      const path = pathStringToPath(to);
      try {
        const matchedRoute = matchRoutes(routesEntryMap, path);

        if (matchedRoute) {
          void matchedRoute.route.component.load();
        }
      } catch {
        // TODO: Send to logger.
      }
    },
    routeTransitionCompleted,
    subscribe: (historyCallback, transitionCallback) => {
      const id = subscriberId++;

      const dispose = () => {
        subscribers.delete(id);
      };

      subscribers.set(id, [historyCallback, transitionCallback]);

      return dispose;
    },
    warmRoute: (to) => {
      const path = pathStringToPath(to);
      try {
        const match = matchRoutes(routesEntryMap, path);

        if (match) {
          prepareMatch(match, assistPreload, awaitPreload);
        }
      } catch {
        // TODO: Send to logger.
      }
    },
  };

  return context;
};
