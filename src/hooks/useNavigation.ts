import type { History } from 'history';
import { useContext, useMemo } from 'react';
import { isRouterContext, RouterContext } from '../context/RouterContext';
import type { RouterContextProps, State } from '../types';

type UseNavigation<S extends State> = Pick<
  History<S>,
  'block' | 'go' | 'push' | 'replace'
> & {
  // These would come from history v5, but in v4 we are renaming them
  back: () => void;
  forward: () => void;
};

export const useNavigation = <S extends State = State>(): UseNavigation<S> => {
  const context = useContext(RouterContext) as RouterContextProps<S>;

  if (!isRouterContext(context)) {
    throw new Error(
      '`useNavigation` can not be used outside of `RouterProvider`.'
    );
  }

  const { goBack, block, goForward, go, push, replace } = context.history;

  return useMemo(
    () => ({ back: goBack, block, forward: goForward, go, push, replace }),
    [goBack, block, goForward, go, push, replace]
  );
};
