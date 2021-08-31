import type { To } from 'history';
import { useContext, useEffect } from 'react';
import { RouterContext } from '../context/RouterContext';

interface RedirectProps {
  exact?: boolean;
  push?: boolean;
  to: To;
}

/**
 * Redirects the router to given `to` location if current location is not equal to `to` location.
 *
 * @deprecated
 * This will be removed in version v3, and is only kept for backwards compatibility
 * with version v1. Opt to use `redirectRules` in route config instead.
 */
export const Redirect = ({ exact, push, to }: RedirectProps) => {
  const { history, isActive } = useContext(RouterContext);

  useEffect(() => {
    if (!isActive(to, exact)) {
      const replaceMethod = push ? 'push' : 'replace';

      history[replaceMethod](to);
    }
  }, [exact, history, isActive, push, to]);

  return null;
};

Redirect.displayName = 'Redirect';
