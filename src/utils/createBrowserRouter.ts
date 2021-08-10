import type { BrowserHistoryOptions} from 'history';
import { createBrowserHistory } from 'history';
import type { RoutesConfig } from '../types';
import { createRouter } from './createRouter';
import { verifyRoutesConfig } from './verifyRoutesConfig';

export const createBrowserRouter = <Routes extends RoutesConfig>(
  routes: Routes,
  historyOptions?: BrowserHistoryOptions
) => {
  verifyRoutesConfig(routes);

  return createRouter({
    history: createBrowserHistory(historyOptions),
    routes,
  });
};
