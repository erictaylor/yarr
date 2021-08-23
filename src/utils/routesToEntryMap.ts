import type {
  RouteConfig,
  RouteEntry,
  RoutesConfig,
  RoutesEntryMap,
} from '../types';
import { SuspenseResource } from './SuspenseResource';
import { getCanonicalPath } from './getCanonicalPath';

/**
 * We create a Map from the routes array so we can optimistically perform matches with O(1) complexity.
 * This operation happens only once when initialising; generated Map is kept in memory for quick access.
 */
export const routesToEntryMap = (routes: RoutesConfig): RoutesEntryMap => {
  const routesEntryMap: RoutesEntryMap = new Map();

  const routesIterator = (
    inputRoutes: RoutesConfig,
    parentRoute?: RouteConfig
  ) =>
    inputRoutes.forEach((route) => {
      const { path, children, ...routeProps } = route;
      const { path: parentPath = '', redirectRules } = parentRoute ?? {};

      const parentCanonicalPath = parentPath === '/' ? '' : parentPath;
      const routeCanonicalPath = path ? getCanonicalPath(path) : '';
      const canonicalPath = [parentCanonicalPath, routeCanonicalPath].join('');

      const routeEntry: RouteEntry = {
        redirectRules,
        ...routeProps,
        component: new SuspenseResource(routeProps.component),
      };

      routesEntryMap.set(canonicalPath, routeEntry);

      if (children && Array.isArray(children)) {
        routesIterator(children, {
          // Redirect rules are merged from a parent route unless overwritten on the child route.
          redirectRules,
          ...routeProps,
          path: canonicalPath,
        });
      }
    });

  routesIterator(routes);

  if (process.env['NODE_ENV'] !== 'production' && !routesEntryMap.has('/*')) {
    // eslint-disable-next-line no-console
    console.warn(
      `You didn't set a wildcard (*) route to catch any unmatched path.
      This is required to make sure you push users to a Not Found page
      when they request a route that doesn't exist; e.g. 404.`
    );
  }

  return routesEntryMap;
};
