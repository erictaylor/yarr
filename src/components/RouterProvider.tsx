import React, { ReactNode } from 'react';
import { RouterContext } from '../context/RouterContext';
import { CreateRouterContext } from '../types';

export interface RouterProviderProps {
  children: ReactNode;
  router: CreateRouterContext;
}

export const RouterProvider = ({ children, router }: RouterProviderProps) => {
  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
};
