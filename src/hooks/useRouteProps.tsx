import { RouteContext } from '../context/RouteContext';
import type { PreparedRouteEntryProps } from '../types';
import { useContext } from 'react';

export const useRouteProps = (): PreparedRouteEntryProps => {
	const props = useContext(RouteContext);

	return props;
};
