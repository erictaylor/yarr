import type { HashHistoryOptions } from 'history';
import { createHashHistory } from 'history';
import type { RouterOptions, RoutesConfig } from '../types';
import { createRouter } from './createRouter';
import { verifyRoutesConfig } from './verifyRoutesConfig';

export const createHashRouter = <Routes extends RoutesConfig>(
  { routes, ...routerOptions }: RouterOptions<Routes>,
  historyOptions?: HashHistoryOptions
) => {
  verifyRoutesConfig(routes);

  return createRouter({
    ...routerOptions,
    history: createHashHistory(historyOptions),
    routes,
  });
};
