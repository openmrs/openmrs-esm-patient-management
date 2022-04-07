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
  birthdate: Yup.date().required('birthdayRequired').max(Date(), 'birthdayNotInTheFuture').nullable(),
  ageEstimate: Yup.number().required('ageEstimateRequired').min(0, 'negativeYears').nullable(),
  yearsEstimated: Yup.number().min(0, 'negativeYears'),
  monthsEstimated: Yup.number().min(0, 'negativeMonths'),
  deathDate: Yup.date().max(Date(), 'deathdayNotInTheFuture').nullable(),
  email: Yup.string().optional().email('invalidEmail'),
});
