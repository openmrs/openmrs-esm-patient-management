import React from 'react';
import classNames from 'classnames';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import { Input } from '../../input/basic-input/input/input.component';
import styles from '../field.scss';
import { type FieldDefinition } from '../../../config-schema';
import type { FormValues } from '../../patient-registration.types';

export interface AddressFieldProps {
  fieldDefinition: FieldDefinition;
}

export const AddressField: React.FC<AddressFieldProps> = ({ fieldDefinition }) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      return (
      <Input
        id={fieldDefinition.id}
        name={fieldDefinition.id as keyof FormValues}
        labelText={t(`${fieldDefinition.label}`, `${fieldDefinition.label}`)}
        required={fieldDefinition?.validation?.required ?? false}
      />
      );
    </div>
  );
};
