import type { ReactNode } from 'react';
import { useState } from 'react';
import { RouterContext } from '../context/RouterContext';
import type { RouterProps } from '../types';

export interface RouterProviderProps {
  children: ReactNode;
  router: RouterProps;
}

export const RouterProvider = ({ children, router }: RouterProviderProps) => {
  const [rendererInitialized, setRendererInitialized] = useState(false);

  return (
    <RouterContext.Provider
      value={{ ...router, rendererInitialized, setRendererInitialized }}
    >
      {children}
    </RouterContext.Provider>
  );
};

RouterProvider.displayName = 'RouterProvider';
