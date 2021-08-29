import type { History, State } from 'history';
import { useContext } from 'react';
import { isRouterContext, RouterContext } from '../context/RouterContext';
import type { RouterContextProps } from '../types';

type UseHistory<S extends State> = Pick<History<S>, 'action' | 'location'>;

export const useHistory = <S extends State = State>(): UseHistory<S> => {
  const context = useContext(RouterContext) as RouterContextProps<S>;

  if (!isRouterContext(context)) {
    throw new Error(
      '`useHistory` can not be used outside of `RouterProvider`.'
    );
  }

  const { action, location } = context.history;

  return { action, location };
};
