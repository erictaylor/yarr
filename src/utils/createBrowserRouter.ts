import type { BrowserHistoryOptions } from 'history';
import { createBrowserHistory } from 'history';
import type { RouterOptions, RoutesConfig } from '../types';
import { createRouter } from './createRouter';
import { verifyRoutesConfig } from './verifyRoutesConfig';

export const createBrowserRouter = <Routes extends RoutesConfig>(
  { routes, ...routerOptions }: RouterOptions<Routes>,
  historyOptions?: BrowserHistoryOptions
) => {
  verifyRoutesConfig(routes);

  return createRouter({
    ...routerOptions,
    history: createBrowserHistory(historyOptions),
    routes,
  });
};
