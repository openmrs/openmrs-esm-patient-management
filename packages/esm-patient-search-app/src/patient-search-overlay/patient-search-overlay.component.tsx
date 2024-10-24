import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig, useDebounce } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
import AdvancedPatientSearchComponent from '../patient-search-page/advanced-patient-search.component';
import Overlay from '../ui-components/overlay';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';

interface PatientSearchOverlayProps {
  onClose: () => void;
  handleSearchTermUpdated?: (value: string) => void;
  query?: string;
  header?: string;
}

const PatientSearchOverlay: React.FC<PatientSearchOverlayProps> = ({
  onClose,
  query = '',
  header,
  handleSearchTermUpdated,
}) => {
  const { t } = useTranslation();
  const {
    search: { disableTabletSearchOnKeyUp },
  } = useConfig<PatientSearchConfig>();
  const [searchTerm, setSearchTerm] = useState(query);
  const showSearchResults = Boolean(searchTerm?.trim());
  const debouncedSearchTerm = useDebounce(searchTerm);

  const handleClearSearchTerm = useCallback(() => setSearchTerm(''), [setSearchTerm]);

  const onSearchTermChange = useCallback((value: string) => {
    setSearchTerm(value);
    handleSearchTermUpdated && handleSearchTermUpdated(value);
  }, []);

  return (
    <Overlay header={header ?? t('searchResults', 'Search results')} close={onClose}>
      <PatientSearchBar
        initialSearchTerm={query}
        onChange={(value) => !disableTabletSearchOnKeyUp && onSearchTermChange(value)}
        onClear={handleClearSearchTerm}
        onSubmit={onSearchTermChange}
      />
      {showSearchResults && <AdvancedPatientSearchComponent query={debouncedSearchTerm} inTabletOrOverlay />}
    </Overlay>
  );
};

export default PatientSearchOverlay;
