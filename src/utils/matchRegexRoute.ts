import { aggregateKeyValues } from './aggregateKeyValues';
import { getCanonicalPath } from './getCanonicalPath';

export const matchRegexRoute = <Path extends string>(
  routePath: Path,
  locationPathname: string
): { params: Record<string, string[] | string> } | null => {
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

      return `([^${parameterKey === '$rest' ? ':(w+)|(.*)' : '\\/'}]+)`;
    })})\\/?$`;

  const matcher = new RegExp(matcherPattern);
  const match = matcher.exec(canonicalPathToMatch);

  if (!match) return null;

  const parameters = parametersKeys.reduce<Record<string, string[] | string>>(
    (collection, parameterKey, index) => {
      const value = match[index + 2];
      const keyValue = aggregateKeyValues(collection, parameterKey, value);

      collection[parameterKey] = keyValue;

      return collection;
    },
    {}
  );

  return { params: parameters };
};
