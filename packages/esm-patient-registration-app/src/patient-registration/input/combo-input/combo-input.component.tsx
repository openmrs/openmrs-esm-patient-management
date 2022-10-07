import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { ComboBoxProps } from '@carbon/react';
import { useField } from 'formik';
import { useAddressHierarchy, useAdressHierarchyWithParentSearch } from '../../patient-registration.resource';
import { Input } from '../basic-input/input/input.component';
import styles from './combo-input.scss';

interface ComboInputProps extends Omit<ComboBoxProps, 'items'> {
  name: string;
  labelText: string;
  placeholder?: string;
  setSelectedValue: any;
  selected: string;
}

export const ComboInput: React.FC<ComboInputProps> = ({ name, labelText, placeholder, setSelectedValue, selected }) => {
  const searchBox = useRef(null);
  const wrapper = useRef(null);
  const [field, _, helpers] = useField(name);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { addresses } = useAdressHierarchyWithParentSearch(name.replace(' ', ''), selected, field.value);
  const suggestions = useMemo(() => {
    setShowSuggestions(addresses.length > 0);
    return addresses.map((parent1) => ({ id: parent1['uuid'], text: parent1['name'] }));
  }, [addresses, setShowSuggestions]);
  const { setValue } = helpers;

  const handleClickOutsideComponent = (e) => {
    if (wrapper.current) {
      setShowSuggestions(wrapper.current.contains(e.target));
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideComponent);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideComponent);
    };
  }, [wrapper]);

  const handleSelection = useCallback(
    (suggestion) => {
      setValue(suggestion?.text);
      setSelectedValue(suggestion.id);
      setShowSuggestions(false);
    },
    [setValue, setSelectedValue, setShowSuggestions],
  );

  return (
    <div className={styles.autocomplete} ref={wrapper}>
      <Input id={name} name={name} labelText={labelText} {...field} ref={searchBox} />
      {showSuggestions && suggestions.length > 0 && (
        /* Since the input has a marginBottom of 1rem */
        <div style={{ marginTop: '-1rem' }}>
          <ul className={styles.suggestions}>
            {suggestions.map((suggestion, index) => (
              <li //eslint-disable-line jsx-a11y/no-noninteractive-element-interactions
                key={index}
                onClick={(e) => handleSelection(suggestion)}>
                {suggestion?.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
