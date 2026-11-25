import dayjs from 'dayjs';
import { z } from 'zod';
import { toPath } from 'lodash-es';
import { type RegistrationConfig } from '../../config-schema';
import { getDatetime } from '../patient-registration.resource';
import { findPatternViolations, type PatternRule } from './pattern-rules';

/** Top-level error keys in the order the Yup schema reported them. */
export const SCHEMA_ERROR_KEY_ORDER = [
  'givenName',
  'familyName',
  'additionalGivenName',
  'additionalFamilyName',
  'gender',
  'birthdate',
  'yearsEstimated',
  'monthsEstimated',
  'deathDate',
  'deathTimeFormat',
  'deathTime',
  'deathCause',
  'nonCodedCauseOfDeath',
  'email',
  'identifiers',
  'relationships',
] as const;

const deathTimePattern = /^(1[0-2]|0?[1-9]):([0-5]?[0-9])$/;

const optionalString = z.string().optional().nullable();

/**
 * Builds the registration form schema. The base object accepts every empty state, because a Zod type error
 * would skip the `superRefine` that holds the rules. The rules copy the old Yup schema: the same messages, the
 * same paths, Yup's casts of strings to numbers and dates, and Yup's type error texts.
 */
export function getValidationSchema(
  config: RegistrationConfig,
  t: (key: string, defaultValue: string) => string,
  getPatternRules: () => Array<PatternRule> = () => [],
): z.ZodType<unknown> {
  const messages = {
    givenNameRequired: t('givenNameRequired', 'Given name is required'),
    familyNameRequired: t('familyNameRequired', 'Family name is required'),
    genderUnspecified: t('genderUnspecified', 'Gender unspecified'),
    genderRequired: t('genderRequired', 'Gender is required'),
    birthdayRequired: t('birthdayRequired', 'Birthday is required'),
    birthdayNotInTheFuture: t('birthdayNotInTheFuture', 'Birthday cannot be in future'),
    birthdayNotOver140YearsAgo: t('birthdayNotOver140YearsAgo', 'Birthday cannot be more than 140 years ago'),
    yearsEstimateRequired: t('yearsEstimateRequired', 'Estimated years required'),
    negativeYears: t('negativeYears', 'Estimated years cannot be negative'),
    nonsensicalYears: t('nonsensicalYears', 'Estimated years cannot be more than 140'),
    negativeMonths: t('negativeMonths', 'Estimated months cannot be negative'),
    deathDateRequired: t('deathDateRequired', 'Death date is required'),
    deathDateInFuture: t('deathDateInFuture', 'Death date cannot be in future'),
    deathdayBeforeBirthday: t('deathdayBeforeBirthday', 'Death date and time cannot be before the birthday'),
    deathTimeRequired: t('deathTimeRequired', 'Death time is required'),
    deathTimeInvalid: t('deathTimeInvalid', "Time doesn't match the format 'hh:mm'"),
    deathTimeFormatRequired: t('deathTimeFormatRequired', 'Time format is required'),
    deathTimeFormatInvalid: t('deathTimeFormatInvalid', 'Time format is invalid'),
    deathCauseRequired: t('deathCauseRequired', 'Cause of death is required'),
    nonCodedCauseOfDeathRequired: t('nonCodedCauseOfDeathRequiredWhenSelected', 'Non-coded cause of death is required'),
    identifierValueRequired: t('identifierValueRequired', 'Identifier value is required'),
  };
  const genderValues = config.fieldConfigurations.gender.map((g) => g.value);

  return z
    .object({
      givenName: optionalString,
      familyName: optionalString,
      additionalGivenName: optionalString,
      additionalFamilyName: optionalString,
      gender: optionalString,
      birthdate: z.unknown(),
      yearsEstimated: z.unknown(),
      monthsEstimated: z.unknown(),
      deathDate: z.unknown(),
      deathTime: optionalString,
      deathTimeFormat: optionalString,
      deathCause: optionalString,
      nonCodedCauseOfDeath: optionalString,
      email: z.string().email(t('invalidEmail', 'Invalid email')).optional().nullable(),
      identifiers: z
        .record(z.object({ identifierValue: optionalString, initialValue: optionalString }).passthrough())
        .optional()
        .nullable(),
      relationships: z
        .array(
          z
            .object({ relatedPersonUuid: optionalString, relationshipType: optionalString })
            .passthrough()
            .optional()
            .nullable(),
        )
        .optional()
        .nullable(),
    })
    .passthrough()
    .superRefine((values, ctx) => {
      const now = new Date();
      const addIssue = (path: Array<string | number>, message: string) =>
        ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

      /** Yup's type check. Returns false (and adds Yup's type error) when the value has the wrong type. */
      const checkType = (
        path: Array<string | number>,
        type: 'string' | 'number' | 'date',
        value: unknown,
        originalValue: unknown,
        nullable: boolean,
      ) => {
        if (value === undefined || (nullable && value === null) || isOfType(type, value)) {
          return true;
        }
        addIssue(path, typeErrorText(pathText(path), type, value, originalValue));
        return false;
      };

      const checkRequiredString = (field: string, nullable: boolean, required: boolean, message: string) => {
        const value = values[field];
        if (checkType([field], 'string', value, value, nullable) && required && !isPresentString(value)) {
          addIssue([field], message);
        }
      };

      const isDead = values.isDead === true;

      checkRequiredString('givenName', false, true, messages.givenNameRequired);
      checkRequiredString('familyName', false, true, messages.familyNameRequired);
      const addNameInLocalLanguage = values.addNameInLocalLanguage === true;
      checkRequiredString('additionalGivenName', false, addNameInLocalLanguage, messages.givenNameRequired);
      checkRequiredString('additionalFamilyName', false, addNameInLocalLanguage, messages.familyNameRequired);

      if (checkType(['gender'], 'string', values.gender, values.gender, false)) {
        if (values.gender !== undefined && !genderValues.includes(values.gender)) {
          addIssue(['gender'], messages.genderUnspecified);
        } else if (!isPresentString(values.gender)) {
          addIssue(['gender'], messages.genderRequired);
        }
      }

      const birthdate = castDate(values.birthdate, true);
      if (checkType(['birthdate'], 'date', birthdate, values.birthdate, true) && values.birthdateEstimated === false) {
        if (birthdate == null) {
          addIssue(['birthdate'], messages.birthdayRequired);
        } else if (birthdate > now) {
          addIssue(['birthdate'], messages.birthdayNotInTheFuture);
        } else if (birthdate < dayjs(now).subtract(140, 'years').toDate()) {
          addIssue(['birthdate'], messages.birthdayNotOver140YearsAgo);
        }
      }

      const birthdateEstimated = values.birthdateEstimated === true;
      const yearsEstimated = castNumber(values.yearsEstimated, !birthdateEstimated);
      if (
        checkType(['yearsEstimated'], 'number', yearsEstimated, values.yearsEstimated, !birthdateEstimated) &&
        birthdateEstimated
      ) {
        if (yearsEstimated == null) {
          addIssue(['yearsEstimated'], messages.yearsEstimateRequired);
        } else if (yearsEstimated < 0) {
          addIssue(['yearsEstimated'], messages.negativeYears);
        } else if (yearsEstimated > 140) {
          addIssue(['yearsEstimated'], messages.nonsensicalYears);
        }
      }

      const monthsEstimated = castNumber(values.monthsEstimated, false);
      if (
        checkType(['monthsEstimated'], 'number', monthsEstimated, values.monthsEstimated, false) &&
        monthsEstimated != null &&
        monthsEstimated < 0
      ) {
        addIssue(['monthsEstimated'], messages.negativeMonths);
      }

      const deathDate = castDate(values.deathDate, !isDead);
      const deathTime = values.deathTime;
      const deathTimeFormat = values.deathTimeFormat;
      if (checkType(['deathDate'], 'date', deathDate, values.deathDate, !isDead)) {
        if (deathDate != null && deathDate > now) {
          addIssue(['deathDate'], messages.deathDateInFuture);
        } else if (birthdate && deathDate && dayjs(deathDate).isBefore(birthdate, 'day')) {
          addIssue(['deathDate'], messages.deathdayBeforeBirthday);
        } else if (
          deathDate &&
          deathTime &&
          deathTimeFormat &&
          deathTimePattern.test(deathTime) &&
          !dayjs(getDatetime(deathDate, deathTime, deathTimeFormat as 'AM' | 'PM')).isBefore(dayjs())
        ) {
          addIssue(['deathDate'], messages.deathDateInFuture);
        } else if (isDead && deathDate == null) {
          addIssue(['deathDate'], messages.deathDateRequired);
        }
      }

      if (checkType(['deathTimeFormat'], 'string', deathTimeFormat, deathTimeFormat, !isDead)) {
        if (deathTimeFormat !== undefined && !['AM', 'PM'].includes(deathTimeFormat)) {
          addIssue(['deathTimeFormat'], messages.deathTimeFormatInvalid);
        } else if (isDead && !isPresentString(deathTimeFormat)) {
          addIssue(['deathTimeFormat'], messages.deathTimeFormatRequired);
        }
      }

      if (checkType(['deathTime'], 'string', deathTime, deathTime, !isDead)) {
        if (deathTime != null && !deathTimePattern.test(deathTime)) {
          addIssue(['deathTime'], messages.deathTimeInvalid);
        } else if (isDead && !isPresentString(deathTime)) {
          addIssue(['deathTime'], messages.deathTimeRequired);
        }
      }

      checkRequiredString('deathCause', !isDead, isDead, messages.deathCauseRequired);
      const nonCodedCauseRequired = Boolean(values.isDead && values.deathCause === config.freeTextFieldConceptUuid);
      checkRequiredString(
        'nonCodedCauseOfDeath',
        !nonCodedCauseRequired,
        nonCodedCauseRequired,
        messages.nonCodedCauseOfDeathRequired,
      );

      checkType(['email'], 'string', values.email, values.email, false);

      for (const [key, identifier] of Object.entries(values.identifiers ?? {})) {
        const { required, preferred, autoGeneration, initialValue, identifierValue } = identifier;
        // A new auto-generated identifier left empty is generated on save
        const identifierValueRequired =
          (required && !(autoGeneration && !initialValue)) ||
          (config.fieldConfigurations?.identifier?.allowPreferredSelection && preferred && !autoGeneration);
        checkType(['identifiers', key, 'initialValue'], 'string', initialValue, initialValue, false);
        const path = ['identifiers', key, 'identifierValue'];
        if (
          checkType(path, 'string', identifierValue, identifierValue, false) &&
          identifierValueRequired &&
          !isPresentString(identifierValue)
        ) {
          addIssue(path, messages.identifierValueRequired);
        }
      }

      (values.relationships ?? []).forEach((relationship, index) => {
        if (relationship == null) {
          return;
        }
        for (const field of ['relatedPersonUuid', 'relationshipType'] as const) {
          const path = ['relationships', index, field];
          const value = relationship[field];
          if (checkType(path, 'string', value, value, false) && !isPresentString(value)) {
            // Yup's default text, which was never translated.
            addIssue(path, `${pathText(path)} is a required field`);
          }
        }
      });

      for (const { path, message } of findPatternViolations(values, getPatternRules())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: toPath(path), message, params: { patternRule: true } });
      }
    });
}

function isPresentString(value: unknown): boolean {
  return typeof value === 'string' && value.length > 0;
}

function isOfType(type: 'string' | 'number' | 'date', value: unknown): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value);
    case 'date':
      return value instanceof Date && !Number.isNaN(value.getTime());
  }
}

/** Yup's number cast: strings lose their whitespace and an empty string becomes NaN. */
function castNumber(value: unknown, nullable: boolean): number | null | undefined {
  if (value === undefined || (nullable && value === null) || isOfType('number', value)) {
    return value as number | null | undefined;
  }
  if (typeof value === 'string') {
    const stripped = value.replace(/\s/g, '');
    return stripped === '' ? NaN : +stripped;
  }
  return parseFloat(value as string);
}

/** Yup's date cast: other values are parsed as text (an ISO date without a time zone is local time). */
function castDate(value: unknown, nullable: boolean): Date | null | undefined {
  if (value === undefined || (nullable && value === null)) {
    return value as null | undefined;
  }
  if (isOfType('date', value)) {
    return value as Date;
  }
  return dayjs(String(value)).toDate();
}

/** Yup's path text: `identifiers.a.identifierValue`, `relationships[0].relationshipType`. */
function pathText(path: Array<string | number>): string {
  return path.reduce<string>(
    (text, segment) => (typeof segment === 'number' ? `${text}[${segment}]` : text ? `${text}.${segment}` : segment),
    '',
  );
}

/** Yup's default type error text (`mixed.notType` in Yup 0.29 `lib/locale.js`). It was never translated. */
function typeErrorText(path: string, type: string, value: unknown, originalValue: unknown): string {
  // Like Yup, an empty original value falls back to the cast value, so a cast `null` reads as `NaN`.
  const original = originalValue != null ? originalValue : value;
  const isCast = original != null && original !== value;
  let message =
    `${path} must be a \`${type}\` type, but the final value was: \`${printValue(value)}\`` +
    (isCast ? ` (cast from the value \`${printValue(original)}\`).` : '.');
  if (value === null) {
    message += '\n If "null" is intended as an empty value be sure to mark the schema as `.nullable()`';
  }
  return message;
}

/** Yup's `printValue(value, true)` for the values the form can hold. */
function printValue(value: unknown): string {
  if (value == null || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'number') {
    return Number.isNaN(value) ? 'NaN' : Object.is(value, -0) ? '-0' : String(value);
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? String(value) : value.toISOString();
  }
  return JSON.stringify(value, null, 2);
}
