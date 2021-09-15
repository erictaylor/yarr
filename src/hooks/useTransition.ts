/**
 * IMPORTANT!
 *
 * This is a shim for React v18's useTransition hook.
 * If the consumer is using a version of React with the useTransition hook,
 * we will use the built in hook, otherwise we will use the shim.
 *
 * The behavior of yarr is different depending on whether the consumer is using.
 *
 * When using the official hook from React, yarr will continue rendering the previous route
 * if the new route has suspended (because of preload data). When using the shim, yarr will
 * not be able to keep the previous route rendered when the new route suspenses awaiting data,
 * instead you will render the parent suspense boundary, which _can_ lead to awkward UX.
 */
import React, { useCallback } from 'react';

// @ts-expect-error - useTransition is only available in React v18, which is not yet released.
const { useTransition: builtInAPI } = React;

let didWarnOfShimUsage = false;

type TransitionFunction = () => void;

const useTransitionShim = (): [
  isPending: boolean,
  startTransition: (callback: TransitionFunction) => void
] => {
  if (process.env['NODE_ENV'] !== 'production' && !didWarnOfShimUsage) {
    didWarnOfShimUsage = true;
    // eslint-disable-next-line no-console
    console.warn(
      'You are using a version of React without useTransition support.' +
        'While yarr will still work, yarr will not be able to keep' +
        'new routes with preloaded data that causes suspension from transitioning' +
        'until the data has loaded.'
    );
  }

  const startTransition = useCallback(
    (transitionFunction: TransitionFunction) => {
      transitionFunction();
    },
    []
  );

  return [false, startTransition];
};

/**
 * 🚨 DO NOT EXPORT THIS HOOK. 🚨
 * This hook is only intended to be used internally by the RouteRenderer component.
 */
export const useTransition =
  builtInAPI === undefined ? useTransitionShim : builtInAPI;
