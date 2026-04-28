import dayjs from 'dayjs';
import * as Yup from 'yup';
import mapValues from 'lodash/mapValues';
import { type RegistrationConfig } from '../../config-schema';
import { type AddressTemplate, type FormValues } from '../patient-registration.types';
import { getDatetime } from '../patient-registration.resource';

function getTemplateDrivenAddressValidationSchema(
  addressTemplate: AddressTemplate | null,
  t: (key: string, defaultValue: string) => string,
) {
  if (!addressTemplate) return Yup.object().optional();

  const shapeEntries: Record<string, Yup.StringSchema> = {};
  const fieldNames = Object.keys(addressTemplate.nameMappings ?? {});
  const requiredElements = (addressTemplate.requiredElements ?? []) as Array<string>;

  for (const fieldName of fieldNames) {
    let fieldSchema = Yup.string();
    const regex = addressTemplate.elementRegex?.[fieldName];
    const regexFormat = addressTemplate.elementRegexFormats?.[fieldName];
    const isRequired = requiredElements.includes(fieldName);

    if (regex) {
      try {
        const compiledRegex = new RegExp(regex);
        fieldSchema = fieldSchema.matches(compiledRegex, {
          message: regexFormat || t('invalidFormat', 'Invalid format'),
          excludeEmptyString: true,
        });
      } catch {
        // If the regex from the address template is invalid/malformed,
        // skip regex-based validation for this field to avoid crashing the form
        console.warn(`Invalid regex pattern for address field "${fieldName}": ${regex}`);
      }
    }

    if (isRequired) {
      fieldSchema = fieldSchema.required(t('requiredField', 'This field is required'));
    } else {
      fieldSchema = fieldSchema.optional();
    }

    shapeEntries[fieldName] = fieldSchema;
  }

  return Yup.object(shapeEntries).optional();
}

export function getValidationSchema(
  config: RegistrationConfig,
  t: (key: string, defaultValue: string) => string,
  addressTemplate: AddressTemplate | null,
) {
  const addressValidationSchema = getTemplateDrivenAddressValidationSchema(addressTemplate, t);
  return Yup.object({
    givenName: Yup.string().required(t('givenNameRequired', 'Given name is required')),
    familyName: Yup.string().required(t('familyNameRequired', 'Family name is required')),
    additionalGivenName: Yup.string().when('addNameInLocalLanguage', {
      is: true,
      then: Yup.string().required(t('givenNameRequired', 'Given name is required')),
      otherwise: Yup.string().notRequired(),
    }),
    additionalFamilyName: Yup.string().when('addNameInLocalLanguage', {
      is: true,
      then: Yup.string().required(t('familyNameRequired', 'Family name is required')),
      otherwise: Yup.string().notRequired(),
    }),
    gender: Yup.string()
      .oneOf(
        config.fieldConfigurations.gender.map((g) => g.value),
        t('genderUnspecified', 'Gender unspecified'),
      )
      .required(t('genderRequired', 'Gender is required')),
    birthdate: Yup.date().when('birthdateEstimated', {
      is: false,
      then: Yup.date()
        .required(t('birthdayRequired', 'Birthday is required'))
        .max(Date(), t('birthdayNotInTheFuture', 'Birthday cannot be in future'))
        .min(
          dayjs().subtract(140, 'years').toDate(),
          t('birthdayNotOver140YearsAgo', 'Birthday cannot be more than 140 years ago'),
        )
        .nullable(),
      otherwise: Yup.date().nullable(),
    }),
    yearsEstimated: Yup.number().when('birthdateEstimated', {
      is: true,
      then: Yup.number()
        .required(t('yearsEstimateRequired', 'Estimated years required'))
        .min(0, t('negativeYears', 'Estimated years cannot be negative'))
        .max(140, t('nonsensicalYears', 'Estimated years cannot be more than 140')),
      otherwise: Yup.number().nullable(),
    }),
    monthsEstimated: Yup.number().min(0, t('negativeMonths', 'Estimated months cannot be negative')),
    isDead: Yup.boolean(),
    deathDate: Yup.date()
      .when('isDead', {
        is: true,
        then: Yup.date().required(t('deathDateRequired', 'Death date is required')),
        otherwise: Yup.date().nullable(),
      })
      .max(new Date(), t('deathDateInFuture', 'Death date cannot be in future'))
      .test(
        'deathDate-after-birthdate',
        t('deathdayBeforeBirthday', 'Death date and time cannot be before the birthday'),
        function (value) {
          const { birthdate } = this.parent;
          if (birthdate && value) {
            return dayjs(value).isAfter(birthdate);
          }
          return true;
        },
      )
      .test('deathDate-before-today', t('deathDateInFuture', 'Death date cannot be in future'), function (value) {
        const { deathTime, deathTimeFormat } = this.parent;
        if (value && deathTime && deathTimeFormat && /^(1[0-2]|0?[1-9]):([0-5]?[0-9])$/.test(deathTime)) {
          return dayjs(getDatetime(value, deathTime, deathTimeFormat)).isBefore(dayjs());
        }
        return true;
      }),
    deathTime: Yup.string()
      .when('isDead', {
        is: true,
        then: Yup.string().required(t('deathTimeRequired', 'Death time is required')),
        otherwise: Yup.string().nullable(),
      })
      .matches(/^(1[0-2]|0?[1-9]):([0-5]?[0-9])$/, t('deathTimeInvalid', "Time doesn't match the format 'hh:mm'")),

    deathTimeFormat: Yup.string()
      .when('isDead', {
        is: true,
        then: Yup.string().required(t('deathTimeFormatRequired', 'Time format is required')),
        otherwise: Yup.string().nullable(),
      })
      .oneOf(['AM', 'PM'], t('deathTimeFormatInvalid', 'Time format is invalid')),

    deathCause: Yup.string().when('isDead', {
      is: true,
      then: Yup.string().required(t('deathCauseRequired', 'Cause of death is required')),
      otherwise: Yup.string().nullable(),
    }),
    nonCodedCauseOfDeath: Yup.string().when(['isDead', 'deathCause'], {
      is: (isDead, deathCause) => isDead && deathCause === config.freeTextFieldConceptUuid,
      then: Yup.string().required(
        t('nonCodedCauseOfDeathRequiredWhenSelected', 'Non-coded cause of death is required'),
      ),
      otherwise: Yup.string().nullable(),
    }),
    email: Yup.string().optional().email(t('invalidEmail', 'Invalid email')),
    identifiers: Yup.lazy((obj: FormValues['identifiers']) =>
      Yup.object(
        mapValues(obj, () =>
          Yup.object({
            required: Yup.bool(),
            identifierValue: Yup.string().when('required', {
              is: true,
              then: Yup.string().required(t('identifierValueRequired', 'Identifier value is required')),
              otherwise: Yup.string().notRequired(),
            }),
          }),
        ),
      ),
    ),
    relationships: Yup.array().of(
      Yup.object().shape({
        relatedPersonUuid: Yup.string().required(),
        relationshipType: Yup.string().required(),
      }),
    ),
    address: addressValidationSchema ?? Yup.object().optional(),
  });
}
