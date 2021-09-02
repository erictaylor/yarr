import { renderHook } from '@testing-library/react-hooks';
import type { ReactNode } from 'react';
import { RouterProvider } from '../../components/RouterProvider';
import type { RouterContextProps } from '../../types';
import { useNavigation } from '../useNavigation';

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <RouterProvider
      router={
        {
          history: {
            back: 'mockHistoryBack',
            block: 'mockHistoryBlock',
            forward: 'mockHistoryForward',
            go: 'mockHistoryGo',
            push: 'mockHistoryPush',
            replace: 'mockHistoryReplace',
          },
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
});
