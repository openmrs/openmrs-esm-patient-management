import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Overlay from '../overlay.component';
import PatientAdvancedSearchLaunch from './patient-advanced-search.component';
import { SearchMode } from '../types';
import PatientSimpleSearch from './patient-simple-search.component';

interface PatientSearchProps {
  close: () => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ close }) => {
  const { t } = useTranslation();
  const [searchMode, setSearchMode] = useState<SearchMode>(SearchMode.simple);
  const handleSearchMode = (searchMode: SearchMode) => {
    setSearchMode(searchMode);
  };
  return (
    <>
      <Overlay header={t('addPatientToListHeader', 'Add patient to list')} close={close}>
        <div className="omrs-main-content">
          {searchMode === SearchMode.simple ? (
            <PatientSimpleSearch handleAdvanceSearch={handleSearchMode} />
          ) : (
            <PatientAdvancedSearchLaunch handleSimpleSearch={handleSearchMode} />
          )}
        </div>
      </Overlay>
    </>
  );
};

export default PatientSearch;
