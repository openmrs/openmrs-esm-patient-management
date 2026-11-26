import dayjs from 'dayjs';
import { z } from 'zod';
import { toPath } from 'lodash-es';
import { type RegistrationConfig } from '../../config-schema';
import { getDatetime } from '../patient-registration.resource';
import { findPatternViolations, type PatternRule } from './pattern-rules';

const deathTimePattern = /^(1[0-2]|0?[1-9]):([0-5]?[0-9])$/;

const isPresentString = (value: unknown) => typeof value === 'string' && value.length > 0;

const optionalString = z.string().nullish();

/**
 * Required checks use `refine` and not `.min(1)` because empty strings reach the schema as `undefined`, and a type
 * error on `undefined` would stop the object-level `superRefine` from running.
 */
const requiredString = (message: string) => optionalString.refine(isPresentString, message);

/** The form can hold numbers as strings (from text inputs). */
const numberFromString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (typeof value === 'string' ? Number(value.trim()) : value), schema);

/** The form can hold dates as ISO strings (from saved patient data). */
const dateFromString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (typeof value === 'string' ? dayjs(value).toDate() : value), schema);

/**
 * Builds the registration form schema. Rules on one field are on the field. Rules that depend on another field
 * are in `superRefine`.
 */
export function getValidationSchema(
  config: RegistrationConfig,
  t: (key: string, defaultValue: string) => string,
  getPatternRules: () => Array<PatternRule> = () => [],
): z.ZodType<unknown> {
  const genderValues = config.fieldConfigurations.gender.map((g) => g.value);
  const givenNameRequired = t('givenNameRequired', 'Given name is required');
  const familyNameRequired = t('familyNameRequired', 'Family name is required');
  const deathDateInFuture = t('deathDateInFuture', 'Death date cannot be in future');
  const allowPreferredSelection = config.fieldConfigurations?.identifier?.allowPreferredSelection;

  const identifierSchema = z
    .object({ identifierValue: optionalString, initialValue: optionalString })
    .passthrough()
    .superRefine(({ required, preferred, autoGeneration, initialValue, identifierValue }, ctx) => {
      // A new auto-generated identifier left empty is generated on save
      const identifierValueRequired =
        (required && !(autoGeneration && !initialValue)) || (allowPreferredSelection && preferred && !autoGeneration);
      if (identifierValueRequired && !isPresentString(identifierValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['identifierValue'],
          message: t('identifierValueRequired', 'Identifier value is required'),
        });
      }
    });

  const relationshipSchema = z
    .object({ relatedPersonUuid: requiredString('Required'), relationshipType: requiredString('Required') })
    .passthrough();

  return z
    .object({
      givenName: requiredString(givenNameRequired),
      familyName: requiredString(familyNameRequired),
      additionalGivenName: optionalString,
      additionalFamilyName: optionalString,
      gender: optionalString
        .refine(isPresentString, t('genderRequired', 'Gender is required'))
        .refine((value) => value == null || genderValues.includes(value), t('genderUnspecified', 'Gender unspecified')),
      birthdate: dateFromString(z.date().nullish()),
      yearsEstimated: numberFromString(z.number().nullish()),
      monthsEstimated: numberFromString(
        z.number().min(0, t('negativeMonths', 'Estimated months cannot be negative')).nullish(),
      ),
      deathDate: dateFromString(z.date().nullish()),
      deathTimeFormat: optionalString.refine(
        (value) => value == null || ['AM', 'PM'].includes(value),
        t('deathTimeFormatInvalid', 'Time format is invalid'),
      ),
      deathTime: z
        .string()
        .regex(deathTimePattern, t('deathTimeInvalid', "Time doesn't match the format 'hh:mm'"))
        .nullish(),
      deathCause: optionalString,
      nonCodedCauseOfDeath: optionalString,
      email: z.string().email(t('invalidEmail', 'Invalid email')).nullish(),
      identifiers: z.record(identifierSchema).nullish(),
      relationships: z.array(relationshipSchema.nullish()).nullish(),
    })
    .passthrough()
    .superRefine((values, ctx) => {
      const addIssue = (field: string, message: string) =>
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
      const now = new Date();
      const { birthdate, yearsEstimated, deathDate, deathTime, deathTimeFormat } = values;
      const isDead = values.isDead === true;

      if (values.addNameInLocalLanguage === true) {
        if (!isPresentString(values.additionalGivenName)) {
          addIssue('additionalGivenName', givenNameRequired);
        }
        if (!isPresentString(values.additionalFamilyName)) {
          addIssue('additionalFamilyName', familyNameRequired);
        }
      }

      if (values.birthdateEstimated === false) {
        if (birthdate == null) {
          addIssue('birthdate', t('birthdayRequired', 'Birthday is required'));
        } else if (birthdate > now) {
          addIssue('birthdate', t('birthdayNotInTheFuture', 'Birthday cannot be in future'));
        } else if (birthdate < dayjs(now).subtract(140, 'years').toDate()) {
          addIssue('birthdate', t('birthdayNotOver140YearsAgo', 'Birthday cannot be more than 140 years ago'));
        }
      }

      if (values.birthdateEstimated === true) {
        if (yearsEstimated == null) {
          addIssue('yearsEstimated', t('yearsEstimateRequired', 'Estimated years required'));
        } else if (yearsEstimated < 0) {
          addIssue('yearsEstimated', t('negativeYears', 'Estimated years cannot be negative'));
        } else if (yearsEstimated > 140) {
          addIssue('yearsEstimated', t('nonsensicalYears', 'Estimated years cannot be more than 140'));
        }
      }

      if (deathDate && deathDate > now) {
        addIssue('deathDate', deathDateInFuture);
      } else if (birthdate && deathDate && dayjs(deathDate).isBefore(birthdate, 'day')) {
        addIssue('deathDate', t('deathdayBeforeBirthday', 'Death date and time cannot be before the birthday'));
      } else if (
        deathDate &&
        deathTime &&
        deathTimeFormat &&
        deathTimePattern.test(deathTime) &&
        !dayjs(getDatetime(deathDate, deathTime, deathTimeFormat as 'AM' | 'PM')).isBefore(dayjs())
      ) {
        addIssue('deathDate', deathDateInFuture);
      } else if (isDead && deathDate == null) {
        addIssue('deathDate', t('deathDateRequired', 'Death date is required'));
      }

      if (isDead) {
        if (!isPresentString(deathTimeFormat)) {
          addIssue('deathTimeFormat', t('deathTimeFormatRequired', 'Time format is required'));
        }
        if (!isPresentString(deathTime)) {
          addIssue('deathTime', t('deathTimeRequired', 'Death time is required'));
        }
        if (!isPresentString(values.deathCause)) {
          addIssue('deathCause', t('deathCauseRequired', 'Cause of death is required'));
        } else if (
          values.deathCause === config.freeTextFieldConceptUuid &&
          !isPresentString(values.nonCodedCauseOfDeath)
        ) {
          addIssue(
            'nonCodedCauseOfDeath',
            t('nonCodedCauseOfDeathRequiredWhenSelected', 'Non-coded cause of death is required'),
          );
        }
      }

      for (const { path, message } of findPatternViolations(values, getPatternRules())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: toPath(path), message });
      }
    });
}
