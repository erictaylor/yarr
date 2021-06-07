import { createContext } from 'react';
import { RouterContextProps } from '../types';

export const isRouterContext = (
  context: RouterContextProps | null
): context is RouterContextProps => {
  if (context === null) return false;

  return true;
};

export const RouterContext = createContext<RouterContextProps | null>(null);
