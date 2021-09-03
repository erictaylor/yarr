import type { To } from 'history';

/**
 * This serves as a replacement for `history`'s `createHref` method.
 *
 * History's `createHref` method currently has some bugs that are not fixed.
 * We'll provide a PR to that repo once we verify that everything is working.
 */
export const createHref = (to: To): string => {
  if (typeof to === 'string') {
    return to;
  }

  const { pathname, search, hash } = to;

  const fixedSearch: string =
    search === undefined || search === ''
      ? ''
      : search.startsWith('?')
      ? search
      : `?${search}`;

  const fixedHash: string =
    hash === undefined || hash === ''
      ? ''
      : hash.startsWith('#')
      ? hash
      : `#${hash}`;

  return `${pathname}${fixedSearch}${fixedHash}`;
};
