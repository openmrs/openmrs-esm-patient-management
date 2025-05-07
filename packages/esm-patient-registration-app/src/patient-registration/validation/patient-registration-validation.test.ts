import dayjs from 'dayjs';
import { getConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig } from '../../config-schema';
import { getValidationSchema } from './patient-registration-validation';

const mockGetConfig = jest.mocked(getConfig);

describe('Patient registration validation', () => {
  beforeEach(() => {
    mockGetConfig.mockResolvedValue({
      fieldConfigurations: {
        gender: [
          {
            label: 'M',
            value: 'male',
          },
          {
            label: 'F',
            value: 'female',
          },
          {
            label: 'O',
            value: 'other',
          },
          {
            label: 'U',
            value: 'unknown',
          },
        ],
      },
    });
  });

  const validFormValues = {
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

  const validateFormValues = async (formValues) => {
    const config = (await getConfig('@openmrs/esm-patient-registration-app')) as unknown as RegistrationConfig;
    const mockT = (key: string, defaultValue: string) => defaultValue;

    const validationSchema = getValidationSchema(config, mockT);
    try {
      await validationSchema.validate(formValues, { abortEarly: false });
    } catch (err) {
      return err;
    }
  };

  it('should allow valid form values', async () => {
    const validationError = await validateFormValues(validFormValues);
    expect(validationError).toBeFalsy();
  });

  it('should require givenName', async () => {
    const invalidFormValues = {
      ...validFormValues,
      givenName: '',
    };
    const validationError = await validateFormValues(invalidFormValues);
    expect(validationError.errors).toContain('Given name is required');
  });

  it('should require familyName', async () => {
    const invalidFormValues = {
      ...validFormValues,
      familyName: '',
    };
    const validationError = await validateFormValues(invalidFormValues);
    expect(validationError.errors).toContain('Family name is required');
  });

  it('should require additionalGivenName when addNameInLocalLanguage is true', async () => {
    const invalidFormValues = {
      ...validFormValues,
      addNameInLocalLanguage: true,
      additionalGivenName: '',
    };
    const validationError = await validateFormValues(invalidFormValues);
    expect(validationError.errors).toContain('Given name is required');
  });

  it('should require additionalFamilyName when addNameInLocalLanguage is true', async () => {
    const invalidFormValues = {
      ...validFormValues,
      addNameInLocalLanguage: true,
      additionalFamilyName: '',
    };
    const validationError = await validateFormValues(invalidFormValues);
    expect(validationError.errors).toContain('Family name is required');
  });

  it('should require gender', async () => {
    const invalidFormValues = {
      ...validFormValues,
      gender: '',
    };
    const validationError = await validateFormValues(invalidFormValues);
    expect(validationError.errors).toContain('Gender unspecified');
  });

  it('should allow female as a valid gender', async () => {
    const validFormValuesWithOtherGender = {
      ...validFormValues,
      gender: 'female',
    };
    const validationError = await validateFormValues(validFormValuesWithOtherGender);
    expect(validationError).toBeFalsy();
  });

  it('should allow other as a valid gender', async () => {
    const validFormValuesWithOtherGender = {
      ...validFormValues,
      gender: 'other',
    };
    const validationError = await validateFormValues(validFormValuesWithOtherGender);
    expect(validationError).toBeFalsy();
  });

  it('should allow unknown as a valid gender', async () => {
    const validFormValuesWithOtherGender = {
      ...validFormValues,
      gender: 'unknown',
    };
    const validationError = await validateFormValues(validFormValuesWithOtherGender);
    expect(validationError).toBeFalsy();
  });

  it('should throw an error when date of birth is a future date', async () => {
    const invalidFormValues = {
      ...validFormValues,
      birthdate: new Date('2100-01-01'),
    };
    const validationError = await validateFormValues(invalidFormValues);
    expect(validationError.errors).toContain('Birthday cannot be in future');
  });

  it('should throw an error when date of birth is more than 140 years ago', async () => {
    const invalidFormValues = {
      ...validFormValues,
      birthdate: dayjs().subtract(141, 'years').toDate(),
    };
    const validationError = await validateFormValues(invalidFormValues);
    expect(validationError.errors).toContain('Birthday cannot be more than 140 years ago');
  });

  it('should require yearsEstimated when birthdateEstimated is true', async () => {
    const invalidFormValues = {
      ...validFormValues,
      birthdateEstimated: true,
    };
    const validationError = await validateFormValues(invalidFormValues);
    expect(validationError.errors).toContain('Estimated years required');
  });

  it('should throw an error when monthEstimated is negative', async () => {
    const invalidFormValues = {
      ...validFormValues,
      birthdateEstimated: true,
      yearsEstimated: 0,
      monthsEstimated: -1,
    };
    const validationError = await validateFormValues(invalidFormValues);
    expect(validationError.errors).toContain('Estimated months cannot be negative');
  });

  it('should throw an error when yearsEstimated is more than 140', async () => {
    const invalidFormValues = {
      ...validFormValues,
      birthdateEstimated: true,
      yearsEstimated: 141,
    };
    const validationError = await validateFormValues(invalidFormValues);
    expect(validationError.errors).toContain('Estimated years cannot be more than 140');
  });

  it('should throw an error when deathDate is in future', async () => {
    const invalidFormValues = {
      ...validFormValues,
      deathDate: new Date('2100-01-01'),
    };
    const validationError = await validateFormValues(invalidFormValues);
    expect(validationError.errors).toContain('Death date cannot be in future');
  });
});
