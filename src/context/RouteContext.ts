import { createContext } from 'react';
import type { PreparedRouteEntryProps } from '../types';

const defaultContext: PreparedRouteEntryProps = {
  params: {},
  search: {},
};

export const RouteContext = createContext(defaultContext);
