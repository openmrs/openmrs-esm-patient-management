import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'carbon-components-react';
import styles from './autosuggest.scss';
import { useTranslation } from 'react-i18next';

interface AutosuggestProps {
  name: string;
  placeholder: string;
  getDisplayValue: Function;
  getFieldValue: Function;
  getSearchResults: (query: string) => Promise<any>;
  onSuggestionSelected: (field: string, value: string) => void;
}

export const Autosuggest: React.FC<AutosuggestProps> = ({
  name,
  placeholder,
  getDisplayValue,
  getFieldValue,
  getSearchResults,
  onSuggestionSelected,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const searchBox = useRef(null);
  const wrapper = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideComponent);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideComponent);
    };
  }, [wrapper]);

  const handleClickOutsideComponent = (e) => {
    if (wrapper.current && !wrapper.current.contains(e.target)) {
      setSuggestions([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query) {
      getSearchResults(query).then((suggestions) => {
        setSuggestions(suggestions);
      });
    } else {
      setSuggestions([]);
    }
  };

  const handleClick = (index: number) => {
    const display = getDisplayValue(suggestions[index]);
    const value = getFieldValue(suggestions[index]);
    searchBox.current.input.value = display;
    onSuggestionSelected(name, value);
    setSuggestions([]);
  };

  return (
    <div className={styles.autocomplete} ref={wrapper}>
      <Search
        name={name}
        id="autosuggest"
        placeholder={placeholder}
        labelText={t('fullName', 'Full Name')}
        onChange={handleChange}
        ref={searchBox}
        className={styles.autocompleteSearch}
        light
        size="xl"
      />
      {suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <li //eslint-disable-line jsx-a11y/no-noninteractive-element-interactions
              key={index}
              onClick={(e) => handleClick(index)}>
              {getDisplayValue(suggestion)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
