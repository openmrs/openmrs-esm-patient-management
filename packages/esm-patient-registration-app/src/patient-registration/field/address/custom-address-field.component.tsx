import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Input } from '../../input/basic-input/input/input.component';
import type { FieldDefinition } from '../../../config-schema';
import styles from '../field.scss';

export interface AddressFieldProps {
  fieldDefinition: FieldDefinition;
}

export const AddressField: React.FC<AddressFieldProps> = ({ fieldDefinition }) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Input
        id={fieldDefinition.id}
        labelText={t(`${fieldDefinition.label}`, `${fieldDefinition.label}`)}
        required={fieldDefinition?.validation?.required ?? false}
        name={fieldDefinition.id}
      />
    </div>
  );
};
