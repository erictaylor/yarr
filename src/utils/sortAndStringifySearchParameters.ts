/**
 * Sorts an object of string params and returns a query string.
 */
export const sortAndStringifySearchParameters = (
  parameters: Record<string, string[] | string>
): string => {
  const parametersArray = [];

  for (const parameter in parameters) {
    if (!Object.prototype.hasOwnProperty.call(parameters, parameter)) continue;

    parametersArray.push({
      index: parametersArray.length,
      value: parameter.toLowerCase(),
    });
  }

  return parametersArray
    .sort(({ value: firstValue }, { value: secondValue }) =>
      firstValue > secondValue ? 1 : -1
    )
    .reduce((identifier, element) => {
      const rawValue = parameters[element.value];
      const value = Array.isArray(rawValue)
        ? rawValue.sort((a, b) => (a > b ? 1 : -1)).join(',')
        : rawValue;

      return `${identifier}${identifier ? '&' : '?'}${element.value}=${value}`;
    }, '');
};
