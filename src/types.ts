import type {
  Action,
  // BrowserHistory,
  // HashHistory,
  History,
  Location,
  LocationDescriptor,
  LocationDescriptorObject,
  MemoryHistory,
  // Path,
  // PartialPath,
  // State,
  // To,
  // Update,
} from 'history';
import type { ComponentType } from 'react';
import type { SuspenseResource } from './utils/SuspenseResource';

// HISTORY TYPES
// --------------------------------------------------

// In v5, State is `object | null`, not `undefined`.
export type State = object | undefined;

export type BrowserHistory<S extends State = State> = History<S>;
export type HashHistory<S extends State = State> = History<S>;

// In History v5 this is just called "Path".
export interface HistoryPath {
  hash: string;
  pathname: string;
  search: string;
}

export type PartialPath = LocationDescriptorObject;

export interface Update {
  action: Action;
  location: Location;
}
export type To<S extends State = State> = LocationDescriptor<S>;

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

export type AssistedPreloadFunction = () => Promise<unknown>;

export interface AssistedPreloadConfig {
  data: AssistedPreloadFunction;
  defer?: boolean;
}

export type AssistedPreloadData = Record<
  string,
  AssistedPreloadConfig | AssistedPreloadFunction
>;

export type UnassistedPreloadData = Record<string, unknown>;

/**
 * A single route configuration object.
 */
export interface RouteConfig<
  ParentPath extends string = string,
  Path extends string = string,
  Props extends PreparedRouteEntryProps = { params: {}; search: {} },
  AssistMode extends boolean = boolean
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
  component: () => Promise<ComponentType<Props>>;
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
  preload?: (
    routeParameters: RouteParameters<`${ParentPath}${Path}`>,
    searchParameters: Record<string, string[] | string>
  ) => AssistMode extends true ? AssistedPreloadData : UnassistedPreloadData;
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
    namedParameters: RouteParameters<`${ParentPath}${Path}`>,
    searchParameters: Record<string, string[] | string>
  ) => string | null;
}

export type RoutesConfig = readonly RouteConfig[];

export type RouteEntry<AssistMode extends boolean = boolean> = Omit<
  RouteConfig<string, string, PreparedRouteEntryProps<AssistMode>, AssistMode>,
  'component' | 'path'
> & {
  component: SuspenseResource<ComponentType<PreparedRouteEntryProps>>;
};

export type RoutesEntryMap = Map<string, RouteEntry>;

export interface RouterOptions<Routes extends RoutesConfig> {
  /**
   * Indicates to the router whether it should
   * transform preload requests into Suspense resources.
   *
   * @default false
   */
  assistPreload?: boolean;
  /**
   * Tells the router whether or not to continue rendering a
   * previous route component until the new requested route
   * component code has fully loaded.
   *
   * @default false
   */
  awaitComponent?: boolean;
  /**
   * Tells the router whether or not to continue rendering a
   * previous route component until the newly requested routes
   * preload data as loaded.
   *
   * @default false
   */
  awaitPreload?: boolean;
  /**
   * A function that is called with logging information from the router.
   */
  logger?: LoggerFunction;
  /**
   * An array of route configuration objects
   */
  routes: Routes;
}

export type LoggerFunction = (details: {
  context?: object;
  level: 'debug' | 'error' | 'info' | 'trace' | 'warn';
  message: string;
  scope: string;
}) => void;

export interface CreateRouterOptions<Routes extends RoutesConfig>
  extends RouterOptions<Routes> {
  history: History<State>;
}

export type RouterSubscriptionHistoryCallback = (
  nextEntry: PreparedEntryWithAssist | PreparedEntryWithoutAssist,
  locationUpdate: Update
) => unknown;

export type RouterSubscriptionDispose = () => void;

export type RouterSubscriptionTransitionCallback = (
  historyUpdate: Update
) => unknown;

export interface RouterProps<S extends State = State> {
  /**
   * When true, tells the router that route preloads should be made into suspense resources.
   */
  readonly assistPreload: boolean;
  /**
   * When true, tells the router will continue to render a previous route component
   * until the new route component is fully loaded and ready to use.
   */
  readonly awaitComponent: boolean;
  /**
   * Returns the current route entry for the current history location.
   */
  readonly get: () => PreparedEntryWithAssist | PreparedEntryWithoutAssist;
  /**
   * Returns the current matched route key.
   *
   * This is equivalent to the full canonical path pattern string.
   *
   * @example `/users/:id`
   */
  readonly getCurrentRouteKey: () => string;
  readonly history: BrowserHistory<S> | HashHistory<S> | MemoryHistory<S>;
  /**
   * Returns true if the given pathname matches the current history location.
   *
   * Setting `exact` optional argument will take both
   * the location search query and hash into account in the comparison.
   */
  readonly isActive: (path: PartialPath | string, exact?: boolean) => boolean;
  /**
   * The logger function that is called with logging information from the router.
   */
  readonly logger: LoggerFunction;
  /**
   * Preloads the component code for a given route.
   */
  readonly preloadCode: (to: To) => void;
  /**
   * This function gets called when the route entry has changed
   * and any assist preload data and component awaiting has finished.
   */
  readonly routeTransitionCompleted: (historyUpdate: Update) => void;
  /**
   * Allows you to subscribe to both history changes and transition completion.
   *
   * Returns a dispose function that you can call to unsubscribe from the events.
   *
   * NOTE: Just because the history has changed, doesn't mean the new route is rendered.
   * In `awaitComponent` mode, the new route is rendered once the component is resolved.
   * Likewise, in `awaitPreload` mode, the new route is rendered once the preload data is loaded.
   */
  readonly subscribe: (callbacks: {
    onTransitionComplete?: RouterSubscriptionTransitionCallback;
    onTransitionStart?: RouterSubscriptionHistoryCallback;
  }) => RouterSubscriptionDispose;
  /**
   * Preloads both the component code and data for a given route.
   */
  readonly warmRoute: (to: To) => void;
}

export interface RouterContextProps<S extends State = State>
  extends RouterProps<S> {
  rendererInitialized: boolean;
  setRendererInitialized: (value: boolean) => void;
}
export interface MatchedRoute {
  /**
   * Represents the route pattern that was matched.
   */
  key: string;
  location: HistoryPath;
  params: Record<string, string>;
  route: RouteEntry;
  search: Record<string, string[] | string>;
}

export interface AssistedMatchedRoute extends MatchedRoute {
  route: RouteEntry<true>;
}

export type PreloadedMap = Map<
  string,
  { data: SuspenseResource<unknown>; defer: boolean }
>;

export interface PreparedEntryFragment {
  component: SuspenseResource<ComponentType<PreparedRouteEntryProps>>;
  location: HistoryPath;
  params: Record<string, string>;
  search: Record<string, string[] | string>;
}

export interface PreparedEntryWithAssist extends PreparedEntryFragment {
  preloaded?: PreloadedMap;
}

export interface PreparedEntryWithoutAssist extends PreparedEntryFragment {
  preloaded?: UnassistedPreloadData;
}

/* eslint-disable unicorn/prevent-abbreviations */
export type AssistedPreloadedProp = Record<string, SuspenseResource<unknown>>;
export type UnassistedPreloadedProp = Record<string, unknown>;
/* eslint-enable unicorn/prevent-abbreviations */

export interface PreparedRouteEntryProps<AssistMode extends boolean = boolean> {
  params: Record<string, string>;
  preloaded?: AssistMode extends true
    ? AssistedPreloadedProp
    : UnassistedPreloadedProp;
  search: Record<string, string[] | string>;
}

export interface PreparedRouteEntry {
  component: SuspenseResource<ComponentType<PreparedRouteEntryProps>>;
  location: HistoryPath;
  props: PreparedRouteEntryProps;
}

/**
 * This is the type your route components should extend from.
 *
 * @example
 * ```
 * import type { RouteProps } from 'yarr';
 *
 * export interface MyRouteComponentProps extends RouteProps<'/some/path/:id'> {
 *   preloaded: {
 *     query: () => Promise<{ id: string }>;
 *   };
 * }
 * ```
 */
export interface RouteProps<
  Path extends string,
  AssistMode extends boolean = false
> extends PreparedRouteEntryProps<AssistMode> {
  params: RouteParameters<Path>;
}
