import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@openmrs/esm-framework';
import AdvancedPatientSearchComponent from '../patient-search-page/advanced-patient-search.component';
import Overlay from '../ui-components/overlay';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';

interface PatientSearchOverlayProps {
  onClose: () => void;
  query?: string;
  header?: string;
}

const PatientSearchOverlay: React.FC<PatientSearchOverlayProps> = ({ onClose, query = '', header }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(query);
  const showSearchResults = Boolean(searchTerm?.trim());
  const debouncedSearchTerm = useDebounce(searchTerm);

  const handleClearSearchTerm = useCallback(() => setSearchTerm(''), [setSearchTerm]);

  const onSearchTermChange = (query: string) => setSearchTerm(query);

  return (
    <Overlay header={header ?? t('searchResults', 'Search results')} close={onClose}>
      <PatientSearchBar
        initialSearchTerm={query}
        onChange={onSearchTermChange}
        onClear={handleClearSearchTerm}
        onSubmit={onSearchTermChange}
      />
      {showSearchResults && <AdvancedPatientSearchComponent query={debouncedSearchTerm} inTabletOrOverlay />}
    </Overlay>
  );
};

export default PatientSearchOverlay;
