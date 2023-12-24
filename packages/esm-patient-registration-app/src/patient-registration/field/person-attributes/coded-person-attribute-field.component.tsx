import React, { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';
import { Layer, Select, SelectItem } from '@carbon/react';
import { type PersonAttributeTypeResponse } from '../../patient-registration.types';
import { useConceptAnswers } from '../field.resource';
import styles from './../field.scss';
import { reportError } from '@openmrs/esm-framework';

export interface CodedPersonAttributeFieldProps {
  id: string;
  personAttributeType: PersonAttributeTypeResponse;
  answerConceptSetUuid: string;
  label?: string;
  customConceptAnswers: Array<{ uuid: string; label?: string }>;
}

export function CodedPersonAttributeField({
  id,
  personAttributeType,
  answerConceptSetUuid,
  label,
  customConceptAnswers,
}: CodedPersonAttributeFieldProps) {
  const { data: conceptAnswers, isLoading: isLoadingConceptAnswers } = useConceptAnswers(
    customConceptAnswers.length ? '' : answerConceptSetUuid,
  );
  const { t } = useTranslation();
  const fieldName = `attributes.${personAttributeType.uuid}`;

  useEffect(() => {
    if (!answerConceptSetUuid) {
      reportError(
        `The person attribute field '${id}' is of type 'coded' but has been defined without an answer concept set UUID. The 'answerConceptSetUuid' key is required.`,
      );
    }
  }, [answerConceptSetUuid]);

  useEffect(() => {
    if (!isLoadingConceptAnswers && conceptAnswers?.length == 0) {
      reportError(
        `The coded person attribute field '${id}' has been defined with an answer concept set UUID '${answerConceptSetUuid}' that does not have any concept answers.`,
      );
    }
  }, [isLoadingConceptAnswers, conceptAnswers]);

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
          <Field name={fieldName}>
            {({ field, form: { touched, errors }, meta }) => {
              return (
                <>
                  <Select
                    id={id}
                    name={`person-attribute-${personAttributeType.uuid}`}
                    labelText={label ?? personAttributeType?.display}
                    invalid={errors[fieldName] && touched[fieldName]}
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
