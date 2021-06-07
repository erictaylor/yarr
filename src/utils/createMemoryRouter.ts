import { createMemoryHistory, MemoryHistoryOptions } from 'history';
import { createRouter } from './createRouter';
import { RoutesConfig } from '../types';
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
