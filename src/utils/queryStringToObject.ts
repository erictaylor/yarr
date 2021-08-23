import { aggregateKeyValues } from './aggregateKeyValues';

/**
 * Transform a string of parameters to an object
 */
export const queryStringToObject = (
  search: string
): Record<string, string[] | string> => {
  if (!search) return {};

  // TODO: Should we just use URLSearchParams here?

  const parametersString = search.slice(1).split('&');

  return parametersString.reduce((parameters, current) => {
    const [key, value] = current.split('=');

    if (key) {
      const keyValue = aggregateKeyValues(parameters, key, value);

      return {
        ...parameters,
        [key]: keyValue,
      };
    }

    return parameters;
  }, {});
};
