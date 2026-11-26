import { isPlainObject } from 'lodash-es';

/**
 * Copy of Formik's `prepareDataForValidation`: recurses into arrays and plain objects and
 * turns empty strings into `undefined`. Everything else (Dates, null, numbers) is kept as is.
 */
export function emptyStringsToUndefined<T>(values: T): T {
  return convert(values) as T;
}

function convert(values: unknown): unknown {
  const data: any = Array.isArray(values) ? [] : {};

  for (const key of Object.keys(values as object)) {
    const value = (values as any)[key];

    if (Array.isArray(value)) {
      data[key] = value.map((item) =>
        Array.isArray(item) || isPlainObject(item) ? convert(item) : item !== '' ? item : undefined,
      );
    } else if (isPlainObject(value)) {
      data[key] = convert(value);
    } else {
      data[key] = value !== '' ? value : undefined;
    }
  }

  return data;
}
