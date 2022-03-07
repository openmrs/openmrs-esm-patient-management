import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Overlay from '../overlay.component';
import BasicSearch from './basic-search.component';
import AdvancedSearch from './advanced-search.component';
import { SearchTypes } from '../types';

interface PatientSearchProps {
  closePanel: () => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ closePanel }) => {
  const { t } = useTranslation();
  const [searchType, setSearchType] = useState<SearchTypes>(SearchTypes.BASIC);

  const toggleSearchType = (searchType: SearchTypes) => {
    setSearchType(searchType);
  };

  return (
    <>
      <Overlay header={t('addPatientToList', 'Add patient to list')} closePanel={closePanel}>
        <div className="omrs-main-content">
          {searchType === SearchTypes.BASIC ? (
            <BasicSearch toggleSearchType={toggleSearchType} />
          ) : (
            <AdvancedSearch toggleSearchType={toggleSearchType} />
          )}
        </div>
      </Overlay>
    </>
  );
};

export default PatientSearch;
