import {
  type FormValues,
  type NameProperty,
  type NameTemplate,
  nameProperties,
} from '../../patient-registration.types';

/**
 * The given and family names are required by the backend, so they are always shown and required, even when a name
 * template leaves them out or marks them optional.
 */
export const alwaysRequiredNameFields: Array<NameProperty> = ['givenName', 'familyName'];

/** The name parts a name template shows, in order. Parts it does not know are skipped. */
export function getNameTemplateFieldNames(nameTemplate: NameTemplate): Array<NameProperty> {
  const names: Array<NameProperty> = [];
  nameTemplate.lines
    ?.flat()
    .filter(({ isToken }) => isToken === 'IS_NAME_TOKEN')
    .forEach(({ codeName }) => {
      const name = codeName as NameProperty;
      if (nameProperties.includes(name) && !names.includes(name)) {
        names.push(name);
      }
    });
  return [...names, ...alwaysRequiredNameFields.filter((name) => !names.includes(name))];
}

/**
 * Adds the name template's fields to the form's initial values, so they survive the form being reinitialised as
 * patient data loads, and Formik validates them on submit. A field without a value starts empty, or with the
 * template's default when `applyDefaults` is set, which is only the case for a new, identified patient.
 */
export function withNameTemplateFields(
  values: FormValues,
  nameTemplate: NameTemplate | undefined,
  { applyDefaults }: { applyDefaults: boolean },
): FormValues {
  if (!nameTemplate?.lines) {
    return values;
  }

  const templateValues: Partial<FormValues> = {};
  getNameTemplateFieldNames(nameTemplate).forEach((name) => {
    const defaultValue = applyDefaults ? nameTemplate.elementDefaults?.[name] : undefined;
    if (!values[name] && defaultValue) {
      templateValues[name] = defaultValue;
    } else if (values[name] === undefined) {
      templateValues[name] = '';
    }
  });
  return { ...values, ...templateValues };
}
