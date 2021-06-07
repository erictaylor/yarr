import { createHashHistory, HashHistoryOptions } from 'history';
import { createRouter } from './createRouter';
import { RoutesConfig } from '../types';
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
