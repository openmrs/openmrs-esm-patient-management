import { type FormikErrors, getIn, setIn } from 'formik';
import { type z } from 'zod';
import { type FormValues } from '../patient-registration.types';
import { emptyStringsToUndefined } from './empty-strings-to-undefined';

/** Runs the registration schema and returns Formik-shaped errors: the first message for each path. */
export function validateRegistrationForm(schema: z.ZodType<unknown>, values: FormValues): FormikErrors<FormValues> {
  const result = schema.safeParse(emptyStringsToUndefined(values));
  if (result.success) {
    return {};
  }

  let errors: FormikErrors<FormValues> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!getIn(errors, path)) {
      errors = setIn(errors, path, issue.message);
    }
  }
  return errors;
}
