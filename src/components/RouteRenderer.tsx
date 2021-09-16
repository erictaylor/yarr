import type { ReactElement, ReactNode } from 'react';
import { useEffect, useMemo, useCallback, useContext, useReducer } from 'react';
import { RouteContext } from '../context/RouteContext';
import { RouterContext } from '../context/RouterContext';
import { useTransition } from '../hooks/useTransition';
import type {
  PreparedEntryWithAssist,
  PreparedEntryWithoutAssist,
  PreparedRouteEntry,
} from '../types';
import type { SuspenseResource } from '../utils/SuspenseResource';
import {
  isAssistedPreparedEntry,
  isEntryPreloadedMap,
} from '../utils/prepareMatch';
import { reducer } from './reducer';

/**
 * Used only on the initial render.
 * We always want to suspend on the first render since we have no prior route to keep rendered.
 *
 * In the case that `assistPreload` is true, we re-map the `preloaded` object directly to suspense resources.
 */
const getInitialRouteEntry = (
  entry: PreparedEntryWithAssist | PreparedEntryWithoutAssist
): PreparedRouteEntry => {
  const preparedEntry: PreparedRouteEntry = {
    component: entry.component,
    location: entry.location,
    props: {
      params: entry.params,
      search: entry.search,
    },
  };

  if (isEntryPreloadedMap(entry.preloaded)) {
    const preloaded: Record<string, SuspenseResource<unknown>> = {};

    for (const [key, value] of entry.preloaded.entries()) {
      preloaded[key] = value.data;
    }

    return {
      ...preparedEntry,
      props: { ...preparedEntry.props, preloaded },
    };
  }

  return {
    ...preparedEntry,
    props: { ...preparedEntry.props, preloaded: entry.preloaded },
  };
};

interface RouteRendererProps {
  pendingIndicator?: ReactNode;
  routeWrapper?: (props: { Route: ReactElement }) => ReactElement;
}

export const RouteRenderer = ({
  pendingIndicator,
  routeWrapper,
}: RouteRendererProps) => {
  const {
    awaitComponent,
    get,
    history,
    logger,
    routeTransitionCompleted,
    setRendererInitialized,
    subscribe,
  } = useContext(RouterContext);

  const [isPending, startTransition] = useTransition();

  const [{ isPendingTransition, historyUpdate, routeEntry }, dispatch] =
    useReducer(reducer, {
      historyUpdate: {
        action: history.action,
        location: history.location,
      },
      isPendingTransition: false,
      routeEntry: getInitialRouteEntry(get()),
    });

  const Component = useMemo(() => routeEntry.component.read(), [routeEntry]);

  /**
   * Runs when `assistPreload` is true (`preloaded` is only a map when `assistPreload` is true).
   * When we receive a new entry, we check the resources in the `preloaded` map and `await` the
   * resources that can not be deferred.
   *
   * Entries `preloaded` are then re-mapped to direct suspense resources.
   */
  const getPendingRouteEntry = useCallback(
    async (
      pendingRouteEntry: PreparedEntryWithAssist
    ): Promise<PreparedRouteEntry> => {
      const preloaded: Record<string, SuspenseResource<unknown>> = {};

      if (pendingRouteEntry.preloaded) {
        for (const [property, value] of pendingRouteEntry.preloaded.entries()) {
          if (!value.defer) await value.data.load();

          preloaded[property] = value.data;
        }
      }

      return {
        component: pendingRouteEntry.component,
        location: pendingRouteEntry.location,
        props: {
          params: pendingRouteEntry.params,
          preloaded: pendingRouteEntry.preloaded && preloaded,
          search: pendingRouteEntry.search,
        },
      };
    },
    []
  );

  // Subscribe to route changes and update the route entry.
  useEffect(() => {
    logger({
      level: 'debug',
      message: 'RouteRenderer setting up subscription to router',
      scope: 'RouteRenderer',
    });

    const dispose = subscribe({
      onTransitionStart: async (nextEntry, update) => {
        logger({
          context: {
            update,
          },
          level: 'info',
          message: `Starting route transition for next entry`,
          scope: 'RouteRenderer:onTransitionStart',
        });

        dispatch({ type: 'START_ROUTE_TRANSITION' });

        // When `awaitComponent` is true, we await the new component to load before updating the route entry.
        // This effectively means that a route transition will not cause a suspense fallback to occur.
        //
        // NOTE: Any data preloading has already been initialized by this point.
        // So there is no concern of waiting on the component to start the preloading process.
        if (awaitComponent) {
          logger({
            level: 'trace',
            message: `Awaiting component code for next route entry.`,
            scope: 'RouteRenderer:onTransitionStart',
          });

          await nextEntry.component.load();

          logger({
            level: 'trace',
            message: `Completed loading of next entry component code resource.`,
            scope: 'RouteRenderer:onTransitionStart',
          });
        }

        // When `assistPreload` is true, we need to re-map the `preloaded` object to suspense resources (via `getPendingRouteEntry`).
        // Any resources that can not be deferred will cause us to continue rendering the current route entry.
        // Otherwise, we will render the new route immediately, and let the component deal with loading states while preloading data.
        const newRouteEntry: PreparedRouteEntry = isAssistedPreparedEntry(
          nextEntry
        )
          ? await getPendingRouteEntry(nextEntry)
          : {
              component: nextEntry.component,
              location: nextEntry.location,
              props: {
                params: nextEntry.params,
                preloaded: nextEntry.preloaded,
                search: nextEntry.search,
              },
            };

        startTransition(() => {
          logger({
            context: {
              update,
            },
            level: 'info',
            message: `Finalizing route transition for next entry`,
            scope: 'RouteRenderer:onTransitionStart',
          });

          dispatch({
            payload: { historyUpdate: update, routeEntry: newRouteEntry },
            type: 'FINISH_ROUTE_TRANSITION',
          });
        });
      },
    });

    setRendererInitialized(true);

    return () => {
      logger({
        level: 'trace',
        message: 'RouteRenderer disposing subscription to router',
        scope: 'RouteRenderer',
      });

      dispose();
    };
  }, [
    awaitComponent,
    getPendingRouteEntry,
    logger,
    setRendererInitialized,
    startTransition,
    subscribe,
  ]);

  // Call the `routeTransitionCompleted` with history update when the route transition is complete.
  useEffect(() => {
    logger({
      context: {
        update: historyUpdate,
      },
      level: 'trace',
      message: `Calling 'routeTransitionComplete' for new history update. New route is rendered.`,
      scope: 'RouteRenderer',
    });

    routeTransitionCompleted(historyUpdate);
  }, [historyUpdate, logger, routeTransitionCompleted]);

  const isTransitioning = isPendingTransition || isPending;

  return (
    <>
      {isTransitioning && pendingIndicator ? pendingIndicator : null}
      <RouteContext.Provider value={routeEntry.props}>
        {routeWrapper ? (
          routeWrapper({ Route: <Component {...routeEntry.props} /> })
        ) : (
          <Component {...routeEntry.props} />
        )}
      </RouteContext.Provider>
    </>
  );
};

RouteRenderer.displayName = 'RouteRenderer';
