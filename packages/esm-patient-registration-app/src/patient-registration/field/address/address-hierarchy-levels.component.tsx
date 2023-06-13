import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddressEntries, useAddressEntryFetchConfig } from './address-hierarchy.resource';
import { ComboBox, Layer } from '@carbon/react';
import { useField } from 'formik';

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
  const { entries, isLoadingAddressEntries, errorFetchingAddressEntries } = useAddressEntries(
    fetchEntriesForField,
    searchString,
  );

  const filteredEntries = useMemo(
    () =>
      meta?.value && entries
        ? entries.filter((entry) => entry.toLowerCase().includes(meta.value?.toLowerCase()))
        : entries,
    [entries, meta?.value],
  );

  const handleChange = useCallback(
    ({ selectedItem }) => {
      if (meta.value !== selectedItem) {
        helpers.setValue(selectedItem);
        updateChildElements();
      }
    },
    [updateChildElements, helpers.setValue],
  );

  const helperText = useMemo(() => {
    if (isLoadingAddressEntries) {
      return t('isLoadingEntries', 'Loading available entries');
    }
    if (errorFetchingAddressEntries) {
      return t('errorOccurredFetchingEntries', 'Error occurred while fetching available entries');
    }
    return '';
  }, [isLoadingAddressEntries, errorFetchingAddressEntries]);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Layer>
        <ComboBox
          {...field}
          titleText={attribute.label}
          items={filteredEntries ?? []}
          onInputChange={(inputText) => {
            helpers.setValue(inputText);
          }}
          itemToString={(item) => item}
          onChange={handleChange}
          helperText={helperText}
          onBlur={() => {}}
        />
      </Layer>
    </div>
  );
};
