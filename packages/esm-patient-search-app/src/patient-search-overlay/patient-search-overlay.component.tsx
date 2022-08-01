import { PatientUuid } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import PatientSearchComponent from '../patient-search-page/patient-search-lg.component';
import Overlay from '../ui-components/overlay';

interface PatientSearchOverlayProps {
  onClose: () => void;
  query?: string;
  header?: string;
  onPatientSelect?: (PatientUuid) => void;
}

const PatientSearchOverlay: React.FC<PatientSearchOverlayProps> = ({ onClose, query, header, onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState(query);
  const { t } = useTranslation();
  const handleClear = useCallback(() => setSearchTerm(''), [setSearchTerm]);

  useEffect(() => {
    if (query) {
      setSearchTerm(query);
    }
  }, [query]);

  return (
    <Overlay header={header ?? t('searchResults', 'Search results')} close={onClose}>
      <PatientSearchBar initialSearchTerm={query} onSubmit={setSearchTerm} onClear={handleClear} />
      {searchTerm && <PatientSearchComponent onPatientSelect={onPatientSelect} query={searchTerm} inTabletOrOverlay />}
    </Overlay>
  );
};

export default PatientSearchOverlay;
