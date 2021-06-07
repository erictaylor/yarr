import { BrowserHistoryOptions, createBrowserHistory } from 'history';
import { createRouter } from './createRouter';
import { RoutesConfig } from '../types';
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
