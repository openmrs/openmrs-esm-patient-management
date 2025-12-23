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

  describe('Address validation', () => {
    it('should allow valid address with all fields filled', async () => {
      const validFormValuesWithAddress = {
        ...validFormValues,
        address: {
          cityVillage: 'New York',
          stateProvince: 'New York',
          country: 'United States',
          postalCode: '10001',
          address1: '123 Main Street',
          address2: 'Apt 4B',
          countyDistrict: 'Manhattan',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithAddress);
      expect(validationError).toBeFalsy();
    });

    it('should allow empty address fields since they are optional', async () => {
      const validFormValuesWithEmptyAddress = {
        ...validFormValues,
        address: {
          cityVillage: '',
          stateProvince: '',
          country: '',
          postalCode: '',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithEmptyAddress);
      expect(validationError).toBeFalsy();
    });

    it('should allow undefined address object', async () => {
      const validFormValuesWithUndefinedAddress = {
        ...validFormValues,
        address: undefined,
      };
      const validationError = await validateFormValues(validFormValuesWithUndefinedAddress);
      expect(validationError).toBeFalsy();
    });

    // City/Village validation tests
    it('should reject numeric-only city/village', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          cityVillage: '12345',
        },
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain(
        'City/Village should only contain letters, spaces, hyphens, and apostrophes',
      );
    });

    it('should reject city/village with special characters', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          cityVillage: 'New York#$',
        },
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain(
        'City/Village should only contain letters, spaces, hyphens, and apostrophes',
      );
    });

    it('should allow city/village with hyphens', async () => {
      const validFormValuesWithHyphenatedCity = {
        ...validFormValues,
        address: {
          cityVillage: 'Saint-Denis',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithHyphenatedCity);
      expect(validationError).toBeFalsy();
    });

    it('should allow city/village with apostrophes', async () => {
      const validFormValuesWithApostrophe = {
        ...validFormValues,
        address: {
          cityVillage: "O'Fallon",
        },
      };
      const validationError = await validateFormValues(validFormValuesWithApostrophe);
      expect(validationError).toBeFalsy();
    });

    it('should allow city/village with periods', async () => {
      const validFormValuesWithPeriod = {
        ...validFormValues,
        address: {
          cityVillage: 'St. Louis',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithPeriod);
      expect(validationError).toBeFalsy();
    });

    it('should allow city/village with international characters', async () => {
      const validFormValuesWithInternationalChars = {
        ...validFormValues,
        address: {
          cityVillage: 'São Paulo',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithInternationalChars);
      expect(validationError).toBeFalsy();
    });

    // State/Province validation tests
    it('should reject numeric-only state/province', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          stateProvince: '12345',
        },
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain(
        'State/Province should only contain letters, spaces, hyphens, and apostrophes',
      );
    });

    it('should reject state/province with special characters', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          stateProvince: 'California@#',
        },
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain(
        'State/Province should only contain letters, spaces, hyphens, and apostrophes',
      );
    });

    it('should allow valid state/province with spaces', async () => {
      const validFormValuesWithState = {
        ...validFormValues,
        address: {
          stateProvince: 'New York',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithState);
      expect(validationError).toBeFalsy();
    });

    it('should allow state/province with hyphens', async () => {
      const validFormValuesWithHyphenatedState = {
        ...validFormValues,
        address: {
          stateProvince: 'Nouvelle-Aquitaine',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithHyphenatedState);
      expect(validationError).toBeFalsy();
    });

    it('should allow state/province with international characters', async () => {
      const validFormValuesWithInternationalState = {
        ...validFormValues,
        address: {
          stateProvince: 'São Paulo',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithInternationalState);
      expect(validationError).toBeFalsy();
    });

    // Country validation tests
    it('should reject numeric-only country', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          country: '12345',
        },
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain('Country should only contain letters, spaces, hyphens, and apostrophes');
    });

    it('should reject country with special characters', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          country: 'USA#$%',
        },
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain('Country should only contain letters, spaces, hyphens, and apostrophes');
    });

    it('should allow valid country names', async () => {
      const validFormValuesWithCountry = {
        ...validFormValues,
        address: {
          country: 'United States',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithCountry);
      expect(validationError).toBeFalsy();
    });

    it('should allow country with hyphens', async () => {
      const validFormValuesWithHyphenatedCountry = {
        ...validFormValues,
        address: {
          country: 'Guinea-Bissau',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithHyphenatedCountry);
      expect(validationError).toBeFalsy();
    });

    // Postal Code validation tests
    it('should allow numeric postal codes', async () => {
      const validFormValuesWithNumericPostalCode = {
        ...validFormValues,
        address: {
          postalCode: '12345',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithNumericPostalCode);
      expect(validationError).toBeFalsy();
    });

    it('should allow alphanumeric postal codes (UK format)', async () => {
      const validFormValuesWithUKPostalCode = {
        ...validFormValues,
        address: {
          postalCode: 'SW1A 1AA',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithUKPostalCode);
      expect(validationError).toBeFalsy();
    });

    it('should allow alphanumeric postal codes (Canadian format)', async () => {
      const validFormValuesWithCanadianPostalCode = {
        ...validFormValues,
        address: {
          postalCode: 'K1A 0B1',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithCanadianPostalCode);
      expect(validationError).toBeFalsy();
    });

    it('should allow postal codes with hyphens (US ZIP+4)', async () => {
      const validFormValuesWithZipPlus4 = {
        ...validFormValues,
        address: {
          postalCode: '12345-6789',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithZipPlus4);
      expect(validationError).toBeFalsy();
    });

    it('should reject postal codes with special characters', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          postalCode: '503144ferge#$',
        },
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain(
        'Postal code should only contain letters, numbers, spaces, and hyphens (e.g., 12345, SW1A 1AA, K1A 0B1)',
      );
    });

    // County/District validation tests
    it('should reject numeric-only county/district', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          countyDistrict: '12345',
        },
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain(
        'County/District should only contain letters, spaces, hyphens, and apostrophes',
      );
    });

    it('should reject county/district with special characters', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          countyDistrict: 'District#$',
        },
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain(
        'County/District should only contain letters, spaces, hyphens, and apostrophes',
      );
    });

    it('should allow valid county/district', async () => {
      const validFormValuesWithCounty = {
        ...validFormValues,
        address: {
          countyDistrict: 'Los Angeles County',
        },
      };
      const validationError = await validateFormValues(validFormValuesWithCounty);
      expect(validationError).toBeFalsy();
    });

    // Combined validation tests
    it('should reject multiple invalid address fields and return all errors', async () => {
      const invalidFormValues = {
        ...validFormValues,
        address: {
          cityVillage: '12345',
          stateProvince: '67890',
          country: 'USA#$',
          postalCode: '503144ferge#$',
        },
      };
      const validationError = await validateFormValues(invalidFormValues);
      expect(validationError.errors).toContain(
        'City/Village should only contain letters, spaces, hyphens, and apostrophes',
      );
      expect(validationError.errors).toContain(
        'State/Province should only contain letters, spaces, hyphens, and apostrophes',
      );
      expect(validationError.errors).toContain('Country should only contain letters, spaces, hyphens, and apostrophes');
      expect(validationError.errors).toContain(
        'Postal code should only contain letters, numbers, spaces, and hyphens (e.g., 12345, SW1A 1AA, K1A 0B1)',
      );
    });
  });
});
