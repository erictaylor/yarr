import type { HashHistoryOptions } from 'history';
import { createHashHistory } from 'history';
import type { RoutesConfig } from '../types';
import { createRouter } from './createRouter';
import { verifyRoutesConfig } from './verifyRoutesConfig';

export const createHashRouter = <Routes extends RoutesConfig>(
  routes: Routes,
  historyOptions?: HashHistoryOptions
) => {
  verifyRoutesConfig(routes);

  return createRouter({
    history: createHashHistory(historyOptions),
    routes,
  });
};
