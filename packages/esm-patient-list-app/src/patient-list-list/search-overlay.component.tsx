import React from 'react';
import PatientListResults from './patient-list-results.component';
import { ViewState, StateTypes } from './types';
import styles from './patient-list-list.scss';

interface SearchOverlayProps {
  viewState: ViewState;
  setListStarred: (listUuid: string, star: boolean) => void;
  openPatientList: (uuid: string) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ viewState, setListStarred, openPatientList }) => {
  switch (viewState.type) {
    case StateTypes.SEARCH:
      return <div className={styles.searchOverlay}></div>;
    case StateTypes.SEARCH_WITH_RESULTS:
      return (
        <div className={styles.patientListResultsContainer}>
          <PatientListResults
            nameFilter={viewState.searchTerm}
            enter={viewState.enter}
            openPatientList={openPatientList}
          />
        </div>
      );
    case StateTypes.IDLE:
    default:
      return null;
  }
};

export default SearchOverlay;
