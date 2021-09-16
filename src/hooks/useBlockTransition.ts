import { useCallback, useContext, useEffect } from 'react';
import type { RouterContextProps } from '..';
import { RouterContext } from '../context/RouterContext';
import type { Update } from '../types';

const DEFAULT_PROMPT_MESSAGE = 'Are you sure you want to leave without saving?';

interface UseBlockTransitionOptions {
  message?: string;
  toggle?: boolean | ((update?: Update) => boolean);
  unload?: boolean;
}

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
 * @param options - Options for the useBlockTransition hook
 * @param options.message - Message string to display in the blocker (ie window.confirm).
 * @param options.toggle - A boolean or function that returns a boolean that will trigger the blocker if true. Default: `false`
 * @param options.unload - A boolean that will trigger the blocker on 'beforeunload' if true. Default: `true`
 */
export const useBlockTransition = ({
  message = DEFAULT_PROMPT_MESSAGE,
  toggle,
  unload = true,
}: UseBlockTransitionOptions = {}): void => {
  const {
    history: { block },
  } = useContext(RouterContext) as RouterContextProps;

  const resolvePrompt = useCallback(
    (update?: Update) =>
      typeof toggle === 'function' ? toggle(update) : toggle,
    [toggle]
  );

  /**
   * This implementation is contingent on history@^4 being used.
   * In the event of us upgrading to v5/beyond, this implementation will
   * likely break. - @lmulvey
   *
   * See: https://github.com/ReactTraining/history/blob/v4/docs/Blocking.md [v4 signature]
   * See: https://github.com/ReactTraining/history/blob/master/docs/blocking-transitions.md [v5 transition]
   */
  const handleHistoryBlock = useCallback(
    (location, action) => {
      const shouldShowPrompt = resolvePrompt({ action, location });
      if (shouldShowPrompt) {
        // show a browser prompt and warn the user of unsaved changes
        return message;
      }

      // returning undefined allows history to continue as it should
      return undefined;
    },
    [resolvePrompt, message]
  );

  // handles browserunload events
  const handleUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      const shouldShowPrompt = resolvePrompt();

      if (shouldShowPrompt) {
        event.preventDefault();
        const returnValue = event.defaultPrevented
          ? undefined
          : event.returnValue;
        event.returnValue = returnValue;

        return event.returnValue;
      }

      return true;
    },
    [resolvePrompt]
  );

  useEffect(() => {
    const unblock = block(handleHistoryBlock);

    if (window && unload) {
      window.addEventListener('beforeunload', handleUnload);
    }

    return () => {
      if (window && unload) {
        window.removeEventListener('beforeunload', handleUnload);
      }

      // ensure the block is cleared
      unblock();
    };
  }, [block, handleUnload, handleHistoryBlock, unload]);
};
