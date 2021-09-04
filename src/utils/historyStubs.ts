import type { PartialPath, Path, State, To } from 'history';
import { parsePath, createPath } from 'history';

const normalizePartialPath = ({
  hash,
  pathname,
  search,
}: PartialPath): Path => {
  return {
    hash: hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '',
    pathname: pathname
      ? pathname.startsWith('/')
        ? pathname
        : `/${pathname}`
      : '/',
    search: search ? (search.startsWith('?') ? search : `?${search}`) : '',
  };
};

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

  return createPath(normalizePartialPath(to));
};

export const stubHistoryPush =
  (push: (to: To, state?: State) => void) =>
  (to: To, state?: State): void => {
    push(
      {
        ...(typeof to === 'string' ? parsePath(to) : normalizePartialPath(to)),
      },
      state
    );
  };

export const stubHistoryReplace =
  (replace: (to: To, state?: State) => void) =>
  (to: To, state?: State): void => {
    replace(
      {
        ...(typeof to === 'string' ? parsePath(to) : normalizePartialPath(to)),
      },
      state
    );
  };
