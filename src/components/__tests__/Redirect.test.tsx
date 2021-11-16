import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RouterContext } from '../../context/RouterContext';
import { createMemoryRouter } from '../../utils/createMemoryRouter';
import { Redirect } from '../Redirect';
import '@testing-library/jest-dom';

const router = createMemoryRouter({
  routes: [
    {
      component: () => Promise.resolve(() => <div>Home</div>),
      path: '/',
    },
    {
      component: () => Promise.resolve(() => <div>About</div>),
      path: 'about',
    },
    {
      component: () => Promise.resolve(() => <div>404</div>),
      path: '*',
    },
  ],
});

jest.spyOn(router, 'isActive');
jest.spyOn(router.history, 'replace');
jest.spyOn(router.history, 'push');

const spyIsActive = router.isActive as unknown as jest.Mock<
  ReturnType<typeof router.isActive>
  >;

const wrapper = ({ children }: { children?: ReactNode }) => (
  <RouterContext.Provider
    value={{
      ...router,
      rendererInitialized: true,
      setRendererInitialized: () => {},
    }}
  >
    {children}
  </RouterContext.Provider>
);

describe('<Redirect />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have a readable name in React components tree', () => {
    expect(Redirect.displayName).toBe('Redirect');
  });

  it('should render nothing', () => {
    render(
      <nav data-testid='navigation'>
        <Redirect
          push
          to={'/nextPath'}
        />
      </nav>,
      { wrapper }
    );

    expect(screen.getByTestId('navigation').children.length).toBe(0);
  });

  it('should do nothing if active path (unnecessary redirect)', () => {
    spyIsActive.mockReturnValue(true);

    render(
      <Redirect
        push
        to={'/nextPath'}
      />,
      { wrapper }
    );

    expect(router.history.push).not.toHaveBeenCalled();
  });

  it('should redirect properly using "push"', () => {
    spyIsActive.mockReturnValue(false);

    render(
      <Redirect
        push
        to={'/nextPath'}
      />,
      { wrapper }
    );

    expect(router.history.push).toHaveBeenCalledWith('/nextPath');
  });

  it('should redirect properly using "replace"', () => {
    spyIsActive.mockReturnValue(false);

    render(
      <Redirect
        push={false}
        to={'/nextPath'}
      />,
      { wrapper }
    );

    expect(router.history.replace).toHaveBeenCalledWith('/nextPath');
  });
});
