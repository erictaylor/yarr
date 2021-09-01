import { useContext } from 'react';
import { RouteContext } from '../context/RouteContext';
import type { PreparedRouteEntryProps } from '../types';

export const useRouteProps = (): PreparedRouteEntryProps => {
  const props = useContext(RouteContext);

  return props;
};
