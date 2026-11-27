import { zodResolver } from '@hookform/resolvers/zod';
import { type Resolver } from 'react-hook-form';
import { type z } from 'zod';
import { type FormValues } from './patient-registration.types';
import { emptyStringsToUndefined } from './validation/empty-strings-to-undefined';

/**
 * Validates the form values with the registration schema, after turning empty strings into `undefined`
 * (as Formik did). On success it returns the original values, so empty strings still reach `onSubmit`.
 */
export function createRegistrationResolver(schema: z.ZodType<unknown>): Resolver<FormValues> {
  const resolve = zodResolver(schema, undefined, { raw: true });

  return async (values, context, options) => {
    const result = await resolve(emptyStringsToUndefined(values), context, options);
    return Object.keys(result.errors).length === 0 ? { values, errors: {} } : result;
  };
}
