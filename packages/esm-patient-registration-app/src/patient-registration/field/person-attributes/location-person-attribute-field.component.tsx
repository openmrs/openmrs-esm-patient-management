import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Field, useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { Input } from '../../input/basic-input/input/input.component';
import { type PersonAttributeTypeResponse } from '../../patient-registration.types';
import styles from './../field.scss';
import { useAddressEntries, useAddressEntryFetchConfig } from './location-person-attribute-field.resource';
import ComboInput from '../../input/combo-input/combo-input.component';

export interface LocationPersonAttributeFieldProps {
  id: string;
  personAttributeType: PersonAttributeTypeResponse;
  validationRegex?: string;
  label?: string;
  required?: boolean;
}

export function LocationPersonAttributeField({
  id,
  personAttributeType,
  validationRegex,
  label,
  required,
}: LocationPersonAttributeFieldProps) {
  const { t } = useTranslation();
  const [field, meta, { setValue }] = useField(`attributes.${personAttributeType.uuid}`);
  const { fetchEntriesForField, searchString, updateChildElements } = useAddressEntryFetchConfig(
    personAttributeType.name,
  );
  const { entries } = useAddressEntries(fetchEntriesForField, searchString);

  const handleInputChange = useCallback(
    (newValue) => {
      setValue(newValue);
    },
    [setValue],
  );

  const handleSelection = useCallback(
    (selectedItem) => {
      if (meta.value !== selectedItem) {
        setValue(selectedItem);
        updateChildElements();
      }
    },
    [updateChildElements, meta.value, setValue],
  );

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <ComboInput
        entries={entries}
        handleSelection={handleSelection}
        name={`attributes.${personAttributeType.uuid}`}
        fieldProps={{
          ...field,
          id: personAttributeType.uuid,
          labelText: label,
          required: required,
        }}
        handleInputChange={handleInputChange}
      />
    </div>
  );
}
