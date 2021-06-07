import { History } from 'history';
import { useContext } from 'react';
import { isRouterContext, RouterContext } from '../context/RouterContext';

type UseHistory = Pick<History, 'action' | 'location'>;

export const useHistory = (): UseHistory => {
  const context = useContext(RouterContext);

  if (!isRouterContext(context)) {
    throw new Error(
      '`useHistory` can not be used outside of `RouterProvider`.'
    );
  }

  const { action, location } = context.history;

  return { action, location };
};
