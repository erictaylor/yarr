import type { BrowserHistory, HashHistory, MemoryHistory } from 'history';
import type { ComponentType } from 'react';
import type { SuspenseResource } from './utils/SuspenseResource';

/**
 * This type takes a given path and returns a union containing the path parameters.
 *
 * The conditional case logic is as follows:
 * 1. First case matches parameters at the start or middle of the path (ie `':username/projects/:projectId/edit'`).
 * 2. Second case matches parameters at the end of the path (ie `':projectId'`).
 * 3. The third matches strings with some other content before a parameter and strips it away (ie `'/project/:projectId'`).
 * 4. The last case returns `never` if none of the three previous cases match (which causes it behave like an empty set when used in a union).
 *
 * The first and third cases are called recursively with a shorter section of the string.
 */
export type PathParameters<Path extends string> =
  Path extends `:${infer Parameter}/${infer Rest}`
    ? Parameter | PathParameters<Rest>
    : Path extends `:${infer Parameter}`
    ? Parameter
    : Path extends `${string}:${infer Rest}`
    ? PathParameters<`:${Rest}`>
    : never;

/**
 * Given a path this type returns a object whose
 * keys are the path parameter names.
 */
export type RouteParameters<Path extends string> = {
  [K in PathParameters<Path>]: string;
};

/**
 * A single route configuration object.
 */
export interface RouteConfig<
  ParentPath extends string = string,
  Path extends string = string
> {
  /**
   * An array of child routes whose paths are relative to the parent path.
   */
  children?: ReadonlyArray<RouteConfig<`${ParentPath}${Path}`>>;
  /**
   * The component to be rendered when the route path matches.
   *
   * This is a function that returns a promise to dynamically load the component.
   *
   * It is recommended to use dynamic import syntax (e.g. `import('./MyComponent')`) to load the component.
   *
   * @example `() => import('./MyComponent').then(m => m.default)`
   */
  component: () => Promise<ComponentType<{}>>;
  /**
   * A string that sets the pathname which the route will be matched against.
   *
   * Children routes will prefix their paths with this pathname.
   */
  path: Path;
  /**
   * A function that returns an object whose keys are preload entities that are
   * mapped to the `preloaded` prop on the rendered route component.
   *
   * Each value is a function that returns a promise to dynamically load any needed data.
   *
   * Requests are initialized concurrently and allows components to suspend.
   *
   * @example
   * ```
   * () => ({
   *   data: () => fetch('https://api.example.com/data'),
   * })
   * ```
   */
  preload?: (routeParameters: RouteParameters<`${ParentPath}${Path}`>) => {
    [key: string]: () => Promise<unknown>;
  };
  /**
   * A function where you can perform logic to conditionally determine
   * if the router should redirect the user to another route.
   *
   * This redirect logic is run before any preload logic or component render.
   *
   * The function should return the full pathname of the route to redirect to,
   * or `null` if no redirect should occur.
   *
   * NOTE: redirect rules apply to children routes unless overridden.
   */
  redirectRules?: (
    routeParameters: RouteParameters<`${ParentPath}${Path}`>
  ) => string | null;
}

export type RoutesConfig = readonly RouteConfig[];

export type RouteEntry = Omit<RouteConfig, 'component' | 'path'> & {
  component: SuspenseResource<ComponentType>;
};

export type RouterSubscriptionCallback = (nextEntry: RouteEntry) => void;

export type RouterSubscriptionDispose = () => void;

export interface CreateRouterContext {
  readonly assistPreload: boolean;
  readonly awaitComponent: boolean;
  readonly get: () => RouteEntry;
  readonly history: BrowserHistory | HashHistory | MemoryHistory;
  readonly isActive: (path: string, exact: boolean) => boolean;
  readonly preloadCode: (pathname: string) => void;
  readonly subscribe: (
    callback: RouterSubscriptionCallback
  ) => RouterSubscriptionDispose;
  readonly warmRoute: (pathname: string) => void;
}

export type RouterContextProps = CreateRouterContext;
