import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PatientUuid } from '@openmrs/esm-framework';
import Overlay from '../ui-components/overlay';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import PatientSearchComponent from '../patient-search-page/patient-search-lg.component';
import debounce from 'lodash-es/debounce';

interface PatientSearchOverlayProps {
  onClose: () => void;
  query?: string;
  header?: string;
  selectPatientAction?: (PatientUuid) => void;
}

const PatientSearchOverlay: React.FC<PatientSearchOverlayProps> = ({ onClose, query, header, selectPatientAction }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(query);
  const handleClear = useCallback(() => setSearchTerm(''), [setSearchTerm]);
  const showSearchResults = useCallback(() => !!searchTerm.trim(), [searchTerm]);

  console.log(searchTerm);

  useEffect(() => {
    if (query) {
      setSearchTerm(query);
    }
  }, [query]);

  const onSearchQueryChange = useCallback(
    debounce((val) => {
      setSearchTerm(val);
    }, 300),
    [searchTerm],
  );

  return (
    <Overlay header={header ?? t('searchResults', 'Search results')} close={onClose}>
      <PatientSearchBar
        initialSearchTerm={query}
        onSubmit={onSearchQueryChange}
        onChange={onSearchQueryChange}
        onClear={handleClear}
      />
      {showSearchResults && (
        <PatientSearchComponent
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
