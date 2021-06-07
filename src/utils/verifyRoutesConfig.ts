import { RoutesConfig } from '../types';

export const verifyRoutesConfig = <Routes extends RoutesConfig>(
  routes: unknown
): routes is Routes => {
  if (!Array.isArray(routes)) {
    throw new Error('No routes array provided.');
  } else if (routes.length === 0) {
    throw new Error('At least one route must be provided.');
  }

  return true;
};
