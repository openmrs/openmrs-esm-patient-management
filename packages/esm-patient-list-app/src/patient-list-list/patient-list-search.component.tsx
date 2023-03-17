import React, { useMemo, useState } from 'react';
import { Search, SearchProps, InlineLoading, Layer } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import styles from './patient-list-list.scss';
import debounce from 'lodash-es/debounce';
import { TabIndices } from './patient-list-list.component';

interface SearchComponentProps {
  selectedTab: number;
  fetching?: boolean;
  onChange: (searchTerm: string) => void;
  search: {
    placeHolder: string;
    currentSearchTerm?: string;
    otherSearchProps?: SearchProps;
  };
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onChange, selectedTab, fetching = false, search }) => {
  const layout = useLayoutType();

  const [searchString, setSearchString] = useState({
    STARRED_LISTS: '',
    SYSTEM_LISTS: '',
    MY_LISTS: '',
    ALL_LISTS: '',
  });

  const handleSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        setSearchString({
          ...searchString,
          [TabIndices[selectedTab]]: searchTerm,
        });
        onChange(searchTerm);
      }, 300),
    [searchString, selectedTab, onChange],
  );

  return (
    <div className={styles.container}>
      <div id="table-tool-bar" className={styles.searchContainer}>
        <div>{fetching && <InlineLoading />}</div>
        <div>
          <Layer>
            <Search
              id="patient-list-search"
              placeholder={search.placeHolder}
              labelText=""
              size={isDesktop(layout) ? 'md' : 'lg'}
              className={styles.search}
              onChange={(evnt) => handleSearch(evnt.target.value)}
              defaultValue={search.currentSearchTerm}
              {...search?.otherSearchProps}
            />
          </Layer>
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;
