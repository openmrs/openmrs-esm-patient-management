import React, { RefAttributes, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Search } from '@carbon/react';
import styles from './patient-search-bar.scss';

interface PatientSearchBarProps {
  buttonProps?: Object;
  initialSearchTerm?: string;
  onChange?: (searchTerm) => void;
  onClear: () => void;
  onSubmit: (searchTerm) => void;
  small?: boolean;
}

const PatientSearchBar = React.forwardRef<HTMLInputElement, React.PropsWithChildren<PatientSearchBarProps>>(
  ({ buttonProps, initialSearchTerm, onChange, onClear, onSubmit, small }, ref) => {
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const handleChange = useCallback(
      (val) => {
        if (typeof onChange === 'function') {
          onChange(val);
        }
        setSearchTerm(val);
      },
      [onChange, setSearchTerm],
    );

    const handleSubmit = (evt) => {
      evt.preventDefault();
      onSubmit(searchTerm);
    };

    return (
      <form onSubmit={handleSubmit} className={styles.searchArea}>
        <Search
          autoFocus
          className={styles.patientSearchInput}
          closeButtonLabelText={t('clearSearch', 'Clear')}
          labelText=""
          onChange={(event) => handleChange(event.target.value)}
          onClear={onClear}
          placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
          size={small ? 'sm' : 'lg'}
          value={searchTerm}
          ref={ref}
          data-testid="patientSearchBar"
        />
        <Button type="submit" kind="secondary" size={small ? 'sm' : 'lg'} onClick={handleSubmit} {...buttonProps}>
          {t('search', 'Search')}
        </Button>
      </form>
    );
  },
);

export default PatientSearchBar;
