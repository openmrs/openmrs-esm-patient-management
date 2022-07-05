import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import PatientSearchComponent from '../patient-search-page/patient-search-lg.component';
import Overlay from '../ui-components/overlay';

interface PatientSearchOverlayProps {
  onClose: () => void;
  query: string;
  resultsToShow: number;
}

const PatientSearchOverlay: React.FC<PatientSearchOverlayProps> = ({ onClose, query, resultsToShow }) => {
  const [searchTerm, setSearchTerm] = useState(query);
  const { t } = useTranslation();

  useEffect(() => {
    if (query) {
      setSearchTerm(query);
    }
  }, [query]);

  return (
    <Overlay header={t('searchResults')} close={onClose}>
      <PatientSearchBar initialSearchTerm={query} setGlobalSearchTerm={setSearchTerm} />
      {searchTerm && <PatientSearchComponent query={searchTerm} resultsToShow={resultsToShow} />}
    </Overlay>
  );
};

export default PatientSearchOverlay;
