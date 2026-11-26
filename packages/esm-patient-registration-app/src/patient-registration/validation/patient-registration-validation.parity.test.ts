import { merge } from 'lodash-es';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type RegistrationConfig } from '../../config-schema';
import { type FormValues } from '../patient-registration.types';
import { getValidationSchema } from './patient-registration-validation';
import { type PatternRule } from './pattern-rules';
import { validateRegistrationForm } from './validate-registration-form';

const baseConfig = {
  freeTextFieldConceptUuid: 'free-text-uuid',
  fieldConfigurations: {
    gender: [
      { label: 'M', value: 'male' },
      { label: 'F', value: 'female' },
      { label: 'O', value: 'other' },
      { label: 'U', value: 'unknown' },
    ],
    identifier: { allowPreferredSelection: false },
  },
};

const validValues = {
  additionalFamilyName: '',
  additionalGivenName: '',
  birthdate: new Date('1990-01-01'),
  birthdateEstimated: false,
  isDead: false,
  causeOfDeath: null,
  deathDate: null,
  email: 'john.doe@example.com',
  familyName: 'Doe',
  gender: 'male',
  givenName: 'John',
  identifiers: {
    nationalId: {
      required: true,
      identifierValue: '123456789',
    },
    passportId: {
      required: false,
      identifierValue: '',
    },
  },
};

/** Runs the schema the way the form does and returns the form errors. */
async function errorsFor(
  values: Partial<FormValues> | Record<string, unknown>,
  configOverrides = {},
  patternRules: Array<PatternRule> = [],
) {
  const config = merge({}, baseConfig, configOverrides) as unknown as RegistrationConfig;
  return validateRegistrationForm(
    getValidationSchema(
      config,
      (_key: string, defaultValue: string) => defaultValue,
      () => patternRules,
    ),
    values as FormValues,
  );
}

describe('Patient registration validation parity', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-06-15T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts valid values', async () => {
    expect(await errorsFor({ ...validValues })).toMatchInlineSnapshot(`{}`);
  });

  it('empty form', async () => {
    const values = {
      ...validValues,
      givenName: '',
      familyName: '',
      additionalGivenName: '',
      additionalFamilyName: '',
      email: '',
      birthdate: null,
      identifiers: {},
      gender: '',
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "birthdate": "Birthday is required",
        "familyName": "Family name is required",
        "gender": "Gender is required",
        "givenName": "Given name is required",
      }
    `);
    expect(Object.keys(await errorsFor(values))).toMatchInlineSnapshot(`
      [
        "givenName",
        "familyName",
        "gender",
        "birthdate",
      ]
    `);
  });

  it('requires additional names when local-language names are on', async () => {
    const values = { ...validValues, addNameInLocalLanguage: true, additionalGivenName: '', additionalFamilyName: '' };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "additionalFamilyName": "Family name is required",
        "additionalGivenName": "Given name is required",
      }
    `);
    expect(Object.keys(await errorsFor(values))).toMatchInlineSnapshot(`
      [
        "additionalGivenName",
        "additionalFamilyName",
      ]
    `);
  });

  it('shows "Gender unspecified" when the gender is not in the configured list', async () => {
    expect(await errorsFor({ ...validValues, gender: 'x' })).toMatchInlineSnapshot(`
      {
        "gender": "Gender unspecified",
      }
    `);
  });

  it('shows "Birthday cannot be in future" when the birthdate is in the future', async () => {
    expect(await errorsFor({ ...validValues, birthdate: new Date('2026-06-16') })).toMatchInlineSnapshot(`
      {
        "birthdate": "Birthday cannot be in future",
      }
    `);
  });

  it('shows "Birthday cannot be more than 140 years ago" when the birthdate is over 140 years ago', async () => {
    expect(await errorsFor({ ...validValues, birthdate: new Date('1886-01-01') })).toMatchInlineSnapshot(`
      {
        "birthdate": "Birthday cannot be more than 140 years ago",
      }
    `);
  });

  it('accepts a birthdate as an ISO string', async () => {
    expect(await errorsFor({ ...validValues, birthdate: '1990-01-01' })).toMatchInlineSnapshot(`{}`);
  });

  it('shows "Invalid date" when the birthdate is not a date', async () => {
    expect(await errorsFor({ ...validValues, birthdate: 'abc' })).toMatchInlineSnapshot(`
      {
        "birthdate": "Invalid date",
      }
    `);
  });

  it('accepts estimated years given as a string', async () => {
    const values = {
      ...validValues,
      birthdateEstimated: true,
      birthdate: null,
      yearsEstimated: '5',
      monthsEstimated: '2',
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`{}`);
  });

  it('rejects negative and too large estimates', async () => {
    const negative = { ...validValues, birthdateEstimated: true, yearsEstimated: -1, monthsEstimated: -1 };
    expect(await errorsFor(negative)).toMatchInlineSnapshot(`
      {
        "monthsEstimated": "Estimated months cannot be negative",
        "yearsEstimated": "Estimated years cannot be negative",
      }
    `);
    expect(Object.keys(await errorsFor(negative))).toMatchInlineSnapshot(`
      [
        "monthsEstimated",
        "yearsEstimated",
      ]
    `);
    const tooLarge = { ...validValues, birthdateEstimated: true, yearsEstimated: 141 };
    expect(await errorsFor(tooLarge)).toMatchInlineSnapshot(`
      {
        "yearsEstimated": "Estimated years cannot be more than 140",
      }
    `);
  });

  it('still checks the estimated years and custom fields when the derived birthdate is invalid', async () => {
    // 1000000 estimated years gives a birthdate outside the range of a JavaScript Date
    const values = {
      ...validValues,
      birthdateEstimated: true,
      yearsEstimated: 1000000,
      birthdate: new Date(NaN),
      obs: { weight: 'abc' },
    };
    const weightRule: PatternRule = {
      path: 'obs.weight',
      pattern: '^\\d+$',
      message: 'Weight must be a number',
      onInvalidPattern: 'pass',
    };
    expect(await errorsFor(values, {}, [weightRule])).toMatchInlineSnapshot(`
      {
        "birthdate": "Invalid date",
        "obs": {
          "weight": "Weight must be a number",
        },
        "yearsEstimated": "Estimated years cannot be more than 140",
      }
    `);
  });

  it('shows "Expected number, received nan" when the estimated years are not a number', async () => {
    const values = { ...validValues, birthdateEstimated: true, yearsEstimated: 'abc' };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "yearsEstimated": "Expected number, received nan",
      }
    `);
  });

  it('requires the death fields when the patient is dead', async () => {
    const values = {
      ...validValues,
      isDead: true,
      deathDate: undefined,
      deathTime: undefined,
      deathTimeFormat: undefined,
      deathCause: '',
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "deathCause": "Cause of death is required",
        "deathDate": "Death date is required",
        "deathTime": "Death time is required",
        "deathTimeFormat": "Time format is required",
      }
    `);
    expect(Object.keys(await errorsFor(values))).toMatchInlineSnapshot(`
      [
        "deathDate",
        "deathTimeFormat",
        "deathTime",
        "deathCause",
      ]
    `);
  });

  it('shows "Death date is required" when a dead patient\'s death date is null', async () => {
    const values = {
      ...validValues,
      isDead: true,
      deathDate: null,
      deathTime: '10:00',
      deathTimeFormat: 'AM',
      deathCause: 'c',
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "deathDate": "Death date is required",
      }
    `);
    expect(Object.keys(await errorsFor(values))).toMatchInlineSnapshot(`
      [
        "deathDate",
      ]
    `);
  });

  it('shows "Death date is required" when a dead patient\'s death date is an empty string', async () => {
    const values = {
      ...validValues,
      isDead: true,
      deathDate: '',
      deathTime: '10:00',
      deathTimeFormat: 'AM',
      deathCause: 'c',
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "deathDate": "Death date is required",
      }
    `);
    expect(Object.keys(await errorsFor(values))).toMatchInlineSnapshot(`
      [
        "deathDate",
      ]
    `);
  });

  it('shows "Death date and time cannot be before the birthday" when the death date is before the birthdate', async () => {
    const values = {
      ...validValues,
      isDead: true,
      birthdate: new Date('2000-01-02'),
      deathDate: new Date('2000-01-01'),
      deathTime: '10:00',
      deathTimeFormat: 'AM',
      deathCause: 'c',
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "deathDate": "Death date and time cannot be before the birthday",
      }
    `);
  });

  it('shows "Death date cannot be in future" when the death time is later today', async () => {
    const values = {
      ...validValues,
      isDead: true,
      deathDate: new Date('2026-06-15'),
      deathTime: '11:30',
      deathTimeFormat: 'AM',
      deathCause: 'c',
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "deathDate": "Death date cannot be in future",
      }
    `);
  });

  it('rejects a malformed death time and format', async () => {
    const values = {
      ...validValues,
      isDead: true,
      deathDate: new Date('2026-06-01'),
      deathTime: '25:99',
      deathTimeFormat: 'XX',
      deathCause: 'c',
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "deathTime": "Time doesn't match the format 'hh:mm'",
        "deathTimeFormat": "Time format is invalid",
      }
    `);
    expect(Object.keys(await errorsFor(values))).toMatchInlineSnapshot(`
      [
        "deathTimeFormat",
        "deathTime",
      ]
    `);
  });

  it('checks death values when the patient is not dead', async () => {
    const values = {
      ...validValues,
      isDead: false,
      deathDate: new Date('2026-07-01'),
      deathTime: '25:99',
      deathTimeFormat: 'XX',
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "deathDate": "Death date cannot be in future",
        "deathTime": "Time doesn't match the format 'hh:mm'",
        "deathTimeFormat": "Time format is invalid",
      }
    `);
    expect(Object.keys(await errorsFor(values))).toMatchInlineSnapshot(`
      [
        "deathTimeFormat",
        "deathTime",
        "deathDate",
      ]
    `);
  });

  it('shows "Death date and time cannot be before the birthday" when the patient is not dead and the death date is before the birthdate', async () => {
    const values = {
      ...validValues,
      isDead: false,
      birthdate: new Date('2000-01-02'),
      deathDate: new Date('2000-01-01'),
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "deathDate": "Death date and time cannot be before the birthday",
      }
    `);
  });

  it('shows "Non-coded cause of death is required" when the cause of death is free text and the non-coded cause is empty', async () => {
    const values = {
      ...validValues,
      isDead: true,
      deathDate: new Date('2026-06-01'),
      deathTime: '10:00',
      deathTimeFormat: 'AM',
      deathCause: 'free-text-uuid',
      nonCodedCauseOfDeath: '',
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "nonCodedCauseOfDeath": "Non-coded cause of death is required",
      }
    `);
  });

  it('shows "Invalid email" when the email is not valid', async () => {
    expect(await errorsFor({ ...validValues, email: 'not-an-email' })).toMatchInlineSnapshot(`
      {
        "email": "Invalid email",
      }
    `);
  });

  it('shows "Identifier value is required" when a required identifier is empty', async () => {
    const values = { ...validValues, identifiers: { a: { required: true, identifierValue: '' } } };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "identifiers": {
          "a": {
            "identifierValue": "Identifier value is required",
          },
        },
      }
    `);
  });

  it('allows an empty new auto-generated identifier', async () => {
    const values = {
      ...validValues,
      identifiers: { a: { required: true, autoGeneration: true, initialValue: '', identifierValue: '' } },
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`{}`);
  });

  it('shows "Identifier value is required" when preferred selection is on and the preferred identifier is empty', async () => {
    const values = {
      ...validValues,
      identifiers: { a: { preferred: true, autoGeneration: false, identifierValue: '' } },
    };
    const config = { fieldConfigurations: { identifier: { allowPreferredSelection: true } } };
    expect(await errorsFor(values, config)).toMatchInlineSnapshot(`
      {
        "identifiers": {
          "a": {
            "identifierValue": "Identifier value is required",
          },
        },
      }
    `);
  });

  it('shows "Required" when both relationship fields are empty', async () => {
    const values = { ...validValues, relationships: [{ relatedPersonUuid: '', relationshipType: '' }] };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "relationships": [
          {
            "relatedPersonUuid": "Required",
            "relationshipType": "Required",
          },
        ],
      }
    `);
    expect(Object.keys(await errorsFor(values))).toMatchInlineSnapshot(`
      [
        "relationships",
      ]
    `);
  });

  it('orders keys when many fields fail', async () => {
    const values = {
      ...validValues,
      givenName: '',
      familyName: '',
      addNameInLocalLanguage: true,
      additionalGivenName: '',
      additionalFamilyName: '',
      gender: 'x',
      birthdate: new Date('2026-06-16'),
      monthsEstimated: -1,
      isDead: true,
      deathDate: undefined,
      deathTime: '25:99',
      deathTimeFormat: 'XX',
      deathCause: 'free-text-uuid',
      nonCodedCauseOfDeath: '',
      email: 'x',
      identifiers: { a: { required: true, identifierValue: '' } },
      relationships: [{ relatedPersonUuid: '', relationshipType: '' }],
    };
    expect(await errorsFor(values)).toMatchInlineSnapshot(`
      {
        "additionalFamilyName": "Family name is required",
        "additionalGivenName": "Given name is required",
        "birthdate": "Birthday cannot be in future",
        "deathDate": "Death date is required",
        "deathTime": "Time doesn't match the format 'hh:mm'",
        "deathTimeFormat": "Time format is invalid",
        "email": "Invalid email",
        "familyName": "Family name is required",
        "gender": "Gender unspecified",
        "givenName": "Given name is required",
        "identifiers": {
          "a": {
            "identifierValue": "Identifier value is required",
          },
        },
        "monthsEstimated": "Estimated months cannot be negative",
        "nonCodedCauseOfDeath": "Non-coded cause of death is required",
        "relationships": [
          {
            "relatedPersonUuid": "Required",
            "relationshipType": "Required",
          },
        ],
      }
    `);
    expect(Object.keys(await errorsFor(values))).toMatchInlineSnapshot(`
      [
        "givenName",
        "familyName",
        "gender",
        "monthsEstimated",
        "deathTimeFormat",
        "deathTime",
        "email",
        "identifiers",
        "relationships",
        "additionalGivenName",
        "additionalFamilyName",
        "birthdate",
        "deathDate",
        "nonCodedCauseOfDeath",
      ]
    `);
  });
});
