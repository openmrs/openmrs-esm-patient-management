import React from 'react';
import PatientListResults from './PatientListResults';
import { ViewState, StateTypes } from './types';

interface SearchOverlayProps {
  viewState: ViewState;
  setListStarred: (listUuid: string, star: boolean) => void;
  openPatientList: (uuid: string) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ viewState, setListStarred, openPatientList }) => {
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
