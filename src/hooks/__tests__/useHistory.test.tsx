import { renderHook } from '@testing-library/react-hooks';
import type { ReactNode } from 'react';
import { RouterProvider } from '../../components/RouterProvider';
import type { RouterContextProps } from '../../types';
import { useHistory } from '../useHistory';

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <RouterProvider
      router={
        {
          history: {
            action: 'mockHistoryAction',
            listen: 'mockHistoryListen',
            location: 'mockHistoryLocation',
          },
        } as unknown as RouterContextProps
      }
    >
      {children}
    </RouterProvider>
  );
};

describe('useHistory()', () => {
  it('should throw an error when called outside of provider', () => {
    const { result } = renderHook(() => useHistory());

    expect(result.error?.message).toBe(
      '`useHistory` can not be used outside of `RouterProvider`.'
    );
  });

  it('should return expected router object', () => {
    const { result } = renderHook(() => useHistory(), {
      wrapper: ContextWrapper,
    });

    expect(result.current).toEqual({
      action: 'mockHistoryAction',
      listen: 'mockHistoryListen',
      location: 'mockHistoryLocation',
    });
  });
});
