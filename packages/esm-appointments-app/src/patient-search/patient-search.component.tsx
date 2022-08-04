import React, { useState } from 'react';
import BasicSearch from './basic-search.component';
import SearchResults from './search-results.component';
import { SearchTypes } from '../types';

const PatientSearch: React.FC = () => {
  const [searchType, setSearchType] = useState<SearchTypes>(SearchTypes.BASIC);

  const toggleSearchType = (searchType: SearchTypes) => {
    setSearchType(searchType);
  };

  return (
    <>
      <div className="omrs-main-content">
        {searchType === SearchTypes.BASIC ? (
          <BasicSearch toggleSearchType={toggleSearchType} />
        ) : searchType === SearchTypes.SEARCH_RESULTS ? (
          <SearchResults patients={[]} />
        ) : null}
      </div>
    </>
  );
};

export default PatientSearch;
