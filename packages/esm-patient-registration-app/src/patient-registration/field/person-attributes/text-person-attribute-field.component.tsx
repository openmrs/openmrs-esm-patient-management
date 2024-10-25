import React from 'react';
import classNames from 'classnames';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import { Input } from '../../input/basic-input/input/input.component';
import type { FormValues, PersonAttributeTypeResponse } from '../../patient-registration.types';
import styles from './../field.scss';
import { Controller } from 'react-hook-form';
import { usePatientRegistrationContext } from '../../patient-registration-hooks';

export interface TextPersonAttributeFieldProps {
  id: string;
  personAttributeType: PersonAttributeTypeResponse;
  validationRegex?: string;
  label?: string;
  required?: boolean;
}

export function TextPersonAttributeField({
  id,
  personAttributeType,
  validationRegex,
  label,
  required,
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
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Input
        id={id}
        name={`person-attribute-${personAttributeType.uuid}` as keyof FormValues}
        labelText={label ?? personAttributeType?.display}
        required={required}
      />
    </div>
  );
}
