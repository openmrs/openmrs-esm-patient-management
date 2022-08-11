import React, { useState } from 'react';
import BasicSearch from './basic-search.component';
import AdvancedSearch from './advanced-search.component';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import SearchResults from './search-results.component';
import { SearchTypes } from '../types';

const PatientSearch = () => {
  const [searchType, setSearchType] = useState<SearchTypes>(SearchTypes.BASIC);
  const [selectedPatient, setSelectedPatient] = useState<fhir.Patient>({});

  const toggleSearchType = (searchType: SearchTypes, patient: fhir.Patient = {}) => {
    setSearchType(searchType);
    setSelectedPatient(patient);
  };

  return (
    <>
      <div className="omrs-main-content">
        {searchType === SearchTypes.BASIC ? (
          <BasicSearch patient={selectedPatient} toggleSearchType={toggleSearchType} />
        ) : searchType === SearchTypes.ADVANCED ? (
          <AdvancedSearch toggleSearchType={toggleSearchType} />
        ) : searchType === SearchTypes.SEARCH_RESULTS ? (
          <SearchResults patients={[]} toggleSearchType={toggleSearchType} />
        ) : searchType === SearchTypes.SCHEDULED_VISITS ? (
          <PatientScheduledVisits toggleSearchType={toggleSearchType} patient={selectedPatient} />
        ) : null}
      </div>
    </>
  );
};

export default PatientSearch;
