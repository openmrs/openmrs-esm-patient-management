import { describe, expect, it } from 'vitest';
import { createRegistrationResolver } from './registration-resolver';
import { getValidationSchema } from './validation/patient-registration-validation';
import { validateRegistrationForm } from './validation/validate-registration-form';
import type { ResolverOptions } from 'react-hook-form';
import type { RegistrationConfig } from '../config-schema';
import type { FormValues } from './patient-registration.types';

const config = {
  freeTextFieldConceptUuid: 'free-text-uuid',
  fieldConfigurations: {
    gender: [
      { label: 'M', value: 'male' },
      { label: 'F', value: 'female' },
    ],
    identifier: { allowPreferredSelection: false },
  },
} as unknown as RegistrationConfig;

const schema = getValidationSchema(config, (_key: string, defaultValue: string) => defaultValue);
const options = {
  criteriaMode: 'firstError',
  fields: {},
  shouldUseNativeValidation: false,
} as ResolverOptions<FormValues>;

/** Maps each error path to its message, for Formik errors (strings) and React Hook Form errors ({ message }). */
function flatten(errors: object, prefix = ''): Record<string, string> {
  return Object.entries(errors).reduce((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      return { ...acc, [path]: value };
    }
    if (typeof value?.message === 'string') {
      return { ...acc, [path]: value.message };
    }
    return { ...acc, ...flatten(value, path) };
  }, {});
}

describe('createRegistrationResolver', () => {
  it('passes the original values, with empty strings, to onSubmit', async () => {
    const values = {
      middleName: '',
      address: { city: '' },
      additionalGivenName: '',
      additionalFamilyName: '',
      birthdate: new Date('1990-01-01'),
      birthdateEstimated: false,
      isDead: false,
      causeOfDeath: null,
      deathDate: null,
      email: 'john.doe@example.com',
      familyName: 'Doe',
      gender: 'male',
      givenName: 'John',
      identifiers: {},
    } as unknown as FormValues;

    const result = await createRegistrationResolver(schema)(values, undefined, options);

    expect(result.errors).toEqual({});
    expect(result.values).toBe(values);
  });

  it('returns the same messages as validateRegistrationForm', async () => {
    const values = {
      givenName: '',
      familyName: '',
      additionalGivenName: '',
      additionalFamilyName: '',
      email: '',
      birthdate: null,
      birthdateEstimated: false,
      isDead: false,
      causeOfDeath: null,
      deathDate: null,
      identifiers: {},
      gender: '',
    } as unknown as FormValues;

    const expected = flatten(validateRegistrationForm(schema, values));
    const result = await createRegistrationResolver(schema)(values, undefined, options);

    expect(Object.keys(expected).length).toBeGreaterThan(0);
    expect(flatten(result.errors)).toEqual(expected);
  });

  it('returns the same nested messages as validateRegistrationForm', async () => {
    const patternRules = [
      {
        path: 'identifiers.idCard.identifierValue',
        pattern: '^\\d+$',
        message: 'Only digits',
        onInvalidPattern: 'pass' as const,
      },
    ];
    const schemaWithRules = getValidationSchema(
      config,
      (_key: string, defaultValue: string) => defaultValue,
      () => patternRules,
    );
    const values = {
      givenName: 'John',
      familyName: 'Doe',
      gender: 'male',
      birthdate: new Date('1990-01-01'),
      birthdateEstimated: false,
      isDead: false,
      identifiers: {
        openMrsId: { identifierValue: '', initialValue: '', required: true, autoGeneration: false },
        idCard: { identifierValue: 'abc', initialValue: '', required: false, autoGeneration: false },
      },
      relationships: [{ relatedPersonUuid: '', relationshipType: 'parent-uuid' }],
    } as unknown as FormValues;

    const expected = flatten(validateRegistrationForm(schemaWithRules, values));
    const result = await createRegistrationResolver(schemaWithRules)(values, undefined, options);

    expect(expected).toEqual({
      'identifiers.idCard.identifierValue': 'Only digits',
      'identifiers.openMrsId.identifierValue': 'Identifier value is required',
      'relationships.0.relatedPersonUuid': 'Required',
    });
    expect(flatten(result.errors)).toEqual(expected);
  });
});
