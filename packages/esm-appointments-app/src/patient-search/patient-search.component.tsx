import React, { useState } from 'react';
import BasicSearch from './basic-search.component';
import AdvancedSearch from './advanced-search.component';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import SearchResults from './search-results.component';
import { SearchTypes } from '../types';

const PatientSearch = () => {
  const [searchType, setSearchType] = useState<SearchTypes>(SearchTypes.BASIC);

  const toggleSearchType = (searchType: SearchTypes) => setSearchType(searchType);

  return (
    <div className="omrs-main-content">
      {(() => {
        if (searchType === SearchTypes.BASIC) {
          return <BasicSearch toggleSearchType={toggleSearchType} />;
        }

        if (searchType === SearchTypes.ADVANCED) {
          return <AdvancedSearch toggleSearchType={toggleSearchType} />;
        }

        if (searchType === SearchTypes.SEARCH_RESULTS) {
          return <SearchResults patients={[]} toggleSearchType={toggleSearchType} />;
        }

        if (searchType === SearchTypes.SCHEDULED_VISITS) {
          return <PatientScheduledVisits toggleSearchType={toggleSearchType} />;
        }
      })()}
    </div>
  );
};

export default PatientSearch;
