import React, { useState } from 'react';
import { useAddressHierarchy } from '../../patient-registration.resource';
import { ComboBox, Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
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
    const [country, stateProvince, countyDistrict, address1, cityVillage] = selectedItem.split(', ');
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
        />
      </Layer>
    </div>
  );
};

export default AddressSearchComponent;
