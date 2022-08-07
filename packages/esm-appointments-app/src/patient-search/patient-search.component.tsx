import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BasicSearch from './basic-search.component';
import AdvancedSearch from './advanced-search.component';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import SearchResults from './search-results.component';
import PatientForm from '../appointment-forms/create-appointment-form.component';
import { SearchTypes } from '../types';

const PatientSearch: React.FC = () => {
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
        ) : searchType === SearchTypes.FORM ? (
          <PatientForm patient={selectedPatient} patientUuid={selectedPatient.id} />
        ) : null}
      </div>
    </>
  );
};

export default PatientSearch;
