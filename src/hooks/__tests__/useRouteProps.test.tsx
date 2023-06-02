import { RouteContext } from '../../context/RouteContext';
import { useRouteProps } from '../useRouteProps';
import { renderHook } from '@testing-library/react-hooks';
import { describe, expect, it, vi } from 'vitest';

const ContextWrapper = ({ children }: { children: React.ReactNode }) => (
	<RouteContext.Provider
		value={{
			params: { foo: 'foo' },
			preloaded: { query: vi.fn() },
			search: { bar: 'bar' },
		}}
	>
		{children}
	</RouteContext.Provider>
);

describe('useRouteProps()', () => {
	it('should provide default empty props when called outside of provider', () => {
		const { result } = renderHook(() => useRouteProps());

		expect(result.current).toEqual({
			params: {},
			search: {},
		});
	});

	it('should return expected router object', () => {
		const { result } = renderHook(() => useRouteProps(), {
			wrapper: ContextWrapper,
		});

		expect(result.current).toEqual({
			params: {
				foo: 'foo',
			},
			preloaded: {
				query: expect.any(Function),
			},
			search: {
				bar: 'bar',
			},
		});
	});
});
