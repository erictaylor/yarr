import type { PreparedRouteEntryProps } from '../types';
import { createContext } from 'react';

const defaultContext: PreparedRouteEntryProps = {
	params: {},
	search: {},
};

export const RouteContext = createContext(defaultContext);
