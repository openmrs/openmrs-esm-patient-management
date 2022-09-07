import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PatientUuid } from '@openmrs/esm-framework';
import Overlay from '../ui-components/overlay';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import PatientSearchComponent from '../patient-search-page/patient-search-lg.component';
import debounce from 'lodash-es/debounce';
import AdvancedPatientSearchComponent from '../patient-search-page/advanced-patient-search.component';

interface PatientSearchOverlayProps {
  onClose: () => void;
  query?: string;
  header?: string;
  selectPatientAction?: (PatientUuid) => void;
}

const PatientSearchOverlay: React.FC<PatientSearchOverlayProps> = ({
  onClose,
  query = '',
  header,
  selectPatientAction,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(query);
  const handleClear = useCallback(() => setSearchTerm(''), [setSearchTerm]);
  const showSearchResults = useMemo(() => !!searchTerm?.trim(), [searchTerm]);

  useEffect(() => {
    if (query) {
      setSearchTerm(query);
    }
  }, [query]);

  const onSearchQueryChange = debounce((val) => {
    setSearchTerm(val);
  }, 300);

  return (
    <Overlay header={header ?? t('searchResults', 'Search results')} close={onClose}>
      <PatientSearchBar
        initialSearchTerm={query}
        onSubmit={onSearchQueryChange}
        onChange={onSearchQueryChange}
        onClear={handleClear}
      />
      {showSearchResults && (
        <AdvancedPatientSearchComponent
          selectPatientAction={selectPatientAction}
          query={searchTerm}
          inTabletOrOverlay
          hidePanel={onClose}
        />
      )}
    </Overlay>
  );
};

export default PatientSearchOverlay;
