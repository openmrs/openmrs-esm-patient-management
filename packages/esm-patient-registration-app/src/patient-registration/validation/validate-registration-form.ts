import { type FormikErrors, getIn, setIn } from 'formik';
import { type z } from 'zod';
import { type FormValues } from '../patient-registration.types';
import { emptyStringsToUndefined } from './empty-strings-to-undefined';
import { SCHEMA_ERROR_KEY_ORDER } from './patient-registration-validation';

/**
 * Runs the registration schema and returns Formik-shaped errors: the first message for each path, with the
 * top-level keys of pattern rule errors first (in rule order), then the schema keys in the old Yup order.
 */
export function validateRegistrationForm(schema: z.ZodType<unknown>, values: FormValues): FormikErrors<FormValues> {
  const result = schema.safeParse(emptyStringsToUndefined(values));
  if (result.success) {
    return {};
  }

  let errors: FormikErrors<FormValues> = {};
  const patternRuleKeys: Array<string> = [];
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (issue.code === 'custom' && issue.params?.patternRule && !patternRuleKeys.includes(String(issue.path[0]))) {
      patternRuleKeys.push(String(issue.path[0]));
    }
    if (!getIn(errors, path)) {
      errors = setIn(errors, path, issue.message);
    }
  }

  const keyOrder = [...patternRuleKeys, ...SCHEMA_ERROR_KEY_ORDER, ...Object.keys(errors)];
  const orderedErrors = {};
  for (const key of keyOrder) {
    if (key in errors && !(key in orderedErrors)) {
      orderedErrors[key] = errors[key];
    }
  }
  return orderedErrors;
}
