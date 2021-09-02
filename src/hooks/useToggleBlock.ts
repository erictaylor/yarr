import type { Blocker, State } from 'history';
import { useCallback, useContext, useEffect, useRef } from 'react';
import type { RouterContextProps } from '..';
import { RouterContext } from '../context/RouterContext';

interface UseToggleBlockOptions<S extends State> {
  blocker?: Blocker<S>;
  toggle?: boolean;
}

type UseToggleBlockUnblockCallback = () => void;

/**
 * Calls a `blocker` callback if `toggle` is true when one of the following
 * scenarios occurs:
 *
 * 1) A user attempts to navigate away from the web app
 * 2) A user hits the reload button in their browser
 *
 * Please note that any other user interactions that you may want to block if `toggle` is true are
 * the responsibility of the implementation. This only handles browser/history events.
 *
 * NOTE: This does not currently work on mobile devices - we can use the pagehide callback to
 * do something (display confirmation modal, save data for them) BUT you cannot block the close
 * action from happening.
 *
 * A default blocker is provided that calls `window.confirm` when available (i.e. browser only).
 *
 * @see https://github.com/ReactTraining/history/blob/master/docs/blocking-transitions.md
 *
 * @param options.blocker - A function that will be called when the blocker is triggered
 * @param options.toggle - A boolean that will trigger the blocker if true
 *
 * @returns A function that will unblock the blocker
 *
 * @example
 * ```ts
 * const unblock = useToggleBlock({
 *   blocker: ({ retry }) => {
 *     if (window.confirm('Are you sure you want to leave?')) {
 *       unblock();
 *       retry();
 *     }
 *  },
 *  toggle: true,
 * });
 * ```
 */
export const useToggleBlock = <S extends State>({
  blocker,
  toggle = true,
}: UseToggleBlockOptions<S>): UseToggleBlockUnblockCallback => {
  const {
    history: { block },
  } = useContext(RouterContext) as RouterContextProps<S>;

  const unblockRef = useRef<UseToggleBlockUnblockCallback>(() => {});

  const blockerCallback = useCallback<Blocker<S>>(() => {
    if (blocker) return blocker;

    // Default blocker implementation
    const defaultBlocker: Blocker<S> = ({ location, retry }) => {
      const url = location.pathname;

      if (window) {
        if (
          // eslint-disable-next-line no-alert
          window.confirm(`Are you sure you want to go navigate to '${url}'?`)
        ) {
          unblockRef.current();
          retry();
        }
      } else {
        // If not in browser, just unblock
        unblockRef.current();
        retry();
      }
    };

    return defaultBlocker;
  }, [blocker]);

  useEffect(() => {
    if (toggle) {
      unblockRef.current = block(blockerCallback);
    } else {
      unblockRef.current = () => {};
    }

    return () => {
      unblockRef.current();
    };
  }, [block, blockerCallback, toggle]);

  return unblockRef.current;
};
