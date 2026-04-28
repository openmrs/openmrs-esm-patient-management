import dayjs from 'dayjs';
import { getConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig } from '../../config-schema';
import { type AddressTemplate } from '../patient-registration.types';
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

  const validateFormValues = async (formValues, addressTemplate: AddressTemplate | null = null) => {
    const config = (await getConfig('@openmrs/esm-patient-registration-app')) as unknown as RegistrationConfig;
    const mockT = (key: string, defaultValue: string) => defaultValue;

    const validationSchema = getValidationSchema(config, mockT, addressTemplate);
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

  describe('Address validation from template', () => {
    const mockAddressTemplate = {
      displayName: null,
      codeName: 'default',
      country: null,
      lines: null,
      lineByLineFormat: null,
      nameMappings: {
        cityVillage: 'City/Village',
      },
      sizeMappings: null,
      elementDefaults: null,
      elementRegex: {
        cityVillage: '^[A-Z]{3}$',
      },
      elementRegexFormats: {
        cityVillage: 'City must be exactly 3 uppercase letters',
      },
      requiredElements: ['cityVillage'],
    } as unknown as AddressTemplate;

    it('should validate address using elementRegex from the template', async () => {
      const validFormValuesWithAddress = {
        ...validFormValues,
        address: {
          cityVillage: 'ABC',
        },
      };

      const validationError = await validateFormValues(validFormValuesWithAddress, mockAddressTemplate);
      expect(validationError).toBeFalsy();
    });

    it('should reject address values that do not match elementRegex', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          cityVillage: 'Abc',
        },
      };

      const validationError = await validateFormValues(invalidFormValues, mockAddressTemplate);
      expect(validationError.errors).toContain('City must be exactly 3 uppercase letters');
    });

    it('should enforce requiredElements from the template', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          cityVillage: '',
        },
      };

      const validationError = await validateFormValues(invalidFormValues, mockAddressTemplate);
      expect(validationError.errors).toContain('This field is required');
    });

    it('should skip address validation when addressTemplate is null', async () => {
      const formValuesWithAddress = {
        ...validFormValues,
        address: {
          cityVillage: '12345!@#',
        },
      };

      const validationError = await validateFormValues(formValuesWithAddress, null);
      expect(validationError).toBeFalsy();
    });

    it('should accept any string for fields without elementRegex', async () => {
      const templateWithoutRegex = {
        ...mockAddressTemplate,
        nameMappings: {
          cityVillage: 'City/Village',
          stateProvince: 'State/Province',
        },
        elementRegex: {},
        requiredElements: [],
      } as unknown as AddressTemplate;

      const formValuesWithAddress = {
        ...validFormValues,
        address: {
          cityVillage: 'anything 123 !@#',
          stateProvince: '99999',
        },
      };

      const validationError = await validateFormValues(formValuesWithAddress, templateWithoutRegex);
      expect(validationError).toBeFalsy();
    });

    it('should use default error message when elementRegexFormats is not provided', async () => {
      const templateWithRegexNoFormat = {
        ...mockAddressTemplate,
        elementRegex: {
          cityVillage: '^[A-Z]+$',
        },
        elementRegexFormats: {},
      } as unknown as AddressTemplate;

      const invalidFormValues = {
        ...validFormValues,
        address: {
          cityVillage: 'abc',
        },
      };

      const validationError = await validateFormValues(invalidFormValues, templateWithRegexNoFormat);
      expect(validationError.errors).toContain('Invalid format');
    });

    it('should allow empty value for optional field even when elementRegex is defined', async () => {
      const templateWithOptionalRegexField = {
        ...mockAddressTemplate,
        requiredElements: [],
      } as unknown as AddressTemplate;

      const validationError = await validateFormValues(
        { ...validFormValues, address: { cityVillage: '' } },
        templateWithOptionalRegexField,
      );
      expect(validationError).toBeFalsy();
    });

    it('should not crash form when addressTemplate contains an invalid regex', async () => {
      const templateWithBadRegex = {
        ...mockAddressTemplate,
        elementRegex: { cityVillage: '[invalid regex(' },
      } as unknown as AddressTemplate;

      // Should not throw, form should still work
      const validationError = await validateFormValues(
        { ...validFormValues, address: { cityVillage: 'ABC' } },
        templateWithBadRegex,
      );
      expect(validationError).toBeFalsy();
    });
  });
});
