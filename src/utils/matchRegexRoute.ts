import { getCanonicalPath } from './getCanonicalPath';

export const matchRegexRoute = <Path extends string>(
  routePath: Path,
  locationPathname: string
): { params: Record<string, string> } | null => {
  const canonicalPathToMatch = getCanonicalPath(locationPathname);

  const parametersKeys: string[] = [];

  const matcherPattern = `^(${routePath
    // Escape all special regex characters
    .replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&')
    // Wildcard matching
    .replace(/\\\*$/, '.*')
    // Match and set keys for named parameters
    .replace(/:(\w+)|(.\*)/g, (_, parameterKey = '$rest') => {
      parametersKeys.push(parameterKey);

      return `([^${parameterKey === '$rest' ? ':*' : '\\/'}]+)`;
    })})\\/?$`;

  const matcher = new RegExp(matcherPattern);
  const match = matcher.exec(canonicalPathToMatch);

  if (!match) return null;

  const parameters = parametersKeys.reduce<Record<string, string>>(
    (collection, parameterKey, index) => {
      const value = match[index + 2];

      // If parameter is already set in collection, keep first value and warn.
      if (collection[parameterKey]) {
        // TODO: Logger.
        // eslint-disable-next-line no-console
        console.warn(
          `Path '${routePath}' had multiple route parameters of same name '${parameterKey}'.`
        );
      } else {
        collection[parameterKey] = decodeURIComponent(value ?? '');
      }

      return collection;
    },
    {}
  );

  return { params: parameters };
};
