import React from 'react';
import { ViewState, StateTypes } from './index';
import PatientListResults from './PatientListResults';

const SearchOverlay: React.FC<{
  viewState: ViewState;
  setListStarred: (listUuid: string, star: boolean) => void;
  openPatientList: (uuid: string) => void;
}> = ({ viewState, setListStarred, openPatientList }) => {
  switch (viewState.type) {
    case StateTypes.SEARCH:
      return (
        <div
          style={{
            zIndex: 1,
            gridRow: '2 / 4',
            gridColumn: '1 / 2',
            backgroundColor: 'grey',
            opacity: 0.7,
          }}></div>
      );
    case StateTypes.SEARCH_WITH_RESULTS:
      return (
        <PatientListResults
          style={{ zIndex: 1, gridRow: '2 / 4', gridColumn: '1 / 2', backgroundColor: '#ededed' }}
          nameFilter={viewState.searchTerm}
          setListStarred={setListStarred}
          enter={viewState.enter}
          openPatientList={openPatientList}
        />
      );
    case StateTypes.IDLE:
    default:
      return null;
  }
};

export default SearchOverlay;
