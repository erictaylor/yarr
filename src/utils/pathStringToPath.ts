import type { HistoryPath, PartialPath } from '../types';
import { parsePath } from 'history';

export const pathStringToPath = (path: PartialPath | string): HistoryPath => {
	return {
		hash: '',
		pathname: '',
		search: '',
		...(typeof path === 'string' ? parsePath(path) : path),
	};
};
