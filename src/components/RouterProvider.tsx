import type { ReactNode } from 'react';
import { RouterContext } from '../context/RouterContext';
import type { RouterContextProps } from '../types';

export interface RouterProviderProps {
  children: ReactNode;
  router: RouterContextProps;
}

export const RouterProvider = ({ children, router }: RouterProviderProps) => {
  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
};
