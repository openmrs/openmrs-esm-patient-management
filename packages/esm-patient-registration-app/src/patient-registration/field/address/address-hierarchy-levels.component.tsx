import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddressEntries, useAddressEntryFetchConfig } from './address-hierarchy.resource';
import { useField } from 'formik';
import ComboInput from '../../input/combo-input/combo-input.component';

interface AddressHierarchyLevelsProps {
  orderedAddressFields: Array<any>;
}

const AddressHierarchyLevels: React.FC<AddressHierarchyLevelsProps> = ({ orderedAddressFields }) => {
  const { t } = useTranslation();

  return (
    <>
      {orderedAddressFields.map((attribute) => (
        <AddressComboBox key={attribute.id} attribute={attribute} />
      ))}
    </>
  );
};

export default AddressHierarchyLevels;

interface AddressComboBoxProps {
  attribute: {
    id: string;
    name: string;
    value: string;
    label: string;
  };
}

const AddressComboBox: React.FC<AddressComboBoxProps> = ({ attribute }) => {
  const { t } = useTranslation();
  const [field, meta, { setValue }] = useField(`address.${attribute.name}`);
  const { fetchEntriesForField, searchString, updateChildElements } = useAddressEntryFetchConfig(attribute.name);
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
    <ComboInput
      entries={entries}
      handleSelection={handleSelection}
      name={`address.${attribute.name}`}
      fieldProps={{
        ...field,
        id: attribute.name,
        labelText: `${t(attribute.label)} (${t('optional', 'optional')})`,
      }}
      handleInputChange={handleInputChange}
    />
  );
};
