/**
 * Given an object check if specified property is already defined
 * and eventually combines all property values in an single array
 */
export const aggregateKeyValues = <
  List extends Record<string, string[] | string>
>(
  list: List,
  key: string,
  value = ''
): string[] | string => {
  const decodedValue = decodeURIComponent(value);

  const keyValue = list[key];

  return keyValue
    ? Array.isArray(keyValue)
      ? keyValue.concat(decodedValue)
      : [keyValue, decodedValue]
    : decodedValue;
};
