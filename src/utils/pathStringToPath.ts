import type { PartialPath, Path } from 'history';
import { parsePath } from 'history';

export const pathStringToPath = (path: PartialPath | string): Path => {
  return {
    hash: '',
    pathname: '',
    search: '',
    ...(typeof path === 'string' ? parsePath(path) : path),
  };
};
