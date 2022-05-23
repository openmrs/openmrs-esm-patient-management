import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Overlay from '../overlay.component';
import BasicSearch from './basic-search.component';
import AdvancedSearch from './advanced-search.component';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import SearchResults from './search-results.component';
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
      <Overlay header={t('addNewAppointment', 'Add New apppointment')} closePanel={closePanel}>
        <div className="omrs-main-content">
          {searchType === SearchTypes.BASIC ? (
            <BasicSearch toggleSearchType={toggleSearchType} />
          ) : searchType === SearchTypes.ADVANCED ? (
            <AdvancedSearch toggleSearchType={toggleSearchType} />
          ) : searchType === SearchTypes.SEARCH_RESULTS ? (
            <SearchResults patients={[]} toggleSearchType={toggleSearchType} />
          ) : searchType === SearchTypes.SCHEDULED_VISITS ? (
            <PatientScheduledVisits toggleSearchType={toggleSearchType} />
          ) : null}
        </div>
      </Overlay>
    </>
  );
};

export default PatientSearch;
