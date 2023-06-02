import { RouterContext, isRouterContext } from '../context/RouterContext';
import type { RouterContextProps } from '../types';
import { useContext } from 'react';

type UseRouter = Pick<
	RouterContextProps,
	'getCurrentRouteKey' | 'isActive' | 'preloadCode' | 'subscribe' | 'warmRoute'
>;

export const useRouter = (): UseRouter => {
	const context = useContext(RouterContext);

	if (!isRouterContext(context)) {
		throw new Error('`useRouter` can not be used outside of `RouterProvider`.');
	}

	const { getCurrentRouteKey, isActive, preloadCode, subscribe, warmRoute } =
		context;

	return { getCurrentRouteKey, isActive, preloadCode, subscribe, warmRoute };
};
