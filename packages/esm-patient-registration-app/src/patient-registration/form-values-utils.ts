import { isEqual, isPlainObject } from 'lodash-es';

/**
 * Returns the dot path of every leaf in the values. Arrays and plain objects are walked (arrays with numeric
 * indexes); everything else, such as strings, null and Dates, is a leaf, and so is an empty array or object.
 * These are the same leaves Formik marks as touched with `setNestedObjectValues(values, true)`.
 */
export function getLeafPaths(values: object): Array<string> {
  const paths: Array<string> = [];

  const walk = (node: unknown, path: string) => {
    if ((Array.isArray(node) || isPlainObject(node)) && Object.keys(node as object).length > 0) {
      for (const key of Object.keys(node as object)) {
        walk(node[key], path ? `${path}.${key}` : key);
      }
    } else if (path) {
      paths.push(path);
    }
  };

  walk(values, '');
  return paths;
}

/** Returns a copy without the keys whose value is `undefined`. Walks plain objects, not arrays. */
export function removeUndefinedLeaves<T>(values: T): T {
  if (!isPlainObject(values)) {
    return values;
  }

  const result = {};
  for (const [key, value] of Object.entries(values as object)) {
    if (value !== undefined) {
      result[key] = removeUndefinedLeaves(value);
    }
  }
  return result as T;
}

/**
 * Returns a copy of `next` that reuses each object or array of `previous` whose content is equal, so identity changes
 * only along the changed paths (as Formik's values). New plain objects, arrays and Dates are copied, so a later
 * in-place change of `next` does not reach the result.
 */
export function keepUnchangedObjects<T>(previous: unknown, next: T): T {
  if (previous !== undefined && isEqual(previous, next)) {
    return previous as T;
  }
  if (Array.isArray(next)) {
    return next.map((item, index) =>
      keepUnchangedObjects(Array.isArray(previous) ? previous[index] : undefined, item),
    ) as T;
  }
  if (isPlainObject(next)) {
    const result = {};
    for (const [key, value] of Object.entries(next as object)) {
      result[key] = keepUnchangedObjects(isPlainObject(previous) ? previous[key] : undefined, value);
    }
    return result as T;
  }
  if (next instanceof Date) {
    return new Date(next.getTime()) as T;
  }
  return next;
}
