import { getConfig } from '@openmrs/esm-framework';
import { getValidationSchema } from './patient-registration-validation';
import { type RegistrationConfig } from '../../config-schema';

describe('Patient Registration Validation', () => {
  describe('validationSchema', () => {
    const validFormValues = {
      givenName: 'John',
      familyName: 'Doe',
      additionalGivenName: '',
      additionalFamilyName: '',
      gender: 'Male',
      birthdate: new Date('1990-01-01'),
      birthdateEstimated: false,
      deathDate: null,
      email: 'john.doe@example.com',
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
      const config = (await getConfig('@openmrs/esm-patient-registration-app')) as any as RegistrationConfig;
      const validationSchema = getValidationSchema(config);
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
      expect(validationError.errors).toContain('givenNameRequired');
    });

    it('should require familyName', async () => {
      const invalidFormValues = {
        ...validFormValues,
        familyName: '',
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain('familyNameRequired');
    });

    it('should require additionalGivenName when addNameInLocalLanguage is true', async () => {
      const invalidFormValues = {
        ...validFormValues,
        addNameInLocalLanguage: true,
        additionalGivenName: '',
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain('givenNameRequired');
    });

    it('should require additionalFamilyName when addNameInLocalLanguage is true', async () => {
      const invalidFormValues = {
        ...validFormValues,
        addNameInLocalLanguage: true,
        additionalFamilyName: '',
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain('familyNameRequired');
    });

    it('should require gender', async () => {
      const invalidFormValues = {
        ...validFormValues,
        gender: '',
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain('genderUnspecified');
    });

    it('should allow Male as a valid gender', async () => {
      const validFormValuesWithOtherGender = {
        ...validFormValues,
        gender: 'Male',
      };
      const validationError = await validateFormValues(validFormValuesWithOtherGender);
      expect(validationError).toBeFalsy();
    });

    it('should allow Female as a valid gender', async () => {
      const validFormValuesWithOtherGender = {
        ...validFormValues,
        gender: 'Female',
      };
      const validationError = await validateFormValues(validFormValuesWithOtherGender);
      expect(validationError).toBeFalsy();
    });

    it('should throw error when date of birth is a future date', async () => {
      const invalidFormValues = {
        ...validFormValues,
        birthdate: new Date('2100-01-01'),
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain('birthdayNotInTheFuture');
    });

    it('should require yearsEstimated when birthdateEstimated is true', async () => {
      const invalidFormValues = {
        ...validFormValues,
        birthdateEstimated: true,
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain('yearsEstimateRequired');
    });

    it('should throw error when monthEstimated is negative', async () => {
      const invalidFormValues = {
        ...validFormValues,
        birthdateEstimated: true,
        yearsEstimated: 0,
        monthsEstimated: -1,
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain('negativeMonths');
    });

    it('should throw error when deathDate is in future', async () => {
      const invalidFormValues = {
        ...validFormValues,
        deathDate: new Date('2100-01-01'),
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain('deathdayNotInTheFuture');
    });
  });
});
