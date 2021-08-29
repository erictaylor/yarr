import type { History, State } from 'history';
import { useContext } from 'react';
import { isRouterContext, RouterContext } from '../context/RouterContext';

type UseNavigation<S extends State> = Pick<
  History<S>,
  'back' | 'forward' | 'go' | 'push' | 'replace'
>;

export const useNavigation = <S extends State = State>(): UseNavigation<S> => {
  const context = useContext(RouterContext);

  if (!isRouterContext(context)) {
    throw new Error(
      '`useNavigation` can not be used outside of `RouterProvider`.'
    );
  }

  const { back, forward, go, push, replace } = context.history;

  return { back, forward, go, push, replace };
};
