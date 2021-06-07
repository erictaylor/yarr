import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { ReactNode } from 'react';
import { RouterProvider } from '../../components/RouterProvider';
import { useHistory } from '../useHistory';
import { CreateRouterContext } from '../../types';

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <RouterProvider
      router={
        ({
          history: {
            action: 'mockHistoryAction',
            location: 'mockHistoryLocation',
          },
        } as unknown) as CreateRouterContext
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
      location: 'mockHistoryLocation',
    });
  });
});
