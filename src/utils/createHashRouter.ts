import type { HashHistoryOptions } from 'history';
import { createHashHistory } from 'history';
import type { RouterOptions, RoutesConfig } from '../types';
import { createRouter } from './createRouter';
import {
  createHref,
  stubHistoryPush,
  stubHistoryReplace,
} from './historyStubs';
import { verifyRoutesConfig } from './verifyRoutesConfig';

export const createHashRouter = <Routes extends RoutesConfig>(
  { routes, ...routerOptions }: RouterOptions<Routes>,
  historyOptions?: HashHistoryOptions
) => {
  verifyRoutesConfig(routes);

  const history = createHashHistory(historyOptions);

  // This functions are overwritten because of bug in History v5 where
  // if a string `to` argument is passed in, location search and location hash
  // are not cleared but will use the existing locations search and hash.
  // See: https://github.com/erictaylor/yarr/issues/4
  //      https://github.com/remix-run/history/issues/859
  history.createHref = createHref;
  history.push = stubHistoryPush(history.push);
  history.replace = stubHistoryReplace(history.replace);
  // ------- END FIX -------

  return createRouter({
    ...routerOptions,
    history,
    routes,
  });
};
