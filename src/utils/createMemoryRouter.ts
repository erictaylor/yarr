import type { MemoryHistoryOptions } from 'history';
import { createMemoryHistory } from 'history';
import type { RouterOptions, RoutesConfig } from '../types';
import { createRouter } from './createRouter';
import { verifyRoutesConfig } from './verifyRoutesConfig';

export const createMemoryRouter = <Routes extends RoutesConfig>(
  { routes, ...routerOptions }: RouterOptions<Routes>,
  historyOptions?: MemoryHistoryOptions
) => {
  verifyRoutesConfig(routes);

  return createRouter({
    ...routerOptions,
    history: createMemoryHistory(historyOptions),
    routes,
  });
};
