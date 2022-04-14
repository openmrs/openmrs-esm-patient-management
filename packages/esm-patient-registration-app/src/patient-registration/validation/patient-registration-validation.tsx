import * as Yup from 'yup';

export const validationSchema = Yup.object({
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
  gender: Yup.string().oneOf(['Male', 'Female', 'Other', 'Unknown'], 'genderUnspecified').required('genderRequired'),
  birthdate: Yup.date().when('birthdateEstimated', {
    is: false,
    then: Yup.date().required('birthdayRequired').max(Date(), 'birthdayNotInTheFuture').nullable(),
    otherwise: Yup.date().nullable(),
  }),
  ageEstimate: Yup.number().when('birthdateEstimated', {
    is: true,
    then: Yup.number().required('ageEstimateRequired').min(0, 'negativeYears'),
    otherwise: Yup.number().nullable(),
  }),
  identifiers: Yup.array().of(
    Yup.object().shape({
      identifier: Yup.string().required('identifierRequired'),
    }),
  ),
  yearsEstimated: Yup.number().min(0, 'negativeYears'),
  monthsEstimated: Yup.number().min(0, 'negativeMonths'),
  deathDate: Yup.date().max(Date(), 'deathdayNotInTheFuture').nullable(),
  email: Yup.string().optional().email('invalidEmail'),
});
