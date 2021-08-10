import type { MemoryHistoryOptions } from 'history';
import { createMemoryHistory } from 'history';
import type { RoutesConfig } from '../types';
import { createRouter } from './createRouter';
import { verifyRoutesConfig } from './verifyRoutesConfig';

export const createMemoryRouter = <Routes extends RoutesConfig>(
  routes: Routes,
  historyOptions?: MemoryHistoryOptions
) => {
  verifyRoutesConfig(routes);

  return createRouter({
    history: createMemoryHistory(historyOptions),
    routes,
  });
};
