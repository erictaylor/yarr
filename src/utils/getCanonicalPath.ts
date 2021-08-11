/**
 * Add leading slash to path when not already present
 */
export const getCanonicalPath = (path: string): string => {
  return path.startsWith('/') ? path : `/${path}`;
};
