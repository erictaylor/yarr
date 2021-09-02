import { renderHook } from '@testing-library/react-hooks';
import type { ReactNode } from 'react';
import { RouterProvider } from '../../components/RouterProvider';
import { createMemoryRouter } from '../../utils/createMemoryRouter';
import { useToggleBlock } from '../useToggleBlock';

const router = createMemoryRouter({
  routes: [
    {
      component: () => Promise.resolve(() => <div>Home</div>),
      path: '/',
    },
    {
      component: () => Promise.resolve(() => <div>Test</div>),
      path: '/about',
    },
    {
      component: () => Promise.resolve(() => <div>404</div>),
      path: '/*',
    },
  ],
});

jest.spyOn(router.history, 'block');
jest.spyOn(router.history, 'replace');
jest.spyOn(router.history, 'push');
jest.spyOn(global.window, 'confirm');

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  return <RouterProvider router={router}>{children}</RouterProvider>;
};

describe('useToggleBlock()', () => {
  beforeEach(() => {
    router.history.push('/');
    jest.clearAllMocks();
  });

  it('should not block navigation when `toggle` is false', () => {
    expect(router.history.location.pathname).toBe('/');

    const { result } = renderHook(() => useToggleBlock({ toggle: false }), {
      wrapper: ContextWrapper,
    });

    expect(result.current).toEqual(expect.any(Function));
    expect(router.history.block).not.toHaveBeenCalled();

    router.history.push('/about');

    expect(router.history.location.pathname).toBe('/about');

    result.current();
  });

  it('should block navigation when `toggle` is true', () => {
    expect(router.history.location.pathname).toBe('/');

    const { result } = renderHook(() => useToggleBlock({ toggle: true }), {
      wrapper: ContextWrapper,
    });

    expect(result.current).toEqual(expect.any(Function));
    expect(router.history.block).toHaveBeenCalledTimes(1);
    expect(router.history.block).toHaveBeenCalledWith(expect.any(Function));

    router.history.push('/about');

    expect(router.history.location.pathname).toBe('/');

    result.current();
  });

  it('should use default blocker if no `blocker` is provided', () => {
    expect(router.history.location.pathname).toBe('/');

    const { result } = renderHook(() => useToggleBlock({ toggle: true }), {
      wrapper: ContextWrapper,
    });

    expect(result.current).toEqual(expect.any(Function));
    expect(router.history.block).toHaveBeenCalledTimes(1);
    expect(router.history.block).toHaveBeenCalledWith(expect.any(Function));
    expect(window.confirm).not.toHaveBeenCalled();

    router.history.push('/about');

    setTimeout(() => {
      // Default blocker calls `window.confirm`.
      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to leave this page?'
      );

      expect(router.history.location.pathname).toBe('/');
    }, 100);

    result.current();
  });

  it('should call `blocker` if provided', () => {
    expect(router.history.location.pathname).toBe('/');

    const blockerMock = jest.fn();

    const { result } = renderHook(
      () => useToggleBlock({ blocker: blockerMock, toggle: true }),
      {
        wrapper: ContextWrapper,
      }
    );

    expect(result.current).toEqual(expect.any(Function));
    expect(router.history.block).toHaveBeenCalledTimes(1);
    expect(router.history.block).toHaveBeenCalledWith(expect.any(Function));
    expect(blockerMock).not.toHaveBeenCalled();

    router.history.push('/about');

    setTimeout(() => {
      expect(blockerMock).toHaveBeenCalledTimes(1);
      expect(blockerMock).toHaveBeenCalledWith('replace');

      expect(router.history.location.pathname).toBe('/');
    }, 100);

    result.current();
  });

  it('should call unblock ref on unmount', () => {
    expect(router.history.location.pathname).toBe('/');

    const { result, unmount } = renderHook(() => useToggleBlock(), {
      wrapper: ContextWrapper,
    });

    const unblockSpy = jest.spyOn(result, 'current');

    expect(unblockSpy).toEqual(expect.any(Function));
    expect(unblockSpy).not.toHaveBeenCalled();

    unmount();

    setTimeout(() => {
      expect(unblockSpy).toHaveBeenCalledTimes(1);
    }, 100);

    result.current();
  });
});
