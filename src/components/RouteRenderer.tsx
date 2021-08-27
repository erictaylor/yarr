import type { ReactNode } from 'react';
import React, {
  useEffect,
  useMemo,
  useCallback,
  useContext,
  useReducer,
} from 'react';
import { RouterContext } from '../context/RouterContext';
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
    props: {
      params: entry.params,
      search: entry.search,
    },
  };

  // We capture entry.preloaded like this so TypeScript can infer the type from the if statement.
  // Most likely not needed after 4.4.0.
  const entryPreloaded = entry.preloaded;

  if (isEntryPreloadedMap(entryPreloaded)) {
    const preloaded: Record<string, SuspenseResource<unknown>> = {};

    for (const [key, value] of entryPreloaded.entries()) {
      preloaded[key] = value.data;
    }

    return {
      ...preparedEntry,
      props: { ...preparedEntry.props, preloaded },
    };
  }

  return {
    ...preparedEntry,
    props: { ...preparedEntry.props, preloaded: entryPreloaded },
  };
};

interface RouteRendererProps {
  pendingIndicator?: ReactNode;
}

export const RouteRenderer = ({ pendingIndicator }: RouteRendererProps) => {
  const { awaitComponent, get, routeTransitionCompleted, subscribe } =
    useContext(RouterContext);

  const [{ isTransitioning, routeEntry }, dispatch] = useReducer(reducer, {
    isTransitioning: false,
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
    const dispose = subscribe(async (nextEntry) => {
      dispatch({ type: 'START_ROUTE_TRANSITION' });

      // When `awaitComponent` is true, we await the new component to load before updating the route entry.
      // This effectively means that a route transition will not cause a suspense fallback to occur.
      //
      // NOTE: Any data preloading has already been initialized by this point.
      // So there is no concern of waiting on the component to start the preloading process.
      if (awaitComponent) {
        await nextEntry.component.load();
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
            props: { params: nextEntry.params, search: nextEntry.search },
          };

      dispatch({
        payload: newRouteEntry,
        type: 'FINISH_ROUTE_TRANSITION',
      });
    });

    return () => dispose();
  }, [awaitComponent, subscribe, getPendingRouteEntry]);

  // Call the `routeTransitionCompleted` router function when the Component is updated.
  useEffect(() => {
    routeTransitionCompleted();
  }, [Component, routeTransitionCompleted]);

  return (
    <>
      {isTransitioning && pendingIndicator ? pendingIndicator : null}

      <Component {...routeEntry.props} />
    </>
  );
};
