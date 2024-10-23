import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddressEntries, useAddressEntryFetchConfig } from './address-hierarchy.resource';
import ComboInput from '../../input/combo-input/combo-input.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import type { FormValues } from '../../patient-registration.types';
import { usePatientRegistrationContext } from '../../patient-registration-hooks';

interface AddressComboBoxProps {
  attribute: {
    id: string;
    name: string;
    value: string;
    label: string;
    required?: boolean;
  };
}

interface AddressHierarchyLevelsProps {
  orderedAddressFields: Array<any>;
}

const AddressComboBox: React.FC<AddressComboBoxProps> = ({ attribute }) => {
  const { t } = useTranslation();
  const fieldName = `address.${attribute.name}` as keyof FormValues;
  const { setValue, watch } = usePatientRegistrationContext();
  const fieldValue = watch(fieldName);
  const { fetchEntriesForField, searchString, updateChildElements } = useAddressEntryFetchConfig(attribute.name);
  const { entries } = useAddressEntries(fetchEntriesForField, searchString);
  const label = t(attribute.label) + (attribute?.required ? '' : ` (${t('optional', 'optional')})`);

  const handleInputChange = useCallback(
    (newValue) => {
      setValue(fieldName, newValue);
    },
    [setValue],
  );

  const handleSelection = useCallback(
    (selectedItem) => {
      if (fieldValue !== selectedItem) {
        setValue(fieldName, selectedItem);
        updateChildElements();
      }
    },
    [updateChildElements, fieldValue, setValue],
  );

  return (
    <ComboInput
      entries={entries}
      handleSelection={handleSelection}
      name={fieldName}
      required={attribute?.required}
      labelText={label}
      handleInputChange={handleInputChange}
    />
  );
};

const AddressHierarchyLevels: React.FC<AddressHierarchyLevelsProps> = ({ orderedAddressFields }) => {
  return (
    <>
      {orderedAddressFields.map((attribute) => (
        <AddressComboBox key={attribute.id} attribute={attribute} />
      ))}
    </>
  );
};

export default AddressHierarchyLevels;
