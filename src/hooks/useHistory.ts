import { RouterContext, isRouterContext } from '../context/RouterContext';
import type { RouterContextProps, State } from '../types';
import type { History } from 'history';
import { useContext } from 'react';

type UseHistory<S extends State> = Pick<
	History<S>,
	'action' | 'listen' | 'location'
>;

export const useHistory = <S extends State = State>(): UseHistory<S> => {
	const context = useContext(RouterContext) as RouterContextProps<S>;

	if (!isRouterContext(context)) {
		throw new Error(
			'`useHistory` can not be used outside of `RouterProvider`.',
		);
	}

	const { action, listen, location } = context.history;

	return { action, listen, location };
};
