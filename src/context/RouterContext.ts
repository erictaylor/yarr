import { Action } from 'history';
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
  history: {
    action: Action.Push,
    back: defaultFunction,
    block: defaultFunction,
    createHref: defaultFunction,
    forward: defaultFunction,
    go: defaultFunction,
    listen: defaultFunction,
    location: {
      hash: '',
      key: '',
      pathname: '',
      search: '',
      state: null,
    },
    push: defaultFunction,
    replace: defaultFunction,
  },
  isActive: defaultFunction,
  preloadCode: defaultFunction,
  routeTransitionCompleted: defaultFunction,
  subscribe: defaultFunction,
  warmRoute: defaultFunction,
};

export const RouterContext = createContext<RouterContextProps>(defaultContext);
