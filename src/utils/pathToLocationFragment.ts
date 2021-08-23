import { parsePath } from 'history';
import type { LocationFragment } from '../types';

export const pathToLocationFragment = (
  path: LocationFragment | string
): LocationFragment => {
  return typeof path === 'string' ? parsePath(path) : path;
};
