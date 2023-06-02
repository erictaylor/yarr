import type { RoutesConfig } from '../../types';
import { createMemoryRouter } from '../createMemoryRouter';
import { createRouter } from '../createRouter';
import { createMemoryHistory } from 'history';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('history', () => ({
	createMemoryHistory: vi.fn(() => ({
		type: 'MemoryHistory',
	})),
}));
vi.mock('../createRouter');

describe('createMemoryRouter', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('throws when called with no arguments', () => {
		expect(() => {
			// @ts-expect-error - Verifying throw of invalid arguments.
			createMemoryRouter();
		}).toThrow();
	});

	it('calls createMemoryHistory with history options, and createRouter with routes and history', () => {
		const routes = [{}];
		createMemoryRouter(
			{
				assistPreload: false,
				awaitComponent: false,
				awaitPreload: false,
				routes: routes as unknown as RoutesConfig,
			},
			{
				initialEntries: ['/'],
				initialIndex: 0,
			},
		);

		expect(createMemoryHistory).toHaveBeenCalledTimes(1);
		expect(createMemoryHistory).toHaveBeenCalledWith({
			initialEntries: ['/'],
			initialIndex: 0,
		});
		expect(createRouter).toHaveBeenCalledTimes(1);
		expect(createRouter).toHaveBeenCalledWith({
			assistPreload: false,
			awaitComponent: false,
			awaitPreload: false,
			history: {
				type: 'MemoryHistory',
			},
			routes,
		});
	});
});
