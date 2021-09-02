/* eslint-disable func-style */
import type {
  MatchedRoute,
  AssistedPreloadConfig,
  AssistedMatchedRoute,
  PreloadedMap,
  AssistedPreloadFunction,
  PreparedEntryFragment,
  PreparedEntryWithAssist,
  PreparedEntryWithoutAssist,
  UnassistedPreloadData,
} from '../types';
import { SuspenseResource } from './SuspenseResource';
import { sortAndStringifySearchParameters } from './sortAndStringifySearchParameters';

/**
 * Holds cached value for last prepared match;
 * used only when assisting preload (ie `assistPreload` is true).
 *
 * Used so we don't avoid multiple network requests.
 */
const lastPreparedEntry: {
  parametersString: string;
  pathname: string;
  value: PreparedEntryWithAssist | null;
} = {
  parametersString: '',
  pathname: '',
  value: null,
};

const isPreloadFunction = (
  preload: AssistedPreloadConfig | AssistedPreloadFunction
): preload is AssistedPreloadFunction => {
  return typeof preload === 'function';
};

export const isEntryPreloadedMap = (
  preloaded: PreloadedMap | UnassistedPreloadData | undefined
): preloaded is PreloadedMap => {
  return preloaded instanceof Map;
};

export const isAssistedPreparedEntry = (
  entry: PreparedEntryWithAssist | PreparedEntryWithoutAssist
): entry is PreparedEntryWithAssist => {
  return isEntryPreloadedMap(entry.preloaded);
};

const prepareAssistPreloadMatch = (
  { route, params, search }: AssistedMatchedRoute,
  awaitPreload: boolean
): PreloadedMap => {
  const preloaded: PreloadedMap = new Map();
  const preload = route.preload?.(params, search);

  for (const property in preload) {
    // Skip properties that are not explicitly defined on the preload object
    if (!Object.prototype.hasOwnProperty.call(preload, property)) {
      continue;
    }

    const preloadProperty = preload[property];

    // NOTE: This shouldn't happen given the above hasOwnProperty check,
    // but satisfies TypeScript 'noUncheckedIndexedAccess' option (safe).
    if (preloadProperty === undefined) {
      continue;
    }

    const fetchFunction: AssistedPreloadFunction = isPreloadFunction(
      preloadProperty
    )
      ? preloadProperty
      : preloadProperty.data;

    const fetchResource = new SuspenseResource(fetchFunction);

    // Start the network request for this resource.
    void fetchResource.load();

    // Set the entry preloaded property that will be used by RouteRenderer
    preloaded.set(property, {
      data: fetchResource,
      defer:
        !isPreloadFunction(preloadProperty) &&
        preloadProperty.defer !== undefined
          ? preloadProperty.defer
          : !awaitPreload,
    });
  }

  return preloaded;
};

/**
 * Prepares a route before navigation is requested by warming up the component resource
 * and dealing with any data preloading that needs to take place.
 *
 * If `assistPreload` is true, we build suspense resources for all the requested preload data.
 */
function prepareMatch(
  match: MatchedRoute,
  assistPreload: true,
  awaitPreload?: boolean
): PreparedEntryWithAssist;
function prepareMatch(
  match: MatchedRoute,
  assistPreload?: false,
  awaitPreload?: boolean
): PreparedEntryWithoutAssist;
function prepareMatch(
  match: MatchedRoute,
  assistPreload?: boolean,
  awaitPreload?: boolean
): PreparedEntryWithAssist | PreparedEntryWithoutAssist;
function prepareMatch(
  match: MatchedRoute,
  assistPreload = false,
  awaitPreload = false
) {
  const { route, params, search, location } = match;

  const pathnameMatch = location.pathname === lastPreparedEntry.pathname;
  const parametersString = sortAndStringifySearchParameters(params);

  // TODO: Rewrite logic around asserting what type of `match` we are working with by using the `assistPreload` boolean.

  // Check if requested match is same as last match. This is important because cached match holds
  // generated resources for preload which we need to re-use to avoid multiple network requests
  if (
    assistPreload &&
    pathnameMatch &&
    parametersString === lastPreparedEntry.parametersString &&
    lastPreparedEntry.value !== null
  ) {
    return lastPreparedEntry.value;
  }

  // Start loading the component code.
  void route.component.load();

  const preparedMatchFragment: PreparedEntryFragment = {
    component: route.component,
    location,
    params,
    search,
  };

  if (assistPreload) {
    const preloaded =
      route.preload &&
      prepareAssistPreloadMatch(match as AssistedMatchedRoute, awaitPreload);

    const preparedMatchWithAssist: PreparedEntryWithAssist = {
      ...preparedMatchFragment,
      preloaded,
    };

    if (preloaded) {
      // Cache the prepared match so we can reuse it for next match if the route is the same.
      lastPreparedEntry.pathname = location.pathname ?? '';
      lastPreparedEntry.parametersString =
        sortAndStringifySearchParameters(params);
      lastPreparedEntry.value = preparedMatchWithAssist;
    }

    return preparedMatchWithAssist;
  }

  const preparedMatchWithoutAssist: PreparedEntryWithoutAssist = {
    ...preparedMatchFragment,
    preloaded: route.preload?.(params, search),
  };

  return preparedMatchWithoutAssist;
}

export { prepareMatch };
