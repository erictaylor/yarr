import type { RouterOptions, RoutesConfig, State } from '../types';
import { createRouter } from './createRouter';
import { verifyRoutesConfig } from './verifyRoutesConfig';
import type { MemoryHistoryBuildOptions as MemoryHistoryOptions } from 'history';
import { createMemoryHistory } from 'history';

export const createMemoryRouter = <Routes extends RoutesConfig>(
	{ routes, ...routerOptions }: RouterOptions<Routes>,
	historyOptions?: MemoryHistoryOptions,
) => {
	verifyRoutesConfig(routes);

	const history = createMemoryHistory<State>(historyOptions);

	return createRouter({
		...routerOptions,
		history,
		routes,
	});
};
