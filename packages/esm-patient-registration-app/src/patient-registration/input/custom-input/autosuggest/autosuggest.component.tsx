import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Search, SearchProps } from '@carbon/react';
import styles from './autosuggest.scss';

interface AutosuggestProps extends SearchProps {
  getDisplayValue: Function;
  getFieldValue: Function;
  getSearchResults: (query: string) => Promise<any>;
  onSuggestionSelected: (field: string, value: string) => void;
}

export const Autosuggest: React.FC<any> = ({
  getDisplayValue,
  getFieldValue,
  getSearchResults,
  onSuggestionSelected,
  ...searchProps
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const searchBox = useRef(null);
  const wrapper = useRef(null);
  const { t } = useTranslation();
  const { name, labelText } = searchProps;

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
    searchBox.current.value = display;
    onSuggestionSelected(name, value);
    setSuggestions([]);
  };

  return (
    <div className={styles.autocomplete} ref={wrapper}>
      <label className="cds--label">{labelText}</label>
      <Layer>
        <Search
          id="autosuggest"
          onChange={handleChange}
          ref={searchBox}
          className={styles.autocompleteSearch}
          {...searchProps}
        />
      </Layer>
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
