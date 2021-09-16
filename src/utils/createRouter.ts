import type {
  RouterProps,
  CreateRouterOptions,
  RoutesConfig,
  RouterSubscriptionHistoryCallback,
  RouterSubscriptionTransitionCallback,
  Update,
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
  logger = () => {},
  routes,
}: CreateRouterOptions<Routes>): RouterProps => {
  logger({
    context: { assistPreload, awaitComponent, awaitPreload },
    level: 'info',
    message: 'Router initalizing',
    scope: 'router',
  });

  const routesEntryMap = routesToEntryMap(routes);

  const entryMatch = matchRoutes(routesEntryMap, history.location);
  let currentRouteKey = entryMatch.key;
  let currentEntry = prepareMatch(entryMatch, assistPreload, awaitPreload);

  if (!locationsMatch(entryMatch.location, history.location, true)) {
    // Entry path has redirected, update history
    logger({
      level: 'info',
      message:
        'Initial router entry match does not match current history location. Replacing history location.',
      scope: 'router',
    });

    history.replace(entryMatch.location);
  }

  let subscriberId = 0;
  const subscribers: Map<
    number,
    [
      RouterSubscriptionHistoryCallback | undefined,
      RouterSubscriptionTransitionCallback | undefined
    ]
  > = new Map();

  history.listen((location, action) => {
    if (locationsMatch(currentEntry.location, location, true)) {
      // Still on same route.
      logger({
        context: {
          currentEntryLocation: currentEntry.location,
          location,
        },
        level: 'debug',
        message:
          'New history location matches existing route entry. Ignoring event. Subscribers will not be notified.',
        scope: 'router:listen',
      });

      return;
    }

    const match = matchRoutes(routesEntryMap, location);
    const nextEntry = prepareMatch(match, assistPreload, awaitPreload);

    if (!locationsMatch(match.location, location, true)) {
      logger({
        context: {
          location,
          matchLocation: match.location,
        },
        level: 'debug',
        message:
          'Matched location and history location do not match, replacing history state',
        scope: 'router:listen',
      });

      history.replace(match.location);

      return;
    }

    currentRouteKey = match.key;
    currentEntry = nextEntry;

    logger({
      level: 'debug',
      message: `Next route entry is set for match key ${currentRouteKey}, notifying subscribers`,
      scope: 'router:listen',
    });

    subscribers.forEach(([historyCallback]) =>
      historyCallback?.(nextEntry, { action, location })
    );
  });

  const routeTransitionCompleted = (historyUpdate: Update) => {
    logger({
      context: {
        update: historyUpdate,
      },
      level: 'debug',
      message: 'Route transition completed. Notifying subscribers',
      scope: 'router',
    });

    subscribers.forEach(([, transitionCallback]) =>
      transitionCallback?.(historyUpdate)
    );
  };

  const context: RouterProps = {
    assistPreload,
    awaitComponent,
    get: () => currentEntry,
    getCurrentRouteKey: () => currentRouteKey,
    history,
    isActive: (path, exact) => locationsMatch(history.location, path, exact),
    logger,
    preloadCode: (to) => {
      const path = pathStringToPath(to);

      logger({
        context: {
          to,
        },
        level: 'debug',
        message: `Preloading code for '${path.pathname}' path`,
        scope: 'router:preloadCode',
      });

      try {
        const matchedRoute = matchRoutes(routesEntryMap, path);

        if (matchedRoute) {
          void matchedRoute.route.component.load();
        }
      } catch (error) {
        logger({
          context: {
            error,
          },
          level: 'error',
          message: `Error when preloading code for '${path.pathname}' path. See context for error.`,
          scope: 'router:preloadCode',
        });
      }
    },
    routeTransitionCompleted,
    subscribe: ({ onTransitionStart, onTransitionComplete }) => {
      const id = subscriberId++;

      const dispose = () => {
        subscribers.delete(id);
      };

      subscribers.set(id, [onTransitionStart, onTransitionComplete]);

      return dispose;
    },
    warmRoute: (to) => {
      const path = pathStringToPath(to);

      logger({
        context: {
          to,
        },
        level: 'debug',
        message: `Warming route for '${path.pathname}' path`,
        scope: 'router:warmRoute',
      });

      try {
        const match = matchRoutes(routesEntryMap, path);

        if (match) {
          prepareMatch(match, assistPreload, awaitPreload);
        }
      } catch (error) {
        logger({
          context: {
            error,
          },
          level: 'error',
          message: `Error when warming route for '${path.pathname}' path. See context for error.`,
          scope: 'router:warmRoute',
        });
      }
    },
  };

  return context;
};
