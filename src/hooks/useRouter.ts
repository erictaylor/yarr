import { useContext } from 'react';
import { isRouterContext, RouterContext } from '../context/RouterContext';
import { RouterContextProps } from '../types';

type UseRouter = Pick<
  RouterContextProps,
  'isActive' | 'preloadCode' | 'warmRoute'
>;

export const useRouter = (): UseRouter => {
  const context = useContext(RouterContext);

  if (!isRouterContext(context)) {
    throw new Error('`useRouter` can not be used outside of `RouterProvider`.');
  }

  const { isActive, preloadCode, warmRoute } = context;

  return { isActive, preloadCode, warmRoute };
};
