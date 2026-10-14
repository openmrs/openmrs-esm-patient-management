import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Field, getIn } from 'formik';
import { Layer, Select, SelectItem, ContentSwitcher, Switch } from '@carbon/react';
import { reportError } from '@openmrs/esm-framework';
import { type PersonAttributeTypeResponse } from '../../patient-registration.types';
import { useConceptAnswers } from '../field.resource';
import styles from './../field.scss';

export interface CodedPersonAttributeFieldProps {
  id: string;
  personAttributeType: PersonAttributeTypeResponse;
  answerConceptSetUuid: string;
  label?: string;
  customConceptAnswers: Array<{ uuid: string; label?: string }>;
  required: boolean;
  displayStyle?: 'dropdown' | 'radio';
}

export function CodedPersonAttributeField({
  id,
  personAttributeType,
  answerConceptSetUuid,
  label,
  customConceptAnswers,
  required,
  displayStyle,
}: CodedPersonAttributeFieldProps) {
  const { data: conceptAnswers, isLoading: isLoadingConceptAnswers } = useConceptAnswers(
    customConceptAnswers.length ? '' : answerConceptSetUuid,
  );

  const { t } = useTranslation();
  const fieldName = `attributes.${personAttributeType.uuid}`;
  const [error, setError] = useState(false);

  const validate = useCallback(
    (value: string) => {
      if (required && !value) {
        return t('attributeFieldRequired', 'This field is required');
      }
    },
    [required, t],
  );

  useEffect(() => {
    if (!answerConceptSetUuid && !customConceptAnswers.length) {
      reportError(
        t(
          'codedPersonAttributeNoAnswerSet',
          `The person attribute field '{{codedPersonAttributeFieldId}}' is of type 'coded' but has been defined without an answer concept set UUID. The 'answerConceptSetUuid' key is required.`,
          { codedPersonAttributeFieldId: id },
        ),
      );
      setError(true);
    }
  }, [answerConceptSetUuid, customConceptAnswers, id, t]);

  useEffect(() => {
    if (!isLoadingConceptAnswers && !customConceptAnswers.length) {
      if (!conceptAnswers) {
        reportError(
          t(
            'codedPersonAttributeAnswerSetInvalid',
            `The coded person attribute field '{{codedPersonAttributeFieldId}}' has been defined with an invalid answer concept set UUID '{{answerConceptSetUuid}}'.`,
            { codedPersonAttributeFieldId: id, answerConceptSetUuid },
          ),
        );
        setError(true);
      }
      if (conceptAnswers?.length === 0) {
        reportError(
          t(
            'codedPersonAttributeAnswerSetEmpty',
            `The coded person attribute field '{{codedPersonAttributeFieldId}}' has been defined with an answer concept set UUID '{{answerConceptSetUuid}}' that does not have any concept answers.`,
            {
              codedPersonAttributeFieldId: id,
              answerConceptSetUuid,
            },
          ),
        );
        setError(true);
      }
    }
  }, [isLoadingConceptAnswers, conceptAnswers, customConceptAnswers, t, id, answerConceptSetUuid]);

  const answers = useMemo(() => {
    if (customConceptAnswers.length) {
      return customConceptAnswers;
    }
    return isLoadingConceptAnswers || !conceptAnswers
      ? []
      : conceptAnswers
          .map((answer) => ({ ...answer, label: answer.display }))
          .sort((a, b) => a.label.localeCompare(b.label));
  }, [customConceptAnswers, conceptAnswers, isLoadingConceptAnswers]);

  if (error) {
    return null;
  }

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      {!isLoadingConceptAnswers ? (
        <Layer>
          <Field name={fieldName} validate={validate}>
            {({ field, form: { touched, errors, submitCount, setFieldValue, setFieldTouched }, meta }) => {
              const fieldError = (meta.error || getIn(errors, fieldName)) as string | undefined;
              const isFieldTouched = meta.touched || Boolean(getIn(touched, fieldName)) || submitCount > 0;
              const isInvalid = Boolean(isFieldTouched && fieldError);
              const errorMessage = fieldError;

              if (displayStyle === 'radio') {
                return (
                  <div
                    className={classNames(styles.attributeField, styles.radioField, {
                      [styles.radioFieldInvalid]: isInvalid,
                    })}>
                    <div className={styles.radioContentSwitcherLabel}>
                      <span className={classNames(styles.label01, { [styles.dangerLabel01]: isInvalid })}>
                        {label ?? personAttributeType?.display}
                      </span>
                    </div>
                    <ContentSwitcher
                      id={id}
                      size="md"
                      onChange={(e) => {
                        setFieldValue(fieldName, e.name);
                        setFieldTouched(fieldName, true, false);
                      }}
                      selectedIndex={answers.findIndex((a) => a.uuid === field.value)}>
                      {answers.map((answer) => (
                        <Switch key={answer.uuid} name={answer.uuid} text={answer.label} />
                      ))}
                    </ContentSwitcher>
                    {isInvalid && errorMessage && (
                      <div className={styles.radioFieldError}>{t(errorMessage, errorMessage)}</div>
                    )}
                  </div>
                );
              }
              return (
                <>
                  <Select
                    id={id}
                    name={`person-attribute-${personAttributeType.uuid}`}
                    labelText={label ?? personAttributeType?.display}
                    invalid={isInvalid}
                    invalidText={errorMessage ? t(errorMessage, errorMessage) : undefined}
                    required={required}
                    {...field}>
                    <SelectItem value={''} text={t('selectAnOption', 'Select an option')} />
                    {answers.map((answer) => (
                      <SelectItem key={answer.uuid} value={answer.uuid} text={answer.label} />
                    ))}
                  </Select>
                </>
              );
            }}
          </Field>
        </Layer>
      ) : null}
    </div>
  );
}
