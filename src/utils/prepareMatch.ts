import type {
  MatchedRoute,
  PreloadConfig,
  PreloadedMap,
  PreloadFunction,
  PreparedMatchFragment,
  PreparedMatchWithAssist,
  PreparedMatchWithoutAssist,
} from '../types';
import { SuspenseResource } from './SuspenseResource';
import { sortAndStringifySearchParameters } from './sortAndStringifySearchParameters';

/**
 * Holds cached value for last prepared match;
 * used only when assisting preload (ie `assistPreload` is true).
 *
 * Used so we don't avoid multiple network requests.
 */
const lastPreparedMatch: {
  parametersString: string;
  pathname: string;
  value: PreparedMatchWithAssist | null;
} = {
  parametersString: '',
  pathname: '',
  value: null,
};

const isPreloadFunction = (
  preload?: PreloadConfig | PreloadFunction
): preload is PreloadFunction => {
  return typeof preload === 'function';
};

const prepareAssistPreloadMatch = (
  { route, params }: MatchedRoute,
  awaitPreload: boolean
): PreloadedMap => {
  const preloaded: PreloadedMap = new Map();
  const preload = route.preload?.(params);

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

    const fetchFunction: PreloadFunction = isPreloadFunction(preloadProperty)
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

interface PrepareMatchFunction {
  (
    match: MatchedRoute,
    assistPreload: true,
    awaitPreload?: boolean
  ): PreparedMatchWithAssist;
  (
    match: MatchedRoute,
    assistPreload?: false,
    awaitPreload?: boolean
  ): PreparedMatchWithoutAssist;
  (match: MatchedRoute, assistPreload?: boolean, awaitPreload?: boolean):
    | PreparedMatchWithAssist
    | PreparedMatchWithoutAssist;
}

/**
 * Prepares a route before navigation is requested by warming up the component resource
 * and dealing with any data preloading that needs to take place.
 *
 * If `assistPreload` is true, we build suspense resources for all the requested preload data.
 */
// TODO: FIX THE FUCKING TYPING ISSUE HERE!!!
// @ts-expect-error -- fix the fucking typing issue here
export const prepareMatch: PrepareMatchFunction = (
  match,
  assistPreload = false,
  awaitPreload = false
) => {
  const { route, params, location } = match;

  const pathnameMatch = location.pathname === lastPreparedMatch.pathname;
  const parametersString = sortAndStringifySearchParameters(params);

  // Check if requested match is same as last match. This is important because cached match holds
  // generated resources for preload which we need to re-use to avoid multiple network requests
  if (
    assistPreload &&
    pathnameMatch &&
    parametersString === lastPreparedMatch.parametersString &&
    lastPreparedMatch.value !== null
  ) {
    return lastPreparedMatch.value;
  }

  // Start loading the component code.
  void route.component.load();

  const preparedMatchFragment: PreparedMatchFragment = {
    component: route.component,
    location,
    params,
  };

  if (assistPreload) {
    const preloaded =
      route.preload && prepareAssistPreloadMatch(match, awaitPreload);

    const preparedMatchWithAssist: PreparedMatchWithAssist = {
      ...preparedMatchFragment,
      preloaded,
    };

    if (preloaded) {
      // Cache the prepared match so we can reuse it for next match if the route is the same.
      lastPreparedMatch.pathname = location.pathname ?? '';
      lastPreparedMatch.parametersString =
        sortAndStringifySearchParameters(params);
      lastPreparedMatch.value = preparedMatchWithAssist;
    }

    return preparedMatchWithAssist;
  }

  const preparedMatchWithoutAssist: PreparedMatchWithoutAssist = {
    ...preparedMatchFragment,
    preloaded: route.preload?.(params),
  };

  return preparedMatchWithoutAssist;
};
