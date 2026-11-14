import { describe, expect, it } from 'vitest';
import { type FormValues, type NameTemplate } from '../../patient-registration.types';
import { withNameTemplateFields } from './name-template';

const nameTemplate: NameTemplate = {
  displayName: 'Test',
  codeName: 'test',
  country: null,
  lineByLineFormat: null,
  nameMappings: null,
  sizeMappings: null,
  elementRegex: null,
  elementRegexFormats: null,
  requiredElements: null,
  lines: [
    [{ isToken: 'IS_NAME_TOKEN', displayText: 'Given', codeName: 'givenName' }],
    [{ isToken: 'IS_NAME_TOKEN', displayText: 'Middle', codeName: 'middleName' }],
    [{ isToken: 'IS_NAME_TOKEN', displayText: 'Family', codeName: 'familyName' }],
    [{ isToken: 'IS_NAME_TOKEN', displayText: 'Second family name', codeName: 'familyName2' }],
    [{ isToken: 'IS_NAME_TOKEN', displayText: 'Degree', codeName: 'degree' }],
  ],
  elementDefaults: { familyName2: 'Default', middleName: 'Default' },
};

const values = { givenName: '', middleName: '', familyName: '' } as FormValues;

describe('withNameTemplateFields', () => {
  it('starts each template field empty, so Formik validates it on submit', () => {
    const result = withNameTemplateFields(values, { ...nameTemplate, elementDefaults: null }, { applyDefaults: true });

    expect(result).toEqual({ givenName: '', middleName: '', familyName: '', familyName2: '', degree: '' });
  });

  it('fills empty fields with the template defaults for a new, identified patient', () => {
    const result = withNameTemplateFields({ ...values, middleName: 'Existing' }, nameTemplate, {
      applyDefaults: true,
    });

    expect(result.familyName2).toBe('Default');
    // A value that is already there is kept
    expect(result.middleName).toBe('Existing');
  });

  it('does not apply defaults when they are not wanted, such as in edit mode or for an unknown patient', () => {
    const result = withNameTemplateFields({ ...values, degree: 'MD' }, nameTemplate, { applyDefaults: false });

    expect(result.familyName2).toBe('');
    expect(result.middleName).toBe('');
    expect(result.degree).toBe('MD');
  });

  it('returns the values unchanged without a template', () => {
    expect(withNameTemplateFields(values, undefined, { applyDefaults: true })).toBe(values);
  });
});
