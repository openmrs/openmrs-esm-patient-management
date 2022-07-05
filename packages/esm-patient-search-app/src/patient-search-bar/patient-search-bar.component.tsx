import React, { useMemo } from 'react';
import { Button, Search } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import styles from './patient-search-bar.scss';
interface PatientSearchBarProps {
  buttonProps?: Object;
  initialSearchTerm?: string;
  setGlobalSearchTerm: (searchTerm) => void;
  small?: boolean;
}

const searchTimeout = 300;

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  small,
  buttonProps,
  initialSearchTerm,
  setGlobalSearchTerm,
}) => {
  const { t } = useTranslation();
  const handleChange = useMemo(() => debounce((searchTerm) => setGlobalSearchTerm(searchTerm), searchTimeout), []);

  return (
    <div className={styles.searchArea}>
      <Search
        className={styles.patientSearchInput}
        size={small ? 'sm' : 'xl'}
        placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
        labelText=""
        closeButtonLabelText={t('clearSearch', 'Clear')}
        onChange={(event) => handleChange(event.target.value)}
        autoFocus
        defaultValue={initialSearchTerm ?? ''}
      />
      <Button type="submit" kind={'secondary'} size={small ? 'sm' : 'md'} {...buttonProps}>
        {t('search', 'Search')}
      </Button>
    </div>
  );
};

export default PatientSearchBar;
