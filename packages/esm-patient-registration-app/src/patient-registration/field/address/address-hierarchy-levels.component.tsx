import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddressEntries, useAddressEntryFetchConfig } from './address-hierarchy.resource';
import { useField } from 'formik';
import ComboInput from '../../input/combo-input/combo-input.component';
import { InlineNotification } from '@carbon/react';

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
  const [field, meta, helpers] = useField(`address.${attribute.name}`);
  const { fetchEntriesForField, searchString, updateChildElements } = useAddressEntryFetchConfig(attribute.name);
  const { entries } = useAddressEntries(fetchEntriesForField, searchString);

  const handleInputChange = useCallback((newValue) => {
    helpers.setValue(newValue);
  }, []);

  const handleSelection = useCallback(
    (selectedItem) => {
      if (meta.value !== selectedItem) {
        helpers.setValue(selectedItem);
        updateChildElements();
      }
    },
    [updateChildElements, helpers.setValue],
  );

  return (
    <ComboInput
      entries={entries}
      handleSelection={handleSelection}
      name={`address.${attribute.name}`}
      fieldProps={{
        ...field,
        id: attribute.name,
        labelText: `${attribute.label} (${t('optional', 'optional')})`,
      }}
      handleInputChange={handleInputChange}
    />
  );
};
