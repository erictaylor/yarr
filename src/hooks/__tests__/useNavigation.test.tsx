import { renderHook } from '@testing-library/react-hooks';
import type { ReactNode } from 'react';
import { RouterProvider } from '../../components/RouterProvider';
import type { RouterContextProps } from '../../types';
import { useNavigation } from '../useNavigation';

const defaultMockHistory = {
  block: 'mockHistoryBlock',
  go: 'mockHistoryGo',
  goBack: 'mockHistoryBack',
  goForward: 'mockHistoryForward',
  push: 'mockHistoryPush',
  replace: 'mockHistoryReplace',
};

const ContextWrapper = ({
  children,
  history = defaultMockHistory,
}: {
  children?: ReactNode;
  history?: unknown;
}) => {
  return (
    <RouterProvider
      router={
        {
          history,
        } as unknown as RouterContextProps
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
      block: 'mockHistoryBlock',
      forward: 'mockHistoryForward',
      go: 'mockHistoryGo',
      push: 'mockHistoryPush',
      replace: 'mockHistoryReplace',
    });
  });

  it('should return memoized function', () => {
    const { result, rerender } = renderHook(() => useNavigation(), {
      wrapper: ContextWrapper,
    });

    const firstResult = result.current;

    rerender();

    expect(firstResult).toEqual(result.current);
  });

  it('should mutate navigation if history object changes', () => {
    const { result, rerender } = renderHook(() => useNavigation(), {
      wrapper: ContextWrapper,
    });

    const firstResult = result.current;

    rerender({
      history: {
        ...defaultMockHistory,
        block: 'foo',
      },
    });

    expect(firstResult).not.toEqual(result.current);
  });
});
