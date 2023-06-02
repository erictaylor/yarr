import type { RoutesConfig } from '../../types';
import { createBrowserRouter } from '../createBrowserRouter';
import { createRouter } from '../createRouter';
import { createBrowserHistory } from 'history';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('history', () => ({
	createBrowserHistory: vi.fn(() => ({ type: 'BrowserHistory' })),
}));
vi.mock('../createRouter');

describe('createBrowserRouter', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('throws when called with no arguments', () => {
		expect(() => {
			// @ts-expect-error - Verifying throw of invalid arguments.
			createBrowserRouter();
		}).toThrow();
	});

	it('calls createBrowserHistory with history options, and createRouter with routes and history', () => {
		const routes = [{}];
		createBrowserRouter(
			{
				assistPreload: false,
				awaitComponent: false,
				awaitPreload: false,
				routes: routes as unknown as RoutesConfig,
			},
			{ basename: '/' },
		);

		expect(createBrowserHistory).toHaveBeenCalledTimes(1);
		expect(createBrowserHistory).toHaveBeenCalledWith({ basename: '/' });
		expect(createRouter).toHaveBeenCalledTimes(1);
		expect(createRouter).toHaveBeenCalledWith({
			assistPreload: false,
			awaitComponent: false,
			awaitPreload: false,
			history: {
				type: 'BrowserHistory',
			},
			routes,
		});
	});
});
