import type {
  ComponentPropsWithoutRef,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  Ref,
} from 'react';
import { useContext, forwardRef, useCallback } from 'react';
import { RouterContext } from '../context/RouterContext';
import type { State, To } from '../types';

/**
 * The number representing the primary mouse button in a MouseEvent.button.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button#return_value
 */
const MAIN_MOUSE_BUTTON = 0;

const isModifiedEvent = (event: MouseEvent<HTMLElement>): boolean => {
  return Boolean(
    event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
  );
};

const shouldNavigate = (event: MouseEvent<HTMLAnchorElement>): boolean => {
  return (
    // Default prevented indicates another custom handler has already handled the event.
    !event.defaultPrevented &&
    // We only want to perform an action on primary mouse clicks.
    event.button === MAIN_MOUSE_BUTTON &&
    // Let browser handle links with targets other than _self.
    (!event.currentTarget.target || event.currentTarget.target === '_self') &&
    // Let browser handle new window/tab, download and context menu events.
    !isModifiedEvent(event)
  );
};

export type LinkProps<S extends State = State> = Omit<
  ComponentPropsWithoutRef<'a'>,
  'href'
> & {
  /**
   * The class name to use when the link is active.
   *
   * @default 'is-active'
   */
  activeClassName?: string;
  /**
   * Whether to use an exact check when determining if the link is active.
   */
  exact?: boolean;
  /**
   * A string or partial path object that is the location to navigate to.
   */
  to: To<S>;
};

/**
 * An alternative to react-router's Link component that works with
 * our custom RoutingContext.
 */
export const Link = forwardRef(
  <S extends State>(
    {
      activeClassName = 'is-active',
      children,
      className,
      exact = false,
      to,
      onClick,
      onFocus,
      onKeyDown,
      onMouseDown,
      onMouseEnter,
      ...props
    }: LinkProps<S>,
    ref: Ref<HTMLAnchorElement>
  ) => {
    const { history, isActive, preloadCode, warmRoute } =
      useContext(RouterContext);

    const href: string = typeof to === 'string' ? to : history.createHref(to);

    const toIsActive = isActive(to, exact);

    /**
     * Handles changing the route on user click.
     */
    const handleOnClick = useCallback(
      (event: MouseEvent<HTMLAnchorElement>) => {
        try {
          onClick?.(event);
        } catch (error) {
          event.preventDefault();
          throw error;
        }

        if (shouldNavigate(event)) {
          event.preventDefault();

          const method = isActive(to, true) ? 'replace' : 'push';

          history[method](to);
        }
      },
      [history, isActive, onClick, to]
    );

    /**
     * Callback to preload just the code for the route.
     * We pass this to onFocus, which is a weaker signal
     * that the user _may_ navigate to the route.
     */
    const handleOnFocus = useCallback(
      (event: FocusEvent<HTMLAnchorElement>) => {
        preloadCode(href);

        onFocus?.(event);
      },
      [href, onFocus, preloadCode]
    );

    /**
     * Callback to preload the code and data for the route (warm it).
     * We pass this to onKeyDown, since this is a stronger
     * signal that the user will likely complete the navigation.
     */
    const handleOnKeyDown = useCallback(
      (event: KeyboardEvent<HTMLAnchorElement>) => {
        warmRoute(href);

        onKeyDown?.(event);
      },
      [href, onKeyDown, warmRoute]
    );

    /**
     * Callback to preload just the code for the route.
     * We pass this to onMouseEnter, which is a weaker signal
     * that the user _may_ navigate to the route.
     */
    const handleOnMouseEnter = useCallback(
      (event: MouseEvent<HTMLAnchorElement>) => {
        preloadCode(href);

        onMouseEnter?.(event);
      },
      [href, onMouseEnter, preloadCode]
    );

    /**
     * Callback to preload the code and data for the route (warm it).
     * We pass this to onMouseDown, since this is a stronger
     * signal that the user will likely complete the navigation.
     */
    const handleOnMouseDown = useCallback(
      (event: MouseEvent<HTMLAnchorElement>) => {
        warmRoute(href);

        onMouseDown?.(event);
      },
      [href, onMouseDown, warmRoute]
    );

    return (
      <a
        ref={ref}
        {...props}
        aria-current={toIsActive ? 'page' : undefined}
        className={[className, toIsActive ? activeClassName : null]
          .filter(Boolean)
          .join(' ')}
        href={href}
        onClick={handleOnClick}
        onFocus={handleOnFocus}
        onKeyDown={handleOnKeyDown}
        onMouseDown={handleOnMouseDown}
        onMouseEnter={handleOnMouseEnter}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = 'Link';
