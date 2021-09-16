import type { BrowserHistoryBuildOptions as BrowserHistoryOptions } from 'history';
import { createBrowserHistory } from 'history';
import type { RouterOptions, RoutesConfig, State } from '../types';
import { createRouter } from './createRouter';
import { verifyRoutesConfig } from './verifyRoutesConfig';

export const createBrowserRouter = <Routes extends RoutesConfig>(
  { routes, ...routerOptions }: RouterOptions<Routes>,
  historyOptions?: BrowserHistoryOptions
) => {
  verifyRoutesConfig(routes);

  const history = createBrowserHistory<State>(historyOptions);

  return createRouter({
    ...routerOptions,
    history,
    routes,
  });
};
