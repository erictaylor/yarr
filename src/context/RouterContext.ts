import { createContext } from 'react';
import type { RouterContextProps } from '../types';

const defaultFunction = () => {
  throw new Error('RouterContext was called outside of RouterProvider.');
};

export const isRouterContext = (
  context: RouterContextProps
): context is RouterContextProps => {
  return context.warmRoute !== defaultFunction;
};

const defaultContext: RouterContextProps = {
  assistPreload: false,
  awaitComponent: false,
  get: defaultFunction,
  getCurrentRouteKey: defaultFunction,
  history: {
    action: 'PUSH',
    block: defaultFunction,
    createHref: defaultFunction,
    go: defaultFunction,
    goBack: defaultFunction,
    goForward: defaultFunction,
    length: 0,
    listen: defaultFunction,
    location: {
      hash: '',
      key: '',
      pathname: '',
      search: '',
      state: undefined,
    },
    push: defaultFunction,
    replace: defaultFunction,
  },
  isActive: defaultFunction,
  logger: defaultFunction,
  preloadCode: defaultFunction,
  rendererInitialized: false,
  routeTransitionCompleted: defaultFunction,
  setRendererInitialized: defaultFunction,
  subscribe: defaultFunction,
  warmRoute: defaultFunction,
};

export const RouterContext = createContext<RouterContextProps>(defaultContext);
