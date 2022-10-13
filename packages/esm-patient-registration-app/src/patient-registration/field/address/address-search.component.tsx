import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAddressHierarchy } from '../../patient-registration.resource';
import { Search } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import styles from './address-search.scss';

interface AddressSearchComponentProps {
  addressLayout: Array<any>;
}

const AddressSearchComponent: React.FC<AddressSearchComponentProps> = ({ addressLayout }) => {
  const { t } = useTranslation();
  const seprator = ', ';
  const searchBox = useRef(null);
  const wrapper = useRef(null);
  const [searchString, setSearchString] = useState<string>('');
  const { addresses, isLoading, error } = useAddressHierarchy(searchString);
  const addressOptions: Array<string> = useMemo(() => {
    const options: Set<string> = new Set();
    addresses.forEach((address) => {
      const values = address.split(seprator);
      values.forEach((val, index) => {
        if (val.toLowerCase().includes(searchString.toLowerCase())) {
          options.add(values.slice(0, index + 1).join(seprator));
        }
      });
    });
    return [...options];
  }, [addresses, searchString]);

  const { setFieldValue } = useFormikContext();

  const handleInputChange = (e) => {
    setSearchString(e.target.value);
  };

  const handleChange = (address) => {
    if (address) {
      const values = address.split(seprator);
      values.map((value, index) => {
        setFieldValue(`address.${addressLayout[index].name}`, value);
      });
      setSearchString('');
    }
  };

  const handleClickOutsideComponent = (e) => {
    if (wrapper.current && !wrapper.current.contains(e.target)) {
      setSearchString('');
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideComponent);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideComponent);
    };
  }, [wrapper]);

  return (
    <div className={styles.autocomplete} ref={wrapper} style={{ marginBottom: '1rem' }}>
      {/* <Layer> */}
      <Search
        onChange={handleInputChange}
        labelText={t('searchAddress', 'Search address')}
        placeholder={t('searchAddress', 'Search address')}
        ref={searchBox}
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
        value={searchString}
      />
      {/* </Layer> */}
      {addressOptions.length > 0 && (
        /* Since the input has a marginBottom of 1rem */
        <ul className={styles.suggestions}>
          {addressOptions.map((address, index) => (
            <li //eslint-disable-line jsx-a11y/no-noninteractive-element-interactions
              key={index}
              onClick={(e) => handleChange(address)}>
              {address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressSearchComponent;
