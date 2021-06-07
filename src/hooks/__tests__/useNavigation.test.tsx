import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { ReactNode } from 'react';
import { RouterProvider } from '../../components/RouterProvider';
import { useNavigation } from '../useNavigation';
import { CreateRouterContext } from '../../types';

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <RouterProvider
      router={
        ({
          history: {
            back: 'mockHistoryBack',
            forward: 'mockHistoryForward',
            go: 'mockHistoryGo',
            push: 'mockHistoryPush',
            replace: 'mockHistoryReplace',
          },
        } as unknown) as CreateRouterContext
      }
    >
      {children}
    </RouterProvider>
  );
};

describe('useNavigation()', () => {
  it('should throw an error when called outside of provider', () => {
    const { result } = renderHook(() => useNavigation());

    expect(result.error?.message).toBe(
      '`useNavigation` can not be used outside of `RouterProvider`.'
    );
  });

  it('should return expected router object', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: ContextWrapper,
    });

    expect(result.current).toEqual({
      back: 'mockHistoryBack',
      forward: 'mockHistoryForward',
      go: 'mockHistoryGo',
      push: 'mockHistoryPush',
      replace: 'mockHistoryReplace',
    });
  });
});
