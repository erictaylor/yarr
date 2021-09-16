import { useContext, useEffect } from 'react';
import { RouterContext } from '../context/RouterContext';
import type { State, To } from '../types';

interface RedirectProps<S extends State = State> {
  exact?: boolean;
  push?: boolean;
  to: To<S>;
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
}: RedirectProps<S>) => {
  const { history, isActive, rendererInitialized } = useContext(RouterContext);

  useEffect(() => {
    if (rendererInitialized && !isActive(to, exact)) {
      const replaceMethod = push ? 'push' : 'replace';

      history[replaceMethod](to);
    }
  }, [exact, history, isActive, push, rendererInitialized, to]);

  return null;
};

Redirect.displayName = 'Redirect';
