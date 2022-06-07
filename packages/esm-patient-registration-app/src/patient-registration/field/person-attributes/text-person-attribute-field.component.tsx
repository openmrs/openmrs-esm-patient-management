import React from 'react';
import styles from './../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import { PersonAttributeTypeResponse } from '../../patient-registration-types';

export interface TextPersonAttributeFieldProps {
  personAttributeType: PersonAttributeTypeResponse;
  validationRegex?: string;
  label?: string;
}

export function TextPersonAttributeField({
  personAttributeType,
  validationRegex,
  label,
}: TextPersonAttributeFieldProps) {
  const { t } = useTranslation();

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

  const fieldName = `attributes.${personAttributeType.uuid}`;

  return (
    <div className={`${styles.attributeField} ${styles.halfWidthInDesktopView}`}>
      <Field name={fieldName} validate={validateInput}>
        {({ field, form: { touched, errors }, meta }) => {
          return (
            <Input
              id={`person-attribute-${personAttributeType.uuid}`}
              labelText={label ?? personAttributeType?.display}
              light
              invalid={errors[fieldName] && touched[fieldName]}
              {...field}
            />
          );
        }}
      </Field>
    </div>
  );
}
