import { parsePath } from 'history';
import type { PartialPath, HistoryPath } from '../types';

export const pathStringToPath = (path: PartialPath | string): HistoryPath => {
  return {
    hash: '',
    pathname: '',
    search: '',
    ...(typeof path === 'string' ? parsePath(path) : path),
  };
};
