import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Overlay from '../overlay.component';
import BasicSearch from './basic-search.component';
import AdvancedSearch from './advanced-search.component';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import SearchResults from './search-results.component';
import VisitForm from './visit-form/visit-form.component';
import { SearchTypes } from '../types';

interface PatientSearchProps {
  closePanel: () => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ closePanel }) => {
  const { t } = useTranslation();
  const [searchType, setSearchType] = useState<SearchTypes>(SearchTypes.BASIC);
  const [selectedPatientUuid, setSelectedPatientUuid] = useState('');
  const [newVisitMode, setNewVisitMode] = useState<boolean>(false);

  const toggleSearchType = (searchType: SearchTypes, patientUuid: string = '', mode: boolean = false) => {
    setSearchType(searchType);
    setSelectedPatientUuid(patientUuid);
    setNewVisitMode(mode);
  };

  return (
    <>
      <Overlay header={t('addPatientToQueue', 'Add patient to queue')} closePanel={closePanel}>
        <div className="omrs-main-content">
          {searchType === SearchTypes.BASIC ? (
            <BasicSearch toggleSearchType={toggleSearchType} />
          ) : searchType === SearchTypes.ADVANCED ? (
            <AdvancedSearch toggleSearchType={toggleSearchType} />
          ) : searchType === SearchTypes.SEARCH_RESULTS ? (
            <SearchResults patients={[]} toggleSearchType={toggleSearchType} />
          ) : searchType === SearchTypes.SCHEDULED_VISITS ? (
            <PatientScheduledVisits
              patientUuid={selectedPatientUuid}
              toggleSearchType={toggleSearchType}
              closePanel={closePanel}
            />
          ) : searchType === SearchTypes.VISIT_FORM ? (
            <VisitForm
              patientUuid={selectedPatientUuid}
              toggleSearchType={toggleSearchType}
              closePanel={closePanel}
              mode={newVisitMode}
            />
          ) : null}
        </div>
      </Overlay>
    </>
  );
};

export default PatientSearch;
