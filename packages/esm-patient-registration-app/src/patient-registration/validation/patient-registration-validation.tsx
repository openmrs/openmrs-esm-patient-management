import * as Yup from 'yup';
import mapValues from 'lodash/mapValues';
import { type FormValues } from '../patient-registration.types';
import { type RegistrationConfig } from '../../config-schema';

export function getValidationSchema(config: RegistrationConfig) {
  return Yup.object({
    givenName: Yup.string().required('givenNameRequired'),
    familyName: Yup.string().required('familyNameRequired'),
    additionalGivenName: Yup.string().when('addNameInLocalLanguage', {
      is: true,
      then: Yup.string().required('givenNameRequired'),
      otherwise: Yup.string().notRequired(),
    }),
    additionalFamilyName: Yup.string().when('addNameInLocalLanguage', {
      is: true,
      then: Yup.string().required('familyNameRequired'),
      otherwise: Yup.string().notRequired(),
    }),
    gender: Yup.string()
      .oneOf(
        config.fieldConfigurations.gender.map((g) => g.value),
        'genderUnspecified',
      )
      .required('genderRequired'),
    birthdate: Yup.date().when('birthdateEstimated', {
      is: false,
      then: Yup.date().required('birthdayRequired').max(Date(), 'birthdayNotInTheFuture').nullable(),
      otherwise: Yup.date().nullable(),
    }),
    yearsEstimated: Yup.number().when('birthdateEstimated', {
      is: true,
      then: Yup.number().required('yearsEstimateRequired').min(0, 'negativeYears'),
      otherwise: Yup.number().nullable(),
    }),
    monthsEstimated: Yup.number().min(0, 'negativeMonths'),
    deathDate: Yup.date().max(Date(), 'deathdayNotInTheFuture').nullable(),
    email: Yup.string().optional().email('invalidEmail'),
    identifiers: Yup.lazy((obj: FormValues['identifiers']) =>
      Yup.object(
        mapValues(obj, () =>
          Yup.object({
            required: Yup.bool(),
            identifierValue: Yup.string().when('required', {
              is: true,
              then: Yup.string().required('identifierValueRequired'),
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
  });
}
