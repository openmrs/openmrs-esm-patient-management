import React from 'react';
import { Layer, Select, SelectItem } from '@carbon/react';
import { Input } from '../../input/basic-input/input/input.component';
import { PersonAttributeTypeResponse } from '../../patient-registration-types';
import { useConceptAnswers } from '../field.resource';
import styles from './../field.scss';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';

export interface CodedPersonAttributeFieldProps {
  personAttributeType: PersonAttributeTypeResponse;
  answerConceptSetUuid: string;
  label?: string;
}

export function CodedPersonAttributeField({
  personAttributeType,
  answerConceptSetUuid,
  label,
}: CodedPersonAttributeFieldProps) {
  const { data: conceptAnswers, isLoading: isLoadingConceptAnswers } = useConceptAnswers(answerConceptSetUuid);
  const { t } = useTranslation();
  const fieldName = `attributes.${personAttributeType.uuid}`;

  return (
    <div className={`${styles.customField} ${styles.halfWidthInDesktopView}`}>
      {!isLoadingConceptAnswers && conceptAnswers?.length ? (
        <Layer>
          <Field name={fieldName}>
            {({ field, form: { touched, errors }, meta }) => {
              return (
                <Select
                  id={`person-attribute-${personAttributeType.uuid}`}
                  labelText={label ?? personAttributeType?.display}
                  invalid={errors[fieldName] && touched[fieldName]}
                  {...field}>
                  <SelectItem value={null} text={t('selectAnOption', 'Select an option')} />
                  {conceptAnswers.map((answer) => (
                    <SelectItem key={answer.uuid} value={answer.uuid} text={answer.display} />
                  ))}
                </Select>
              );
            }}
          </Field>
        </Layer>
      ) : (
        <Layer>
          <Field name={fieldName}>
            {({ field, form: { touched, errors }, meta }) => {
              return (
                <Input
                  id={`person-attribute-${personAttributeType.uuid}`}
                  labelText={label ?? personAttributeType?.display}
                  invalid={errors[fieldName] && touched[fieldName]}
                  {...field}
                />
              );
            }}
          </Field>
        </Layer>
      )}
    </div>
  );
}
