import type { History } from 'history';
import type { CreateRouterContext, RoutesConfig } from '../types';

const unimplementedFunction = () => {
  throw new Error('Function not yet implemented.');
};

export const createRouter = <Routes extends RoutesConfig>({
  history,
}: {
  history: History;
  routes: Routes;
}): CreateRouterContext => {
  const context: CreateRouterContext = {
    assistPrefetch: false,
    awaitComponent: false,
    get: unimplementedFunction,
    history,
    isActive: unimplementedFunction,
    preloadCode: unimplementedFunction,
    subscribe: unimplementedFunction,
    warmRoute: unimplementedFunction,
  };

  return context;
};
