import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Search } from '@carbon/react';
import styles from './patient-search-bar.scss';

interface PatientSearchBarProps {
  buttonProps?: Object;
  initialSearchTerm?: string;
  small?: boolean;
  onChange?: (searchTerm) => void;
  onClear: () => void;
  onSubmit: (searchTerm) => void;
}

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  small,
  buttonProps,
  initialSearchTerm,
  onSubmit,
  onClear,
  onChange,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const handleChange = useCallback(
    (val) => {
      if (onChange) {
        onChange(val);
      }
      setSearchTerm(val);
    },
    [onChange, setSearchTerm],
  );

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      onSubmit(searchTerm);
    },
    [searchTerm, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className={styles.searchArea}>
      <Search
        className={styles.patientSearchInput}
        size={small ? 'sm' : 'xl'}
        placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
        labelText=""
        closeButtonLabelText={t('clearSearch', 'Clear')}
        onChange={(event) => handleChange(event.target.value)}
        onClear={onClear}
        autoFocus
        value={searchTerm}
      />
      <Button type="submit" kind={'secondary'} size={small ? 'sm' : 'md'} onClick={handleSubmit} {...buttonProps}>
        {t('search', 'Search')}
      </Button>
    </form>
  );
};

export default PatientSearchBar;
