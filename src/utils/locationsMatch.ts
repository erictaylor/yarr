import type { PartialPath } from 'history';
import { pathToLocationFragment } from './pathToLocationFragment';

export const locationsMatch = (
  leftLocation: PartialPath | string,
  rightLocation: PartialPath | string,
  exact = false
): boolean => {
  const leftLocationFragment = pathToLocationFragment(leftLocation);
  const rightLocationFragment = pathToLocationFragment(rightLocation);

  if (leftLocationFragment.pathname !== rightLocationFragment.pathname) {
    return false;
  }

  // TODO: Should be sort `search` values when `exact` is true and comparing?

  return exact
    ? leftLocationFragment.search === rightLocationFragment.search &&
        leftLocationFragment.hash === rightLocationFragment.hash
    : true;
};
