import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../input/basic-input/input/input.component';
import styles from '../field.scss';
import { FieldDefinition } from '../../../config-schema';
import { Field } from 'formik';

export interface AddressFieldProps {
  fieldDefinition: FieldDefinition;
}

export const AddressField: React.FC<AddressFieldProps> = ({ fieldDefinition }) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.customField} ${styles.halfWidthInDesktopView}`}>
      <Field name={fieldDefinition.id}>
        {({ field, form: { touched, errors }, meta }) => {
          return (
            <Input
              id={fieldDefinition.id}
              labelText={t(`${fieldDefinition.label}`, `${fieldDefinition.label}`)}
              {...field}
            />
          );
        }}
      </Field>
    </div>
  );
};
