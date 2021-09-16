import type { HistoryPath, MatchedRoute, RoutesEntryMap } from '../types';
import { matchRegexRoute } from './matchRegexRoute';
import { pathStringToPath } from './pathStringToPath';
import { queryStringToObject } from './queryStringToObject';

/**
 * Matches a requested location to a route via a Map of routes.
 *
 * We first try to match the requested location to any "direct" routes (ie no named parameters or wildcards).
 * Otherwise we loop through all routes attempting to match with a Regex pattern.
 * A wildcard fallback route (404) will be returned if no match is found.
 */
export const matchRoutes = (
  routes: RoutesEntryMap,
  requestedMatch: HistoryPath | string
): MatchedRoute => {
  const locationToMatch = pathStringToPath(requestedMatch);
  const { pathname } = locationToMatch;

  let parameters: Record<string, string> = {};
  const searchParameters = {
    ...queryStringToObject(locationToMatch.search ?? ''),
  };

  if (!pathname) {
    throw new Error('Unable to determine pathname from given location');
  }

  // First we try to match the pathname without regex (applies to routes without named parameters or wildcards)
  let matchedRoute = routes.has(pathname) && routes.get(pathname);
  let routeKey: string = pathname;

  if (!matchedRoute) {
    // If we didn't find a direct match, we try to match the pathname with regex
    // (applies to routes with named parameters or wildcards)
    for (const [path, route] of routes.entries()) {
      if (path !== '/*') {
        const match = matchRegexRoute(path, pathname);
        if (!match) continue;

        parameters = { ...match.params };
      }

      // We either found a match or we reach our wildcard route that will be used for not found routes.
      routeKey = path;
      matchedRoute = route;
      break;
    }
  }

  // This should hopefully never happen since we have earlier checks to verify a catch-all route exists.
  if (!matchedRoute) {
    throw new Error(
      'No route found for requested path. Ensure you have a wildcard (*) route to catch-all non-matching paths.'
    );
  }

  // If the matchedRoute has redirect rules, we need to run them to determine a possible new location.
  const redirectPath = matchedRoute.redirectRules?.(
    parameters,
    searchParameters
  );

  return redirectPath
    ? matchRoutes(routes, redirectPath)
    : {
        key: routeKey,
        location: locationToMatch,
        params: parameters,
        route: matchedRoute,
        search: searchParameters,
      };
};
