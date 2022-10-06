import React, { useState } from 'react';
import { useAddressHierarchy } from '../../patient-registration.resource';
import ComboBox from '@carbon/react/es/components/ComboBox/ComboBox.js';
import { Layer } from '@carbon/react/es/components/Layer';
import { useTranslation } from 'react-i18next';
import { add, debounce } from 'lodash-es';
import { useFormikContext } from 'formik';

interface AddressSearchComponentProps {}

const AddressSearchComponent: React.FC<AddressSearchComponentProps> = () => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState<string>('');
  const { addresses, isLoading, error } = useAddressHierarchy(searchString);
  const { setFieldValue } = useFormikContext();

  const handleInputChange = (str) => {
    setSearchString(str);
  };

  const handleChange = ({ selectedItem }) => {
    console.log(selectedItem);
    const [country, stateProvince, countyDistrict, address1, cityVillage] = selectedItem.split(', ');
    console.log({
      country,
      stateProvince,
      countyDistrict,
      address1,
      cityVillage,
    });

    setFieldValue(`address.country`, country);
    setFieldValue(`address.stateProvince`, stateProvince);
    setFieldValue(`address.countyDistrict`, countyDistrict);
    setFieldValue(`address.address1`, address1);
    setFieldValue(`address.cityVillage`, cityVillage);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Layer>
        <ComboBox
          ariaLabel="searchAddress"
          id="searchAddress"
          onChange={handleChange}
          onInputChange={handleInputChange}
          items={addresses?.map((address) => address?.address?.split('|').join(', ')) ?? []}
          label={t('searchAddress', 'Search address')}
          titleText={t('searchAddress', 'Search address')}
          helperText={
            searchString
              ? isLoading
                ? t('loadingResults', 'Loading results')
                : error
                ? error.message
                : addresses?.length === 0
                ? t('noResultsFound', 'No results found')
                : null
              : null
          }
          light
        />
      </Layer>
    </div>
  );
};

export default AddressSearchComponent;
