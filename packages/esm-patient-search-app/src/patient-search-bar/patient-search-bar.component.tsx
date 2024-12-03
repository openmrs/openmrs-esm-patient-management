import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Search } from '@carbon/react';
import styles from './patient-search-bar.scss';

interface PatientSearchBarProps {
  buttonProps?: Object;
  initialSearchTerm?: string;
  onChange?: (searchTerm) => void;
  onClear: () => void;
  onSubmit: (searchTerm) => void;
  isCompact?: boolean;
}

const PatientSearchBar = React.forwardRef<HTMLInputElement, React.PropsWithChildren<PatientSearchBarProps>>(
  ({ buttonProps, initialSearchTerm = '', onChange, onClear, onSubmit, isCompact }, ref) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const responsiveSize = isCompact ? 'sm' : 'lg';

    const handleChange = useCallback(
      (value: string) => {
        setSearchTerm(value);
        onChange?.(value);
      },
      [onChange],
    );

    const handleSubmit = useCallback(
      (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (searchTerm && searchTerm.trim()) {
          onSubmit(searchTerm.trim());
        }
      },
      [onSubmit, searchTerm],
    );

    return (
      <form onSubmit={handleSubmit} className={styles.searchArea}>
        <Search
          autoFocus
          className={styles.patientSearchInput}
          closeButtonLabelText={t('clearSearch', 'Clear')}
          data-testid="patientSearchBar"
          labelText=""
          onChange={(event) => handleChange(event.target.value)}
          onClear={onClear}
          placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
          ref={ref}
          size={responsiveSize}
          value={searchTerm}
        />
        <Button kind="secondary" onClick={handleSubmit} {...buttonProps} size={responsiveSize} type="submit">
          {t('search', 'Search')}
        </Button>
      </form>
    );
  },
);

export default PatientSearchBar;
