import { get, set } from 'lodash-es';
import { type z } from 'zod';
import { type FormValues } from '../patient-registration.types';
import { emptyStringsToUndefined } from './empty-strings-to-undefined';

/** Runs the registration schema and returns Formik-shaped errors: the first message for each path. */
export function validateRegistrationForm(schema: z.ZodType<unknown>, values: FormValues): Record<string, any> {
  const result = schema.safeParse(emptyStringsToUndefined(values));
  if (result.success) {
    return {};
  }

  const errors: Record<string, any> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!get(errors, path)) {
      set(errors, path, issue.message);
    }
  }
  return errors;
}
