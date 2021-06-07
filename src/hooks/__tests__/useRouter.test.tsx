import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { ReactNode } from 'react';
import { RouterProvider } from '../../components/RouterProvider';
import { useRouter } from '../useRouter';
import { CreateRouterContext } from '../../types';

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <RouterProvider
      router={
        ({
          isActive: 'mockIsActive',
          preloadCode: 'mockPreloadCode',
          warmRoute: 'mockWarmRoute',
        } as unknown) as CreateRouterContext
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
      isActive: 'mockIsActive',
      preloadCode: 'mockPreloadCode',
      warmRoute: 'mockWarmRoute',
    });
  });
});
