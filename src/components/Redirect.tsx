import type { State, To } from 'history';
import { useContext, useEffect } from 'react';
import { RouterContext } from '../context/RouterContext';

interface RedirectProps<S extends State = State> {
  exact?: boolean;
  push?: boolean;
  state?: S;
  to: To;
}

/**
 * Redirects the router to given `to` location if current location is not equal to `to` location.
 *
 * @deprecated
 * This will be removed in version v3, and is only kept for backwards compatibility
 * with version v1. Opt to use `redirectRules` in route config instead.
 */
export const Redirect = <S extends State>({
  exact,
  push,
  to,
  state,
}: RedirectProps<S>) => {
  const { history, isActive, rendererInitialized } = useContext(RouterContext);

  useEffect(() => {
    if (rendererInitialized && !isActive(to, exact)) {
      const replaceMethod = push ? 'push' : 'replace';

      history[replaceMethod](to, state);
    }
  }, [exact, history, isActive, push, rendererInitialized, state, to]);

  return null;
};

Redirect.displayName = 'Redirect';
