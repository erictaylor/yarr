import type { HashHistoryBuildOptions as HashHistoryOptions } from 'history';
import { createHashHistory } from 'history';
import type { RouterOptions, RoutesConfig, State } from '../types';
import { createRouter } from './createRouter';
import { verifyRoutesConfig } from './verifyRoutesConfig';

export const createHashRouter = <Routes extends RoutesConfig>(
  { routes, ...routerOptions }: RouterOptions<Routes>,
  historyOptions?: HashHistoryOptions
) => {
  verifyRoutesConfig(routes);

  const history = createHashHistory<State>(historyOptions);

  return createRouter({
    ...routerOptions,
    history,
    routes,
  });
};
