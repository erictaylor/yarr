/* eslint-disable react/forbid-component-props */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createRef } from 'react';
import { RouterContext } from '../../context/RouterContext';
import { createMemoryRouter } from '../../utils/createMemoryRouter';
import { Link } from '../Link';
import '@testing-library/jest-dom';

const router = createMemoryRouter({
  routes: [
    {
      component: () => Promise.resolve(() => <div>Home</div>),
      path: '/',
    },
    {
      component: () => Promise.resolve(() => <div>Test</div>),
      path: 'about',
    },
    {
      component: () => Promise.resolve(() => <div>404</div>),
      path: '*',
    },
  ],
});

jest.spyOn(router, 'isActive');
jest.spyOn(router, 'preloadCode');
jest.spyOn(router, 'warmRoute');
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

describe('<Link />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders', () => {
    it('should render a link with expected href and content', () => {
      render(<Link to="/about">To about</Link>, { wrapper });

      const link = screen.getByRole('link', { name: /to about/i });

      expect(link).toHaveTextContent('To about');
      expect(link).toHaveAttribute('href', '/about');
      expect(link).not.toHaveClass();
    });

    it('should render a link with expected href from to object', () => {
      render(
        <Link
          to={{
            hash: 'missingHash',
            pathname: '/about',
            search: 'doesNotStartWithQuestionMark=test',
          }}
        >
          To about
        </Link>,
        { wrapper }
      );

      const link = screen.getByRole('link', { name: /to about/i });

      expect(link).toHaveTextContent('To about');
      expect(link).toHaveAttribute(
        'href',
        '/about?doesNotStartWithQuestionMark=test#missingHash'
      );
    });

    it('should correctly forward ref', () => {
      const ref = createRef<HTMLAnchorElement>();
      render(
        <Link ref={ref} to="/about">
          To about
        </Link>,
        { wrapper }
      );

      expect(ref.current).toBeDefined();
      expect(ref.current).toHaveTextContent('To about');
      expect(ref.current).toHaveAttribute('href', '/about');
    });

    it('should correctly set anchor attributes based on props', () => {
      render(
        <Link className="test" rel="noopener" target="_blank" to="/about">
          To about
        </Link>,
        { wrapper }
      );

      const link = screen.getByRole('link', { name: /to about/i });

      expect(link).toHaveAttribute('class', 'test');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('should not have `is-active` class and no aria-current when not isActive', () => {
      spyIsActive.mockReturnValue(false);

      render(<Link to="/about">To about</Link>, { wrapper });

      const link = screen.getByRole('link', { name: /to about/i });

      expect(spyIsActive).toHaveBeenCalledTimes(1);
      expect(spyIsActive).toHaveBeenCalledWith('/about', false);

      expect(link).not.toHaveClass();
      expect(link).not.toHaveAttribute('aria-current');
    });

    it('should correctly set is-active class and aria-current when isActive', () => {
      spyIsActive.mockReturnValue(true);

      render(<Link to="/about">To about</Link>, { wrapper });

      const link = screen.getByRole('link', { name: /to about/i });

      expect(spyIsActive).toHaveBeenCalledTimes(1);
      expect(spyIsActive).toHaveBeenCalledWith('/about', false);

      expect(link).toHaveClass('is-active');
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('should combine passed classNames with `is-active` when isActive', () => {
      spyIsActive.mockReturnValue(true);

      render(
        <Link className="test" to="/about">
          To about
        </Link>,
        { wrapper }
      );

      const link = screen.getByRole('link', { name: /to about/i });

      expect(link).toHaveClass('test is-active');
    });

    it('should change active class name when `activeClassName` is passed and isActive', () => {
      spyIsActive.mockReturnValue(true);

      render(
        <Link activeClassName="is-current" to="/about">
          To about
        </Link>,
        { wrapper }
      );

      const link = screen.getByRole('link', { name: /to about/i });

      expect(link).toHaveClass('is-current');
    });
  });

  describe('event handling', () => {
    describe('handleClick', () => {
      beforeAll(() => {
        spyIsActive.mockReset();
      });

      it('should call history.push and onClick prop when provided', () => {
        const mockOnClick = jest.fn();

        render(
          <Link onClick={mockOnClick} to="/about">
            To about
          </Link>,
          { wrapper }
        );

        const link = screen.getByRole('link', { name: /to about/i });

        expect(mockOnClick).not.toHaveBeenCalled();

        fireEvent.click(link);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
        expect(mockOnClick).toHaveBeenCalledWith(expect.any(Object));

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).toHaveBeenCalledTimes(1);
        expect(router.history.push).toHaveBeenCalledWith('/about');
      });

      it('should pass link state to history push/replace when link is clicked and has state', () => {
        spyIsActive.mockClear();
        const mockOnClick = jest.fn();

        render(
          <Link
            onClick={mockOnClick}
            to={{ pathname: '/anywhere', state: { foo: 'bar' } }}
          >
            To anywhere
          </Link>,
          { wrapper }
        );

        const link = screen.getByRole('link', { name: /to anywhere/i });

        expect(mockOnClick).not.toHaveBeenCalled();

        fireEvent.click(link);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
        expect(mockOnClick).toHaveBeenCalledWith(expect.any(Object));

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).toHaveBeenCalledTimes(1);
        expect(router.history.push).toHaveBeenCalledWith({
          pathname: '/anywhere',
          state: { foo: 'bar' },
        });
      });

      it('should not not call history push or restore when onClick prop prevents default', () => {
        const mockOnClick = jest.fn((event) => {
          event.preventDefault();
        });

        render(
          <Link onClick={mockOnClick} to="/about">
            To about
          </Link>,
          { wrapper }
        );

        const link = screen.getByRole('link', { name: /to about/i });

        expect(mockOnClick).not.toHaveBeenCalled();

        fireEvent.click(link);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
        expect(mockOnClick).toHaveBeenCalledWith(expect.any(Object));

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).not.toHaveBeenCalled();
      });

      it('should not call history push or restore when secondary clicking', () => {
        render(<Link to="/about">To about</Link>, { wrapper });

        const link = screen.getByRole('link', { name: /to about/i });

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).not.toHaveBeenCalled();

        fireEvent.click(link, { button: 2 });

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).not.toHaveBeenCalled();
      });

      it('should call history push or restore when target is `_self`', () => {
        render(
          <Link target="_self" to="/about">
            To about
          </Link>,
          { wrapper }
        );

        const link = screen.getByRole('link', { name: /to about/i });

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).not.toHaveBeenCalled();

        fireEvent.click(link);

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).toHaveBeenCalledTimes(1);
        expect(router.history.push).toHaveBeenCalledWith('/about');
      });

      it('should not call history push or replace when target is not `_self`', () => {
        render(<Link to="/about">To about</Link>, { wrapper });

        const link = screen.getByRole('link', { name: /to about/i });

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).not.toHaveBeenCalled();

        fireEvent.click(link, { target: { target: '_blank' } });
        fireEvent.click(link, { target: { target: '_parent' } });
        fireEvent.click(link, { target: { target: '_top' } });

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).not.toHaveBeenCalled();
      });

      it('should not call history push or replace on "modified" click event', () => {
        render(<Link to="/about">To about</Link>, { wrapper });

        const link = screen.getByRole('link', { name: /to about/i });

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).not.toHaveBeenCalled();

        fireEvent.click(link, { metaKey: true });
        fireEvent.click(link, { altKey: true });
        fireEvent.click(link, { ctrlKey: true });
        fireEvent.click(link, { shiftKey: true });

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).not.toHaveBeenCalled();
      });

      it('should call history replace and not push when clicked link is active', () => {
        // Needed twice since it's called one in render and once in click handler.
        spyIsActive.mockReturnValue(true).mockReturnValue(true);

        render(<Link to="/about">To about</Link>, { wrapper });

        const link = screen.getByRole('link', { name: /to about/i });

        expect(router.history.replace).not.toHaveBeenCalled();
        expect(router.history.push).not.toHaveBeenCalled();

        fireEvent.click(link);

        expect(router.history.replace).toHaveBeenCalledTimes(1);
        expect(router.history.replace).toHaveBeenCalledWith('/about');
        expect(router.history.push).not.toHaveBeenCalled();
      });

      afterAll(() => {
        spyIsActive.mockRestore();
      });
    });

    describe('preload events - handleOnFocus and handleOnMouseEnter', () => {
      it('should call preloadCode on focus event', () => {
        const mockOnFocus = jest.fn();

        render(
          <Link onFocus={mockOnFocus} to="/about">
            To about
          </Link>,
          { wrapper }
        );

        const link = screen.getByRole('link', { name: /to about/i });

        expect(router.preloadCode).not.toHaveBeenCalled();
        expect(mockOnFocus).not.toHaveBeenCalled();

        fireEvent.focus(link);

        expect(router.preloadCode).toHaveBeenCalledTimes(1);
        expect(router.preloadCode).toHaveBeenCalledWith('/about');
        expect(mockOnFocus).toHaveBeenCalledTimes(1);
        expect(mockOnFocus).toHaveBeenCalledWith(expect.any(Object));
      });

      it('should call preloadCode on mouse enter event', () => {
        const mockOnMouseEnter = jest.fn();

        render(
          <Link onMouseEnter={mockOnMouseEnter} to="/about">
            To about
          </Link>,
          { wrapper }
        );

        const link = screen.getByRole('link', { name: /to about/i });

        expect(router.preloadCode).not.toHaveBeenCalled();
        expect(mockOnMouseEnter).not.toHaveBeenCalled();

        fireEvent.mouseEnter(link);

        expect(router.preloadCode).toHaveBeenCalledTimes(1);
        expect(router.preloadCode).toHaveBeenCalledWith('/about');
        expect(mockOnMouseEnter).toHaveBeenCalledTimes(1);
        expect(mockOnMouseEnter).toHaveBeenCalledWith(expect.any(Object));
      });
    });

    describe('warmRoute events - handleKeyDown and handleMouseDown', () => {
      it('should call warmRoute on keyDown event', () => {
        const mockOnKeyDown = jest.fn();

        render(
          <Link onKeyDown={mockOnKeyDown} to="/about">
            To about
          </Link>,
          { wrapper }
        );

        const link = screen.getByRole('link', { name: /to about/i });

        expect(router.warmRoute).not.toHaveBeenCalled();
        expect(mockOnKeyDown).not.toHaveBeenCalled();

        fireEvent.keyDown(link);

        expect(router.warmRoute).toHaveBeenCalledTimes(1);
        expect(router.warmRoute).toHaveBeenCalledWith('/about');
        expect(mockOnKeyDown).toHaveBeenCalledTimes(1);
        expect(mockOnKeyDown).toHaveBeenCalledWith(expect.any(Object));
      });

      it('should call warmRoute on mouseDown event', () => {
        const mockOnMouseDown = jest.fn();

        render(
          <Link onMouseDown={mockOnMouseDown} to="/about">
            To about
          </Link>,
          { wrapper }
        );

        const link = screen.getByRole('link', { name: /to about/i });

        expect(router.warmRoute).not.toHaveBeenCalled();
        expect(mockOnMouseDown).not.toHaveBeenCalled();

        fireEvent.mouseDown(link);

        expect(router.warmRoute).toHaveBeenCalledTimes(1);
        expect(router.warmRoute).toHaveBeenCalledWith('/about');
        expect(mockOnMouseDown).toHaveBeenCalledTimes(1);
        expect(mockOnMouseDown).toHaveBeenCalledWith(expect.any(Object));
      });
    });
  });
});
