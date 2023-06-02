import type { RoutesConfig } from '../../types';
import { createHashRouter } from '../createHashRouter';
import { createRouter } from '../createRouter';
import { createHashHistory } from 'history';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('history', () => ({
	createHashHistory: vi.fn(() => ({
		type: 'HashHistory',
	})),
}));
vi.mock('../createRouter');

describe('createHashRouter', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('throws when called with no arguments', () => {
		expect(() => {
			// @ts-expect-error - Verifying throw of invalid arguments.
			createHashRouter();
		}).toThrow();
	});

	it('calls createHashHistory with history options, and createRouter with routes and history', () => {
		const routes = [{}];
		createHashRouter(
			{
				assistPreload: false,
				awaitComponent: false,
				awaitPreload: false,
				routes: routes as unknown as RoutesConfig,
			},
			{ basename: '/' },
		);

		expect(createHashHistory).toHaveBeenCalledTimes(1);
		expect(createHashHistory).toHaveBeenCalledWith({ basename: '/' });
		expect(createRouter).toHaveBeenCalledTimes(1);
		expect(createRouter).toHaveBeenCalledWith({
			assistPreload: false,
			awaitComponent: false,
			awaitPreload: false,
			history: {
				type: 'HashHistory',
			},
			routes,
		});
	});
});
