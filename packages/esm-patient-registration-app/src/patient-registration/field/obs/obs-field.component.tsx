import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { InlineNotification, Layer, Select, SelectItem } from '@carbon/react';
import { OpenmrsDatePicker, useConfig } from '@openmrs/esm-framework';
import { useFieldHandlers, useFormHelpers, useRegistrationField } from '../../form-adapter';
import { Input } from '../../input/basic-input/input/input.component';
import { useConcept, useConceptAnswers } from '../field.resource';
import { usePatternRule } from '../../validation/pattern-rules';
import type { FieldPath } from 'react-hook-form';
import type { ConceptResponse, FormValues } from '../../patient-registration.types';
import type { FieldDefinition, RegistrationConfig } from '../../../config-schema';
import type { PatternRule } from '../../validation/pattern-rules';
import styles from './../field.scss';

export interface ObsFieldProps {
  fieldDefinition: FieldDefinition;
}

export function ObsField({ fieldDefinition }: ObsFieldProps) {
  const { t } = useTranslation();
  const { data: concept, isLoading } = useConcept(fieldDefinition.uuid);
  const config = useConfig<RegistrationConfig>();

  if (!config.registrationObs.encounterTypeUuid) {
    console.error(
      'The registration form has been configured to have obs fields, ' +
        'but no registration encounter type has been configured. Obs fields ' +
        'will not be displayed.',
    );
    return null;
  }

  if (isLoading) {
    return null;
  }

  switch (concept.datatype.display) {
    case 'Text':
      return (
        <TextObsField
          concept={concept}
          validationRegex={fieldDefinition.validation.matches}
          label={fieldDefinition.label}
          required={fieldDefinition.validation.required}
        />
      );
    case 'Numeric':
      return (
        <NumericObsField
          concept={concept}
          label={fieldDefinition.label}
          required={fieldDefinition.validation.required}
        />
      );
    case 'Date':
      return (
        <DateObsField
          concept={concept}
          label={fieldDefinition.label}
          required={fieldDefinition.validation.required}
          allowPastDates={fieldDefinition.allowPastDates}
          allowFutureDates={fieldDefinition.allowFutureDates}
        />
      );
    case 'Coded':
      return (
        <CodedObsField
          concept={concept}
          answerConceptSetUuid={fieldDefinition.answerConceptSetUuid}
          label={fieldDefinition.label}
          required={fieldDefinition.validation.required}
          customConceptAnswers={fieldDefinition.customConceptAnswers}
        />
      );
    default:
      return (
        <InlineNotification kind="error" title="Error">
          {t(
            'obsFieldUnknownDatatype',
            `Concept for obs field '{{fieldDefinitionId}}' has unknown datatype '{{datatypeName}}'`,
            { fieldDefinitionId: fieldDefinition.id, datatypeName: concept.datatype.display },
          )}
        </InlineNotification>
      );
  }
}

interface TextObsFieldProps {
  concept: ConceptResponse;
  validationRegex: string;
  label: string;
  required?: boolean;
}

function TextObsField({ concept, validationRegex, label, required }: TextObsFieldProps) {
  const { t } = useTranslation();

  const fieldName = `obs.${concept.uuid}`;
  const invalidInputMessage = t('invalidInput', 'Invalid Input');
  const regexRule: PatternRule | null =
    validationRegex && typeof validationRegex === 'string'
      ? { path: fieldName, pattern: validationRegex, message: invalidInputMessage, onInvalidPattern: 'throw' }
      : null;
  usePatternRule(regexRule);

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Input id={fieldName} name={fieldName} labelText={label ?? concept.display} required={required} />
    </div>
  );
}

interface NumericObsFieldProps {
  concept: ConceptResponse;
  label: string;
  required?: boolean;
}

function NumericObsField({ concept, label, required }: NumericObsFieldProps) {
  const fieldName = `obs.${concept.uuid}`;

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Input id={fieldName} name={fieldName} labelText={label ?? concept.display} required={required} type="number" />
    </div>
  );
}

interface DateObsFieldProps {
  concept: ConceptResponse;
  label: string;
  required?: boolean;
  allowPastDates?: boolean;
  allowFutureDates?: boolean;
}

function DateObsField({ concept, label, required, allowPastDates, allowFutureDates }: DateObsFieldProps) {
  const { t } = useTranslation();
  const fieldName = `obs.${concept.uuid}`;
  const { field, error } = useRegistrationField<Date>(fieldName);
  const { setFieldValue } = useFormHelpers();
  const futureDatesAllowed = allowFutureDates ?? true;
  const pastDatesAllowed = allowPastDates ?? true;

  const onDateChange = (date: Date) => {
    setFieldValue(fieldName, date);
  };

  return (
    <Layer>
      <div className={styles.dobField}>
        <OpenmrsDatePicker
          id={fieldName}
          name={field.name}
          onBlur={field.onBlur}
          isRequired={required}
          onChange={onDateChange}
          labelText={label ?? concept.display}
          invalidText={t(error)}
          value={field.value}
          minDate={!pastDatesAllowed ? new Date() : undefined}
          maxDate={!futureDatesAllowed ? new Date() : undefined}
        />
      </div>
    </Layer>
  );
}

interface CodedObsFieldProps {
  concept: ConceptResponse;
  answerConceptSetUuid?: string;
  label?: string;
  required?: boolean;
  customConceptAnswers: Array<{ uuid: string; label?: string }>;
}

function CodedObsField({ concept, answerConceptSetUuid, label, required, customConceptAnswers }: CodedObsFieldProps) {
  const { t } = useTranslation();
  const fieldName = `obs.${concept.uuid}`;
  // Not `useRegistrationField`: its error subscription would re-render this component, which also loads the answers,
  // on every validation of the form.
  const value = useWatch<FormValues>({ name: fieldName as FieldPath<FormValues> }) as string;
  const handlers = useFieldHandlers(fieldName);

  const { data: conceptAnswers, isLoading: isLoadingConceptAnswers } = useConceptAnswers(
    customConceptAnswers.length ? '' : (answerConceptSetUuid ?? concept.uuid),
  );

  const answers = useMemo(
    () =>
      customConceptAnswers.length
        ? customConceptAnswers
        : isLoadingConceptAnswers
          ? []
          : conceptAnswers.map((answer) => ({ ...answer, label: answer.display })),
    [customConceptAnswers, conceptAnswers, isLoadingConceptAnswers],
  );

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      {!isLoadingConceptAnswers ? (
        <Layer>
          <Select
            id={fieldName}
            labelText={label ?? concept?.display}
            required={required}
            name={fieldName}
            value={value}
            {...handlers}>
            <SelectItem
              key={`no-answer-select-item-${fieldName}`}
              value={''}
              text={t('selectAnOption', 'Select an option')}
            />
            {answers.map((answer) => (
              <SelectItem key={answer.uuid} value={answer.uuid} text={answer.label} />
            ))}
          </Select>
        </Layer>
      ) : null}
    </div>
  );
}
