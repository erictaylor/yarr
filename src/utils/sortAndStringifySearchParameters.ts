/**
 * Sorts an object of string params and returns a query string.
 */
export const sortAndStringifySearchParameters = (
  parameters: Record<string, string[] | string>
): string => {
  const parametersArray: string[] = [];

  for (const parameter in parameters) {
    if (!Object.prototype.hasOwnProperty.call(parameters, parameter)) continue;

    parametersArray.push(parameter);
  }

  return parametersArray
    .sort((firstValue, secondValue) => (firstValue > secondValue ? 1 : -1))
    .reduce((identifier, parameterValue) => {
      const rawValue = parameters[parameterValue];

      if (!rawValue) return identifier;

      const value = Array.isArray(rawValue)
        ? rawValue
            .sort((a, b) => (a > b ? 1 : -1))
            .map((component) => encodeURIComponent(component))
            .join(`&${parameterValue}=`)
        : encodeURIComponent(rawValue);

      return `${identifier}${identifier ? '&' : '?'}${parameterValue}=${value}`;
    }, '');
};
