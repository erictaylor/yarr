import type { MemoryHistoryOptions } from 'history';
import { parsePath, createMemoryHistory } from 'history';
import type { RouterOptions, RoutesConfig } from '../types';
import { createRouter } from './createRouter';
import { verifyRoutesConfig } from './verifyRoutesConfig';

export const createMemoryRouter = <Routes extends RoutesConfig>(
  { routes, ...routerOptions }: RouterOptions<Routes>,
  historyOptions?: MemoryHistoryOptions
) => {
  verifyRoutesConfig(routes);

  // This functions are overwritten because of bug in History v5 where
  // if a string `to` argument is passed in, location search and location hash
  // are not cleared but will use the existing locations search and hash.
  // See: https://github.com/erictaylor/yarr/issues/4
  //      https://github.com/remix-run/history/issues/859
  const history = createMemoryHistory(historyOptions);

  const originalPush = history.push;
  const originalReplace = history.replace;

  history.push = (to, state) => {
    originalPush(
      {
        hash: '',
        search: '',
        ...(typeof to === 'string' ? parsePath(to) : to),
      },
      state
    );
  };

  history.replace = (to, state) => {
    originalReplace(
      {
        hash: '',
        search: '',
        ...(typeof to === 'string' ? parsePath(to) : to),
      },
      state
    );
  };

  // ------- END FIX -------

  return createRouter({
    ...routerOptions,
    history,
    routes,
  });
};
