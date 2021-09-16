import type { PartialPath } from '../types';
import { pathStringToPath } from './pathStringToPath';
import { queryStringToObject } from './queryStringToObject';
import { sortAndStringifySearchParameters } from './sortAndStringifySearchParameters';

export const locationsMatch = (
  leftLocation: PartialPath | string,
  rightLocation: PartialPath | string,
  exact = false
): boolean => {
  const leftLocationFragment = pathStringToPath(leftLocation);
  const rightLocationFragment = pathStringToPath(rightLocation);

  if (leftLocationFragment.pathname !== rightLocationFragment.pathname) {
    return false;
  }

  if (exact) {
    const leftLocationSearch = sortAndStringifySearchParameters(
      queryStringToObject(leftLocationFragment.search ?? '')
    );
    const rightLocationSearch = sortAndStringifySearchParameters(
      queryStringToObject(rightLocationFragment.search ?? '')
    );

    return (
      leftLocationSearch === rightLocationSearch &&
      leftLocationFragment.hash === rightLocationFragment.hash
    );
  }

  return true;
};
