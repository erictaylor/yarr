import { renderHook } from '@testing-library/react-hooks';
import type { ReactNode } from 'react';
import { RouterProvider } from '../../components/RouterProvider';
import type { RouterContextProps } from '../../types';
import { useRouter } from '../useRouter';

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <RouterProvider
      router={
        {
          getCurrentRouteKey: 'mockGetCurrentRouteKey',
          isActive: 'mockIsActive',
          preloadCode: 'mockPreloadCode',
          subscribe: 'mockSubscribe',
          warmRoute: 'mockWarmRoute',
        } as unknown as RouterContextProps
      }
    >
      {children}
    </RouterProvider>
  );
};

describe('useRouter()', () => {
  it('should throw an error when called outside of provider', () => {
    const { result } = renderHook(() => useRouter());

    expect(result.error?.message).toBe(
      '`useRouter` can not be used outside of `RouterProvider`.'
    );
  });

  it('should return expected router object', () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: ContextWrapper,
    });

    expect(result.current).toEqual({
      getCurrentRouteKey: 'mockGetCurrentRouteKey',
      isActive: 'mockIsActive',
      preloadCode: 'mockPreloadCode',
      subscribe: 'mockSubscribe',
      warmRoute: 'mockWarmRoute',
    });
  });
});
