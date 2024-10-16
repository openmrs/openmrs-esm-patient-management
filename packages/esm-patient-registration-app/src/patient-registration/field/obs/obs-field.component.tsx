import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import { InlineNotification, Layer, Select, SelectItem } from '@carbon/react';
import { OpenmrsDatePicker, useConfig } from '@openmrs/esm-framework';
import type { FormValues, ConceptResponse } from '../../patient-registration.types';
import { type FieldDefinition, type RegistrationConfig } from '../../../config-schema';
import { Input } from '../../input/basic-input/input/input.component';
import { useConcept, useConceptAnswers } from '../field.resource';
import { PatientRegistrationContext } from '../../patient-registration-context';
import styles from './../field.scss';
import { Controller } from 'react-hook-form';
import { usePatientRegistrationContext } from '../../patient-registration-hooks';

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
          dateFormat={fieldDefinition.dateFormat}
          placeholder={fieldDefinition.placeholder}
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

  // TODO: Add validation in the ZOD Schema
  const validateInput = (value: string) => {
    if (!value || !validationRegex || validationRegex === '' || typeof validationRegex !== 'string' || value === '') {
      return;
    }
    const regex = new RegExp(validationRegex);
    if (regex.test(value)) {
      return;
    } else {
      return t('invalidInput', 'Invalid Input');
    }
  };

  const fieldName = `obs.${concept.uuid}`;
  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Input
        // @ts-ignore
        name={fieldName as keyof FormValues}
        id={fieldName}
        labelText={label ?? concept.display}
        required={required}
      />
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
      <Input
        // @ts-ignore
        name={fieldName}
        id={fieldName}
        labelText={label ?? concept.display}
        required={required}
        type="number"
      />
    </div>
  );
}

interface DateObsFieldProps {
  concept: ConceptResponse;
  label: string;
  required?: boolean;
  dateFormat?: string;
  placeholder?: string;
}

function DateObsField({ concept, label, required, placeholder }: DateObsFieldProps) {
  const { t } = useTranslation();
  const fieldName = `obs.${concept.uuid}`;
  const { setValue } = usePatientRegistrationContext();
  const { control } = usePatientRegistrationContext();

  const onDateChange = (date: Date) => {
    setValue(fieldName as keyof FormValues, date);
  };

  return (
    <Layer>
      <div className={styles.dobField}>
        <Controller
          control={control}
          name={fieldName as keyof FormValues}
          render={({ field, fieldState: { isTouched, error } }) => (
            <>
              <OpenmrsDatePicker
                id={fieldName}
                {...field}
                value={field.value as Date}
                isRequired={required}
                onChange={onDateChange}
                labelText={label ?? concept.display}
                isInvalid={Boolean(isTouched && error?.message)}
                invalidText={error?.message}
              />
            </>
          )}
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
  const { control } = usePatientRegistrationContext();

  const { data: conceptAnswers, isLoading: isLoadingConceptAnswers } = useConceptAnswers(
    customConceptAnswers.length ? '' : answerConceptSetUuid ?? concept.uuid,
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
        <Controller
          control={control}
          name={fieldName as keyof FormValues}
          render={({ field, fieldState: { isTouched, error } }) => (
            <Layer>
              <Select
                id={fieldName}
                name={fieldName}
                labelText={label ?? concept?.display}
                required={required}
                invalid={Boolean(isTouched && error?.message)}
                invalidText={error?.message}>
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
          )}
        />
      ) : null}
    </div>
  );
}
