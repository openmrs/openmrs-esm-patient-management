import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormHelpers, useRegistrationField } from '../../form-adapter';
import ComboInput from '../../input/combo-input/combo-input.component';
import { useAddressEntries, useAddressEntryFetchConfig } from './address-hierarchy.resource';

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
  const fieldName = `address.${attribute.name}`;
  const { field } = useRegistrationField<string>(fieldName);
  const { setFieldValue } = useFormHelpers();
  const { fetchEntriesForField, searchString, updateChildElements } = useAddressEntryFetchConfig(attribute.name);
  const { entries, isLoadingAddressEntries, errorFetchingAddressEntries } = useAddressEntries(
    fetchEntriesForField,
    searchString,
  );
  const label = t(attribute.label) + (attribute?.required ? '' : ` (${t('optional', 'optional')})`);

  const handleInputChange = useCallback(
    (newValue) => {
      setFieldValue(fieldName, newValue);
    },
    [fieldName, setFieldValue],
  );

  const handleSelection = useCallback(
    (selectedItem) => {
      if (field.value !== selectedItem) {
        setFieldValue(fieldName, selectedItem);
        updateChildElements();
      }
    },
    [updateChildElements, field.value, fieldName, setFieldValue],
  );

  return (
    <ComboInput
      entries={entries}
      error={errorFetchingAddressEntries}
      isLoading={isLoadingAddressEntries}
      handleSelection={handleSelection}
      name={fieldName}
      fieldProps={{
        ...field,
        id: attribute.name,
        labelText: label,
        required: attribute?.required,
      }}
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
