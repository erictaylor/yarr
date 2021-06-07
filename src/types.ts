import { BrowserHistory, HashHistory, MemoryHistory } from 'history';

export type RoutesConfig = ReadonlyArray<{}>;

export type RouteEntry = unknown;

export type RouterSubscriptionCallback = (nextEntry: RouteEntry) => void;

export type RouterSubscriptionDispose = () => void;

export interface CreateRouterContext {
  readonly assistPrefetch: boolean;
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
