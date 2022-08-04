import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import { Search, Button, Tile, InlineLoading } from 'carbon-components-react';
import SearchIllustration from './search-illustration.component';
import SearchResults from './search-results.component';
import usePatients from '../hooks/usePatients';
import { SearchTypes } from '../types';
import styles from './basic-search.scss';
import { ConfigurableLink } from '@openmrs/esm-framework';
import EmptyDataIllustration from './empty-data-illustration.component';

interface BasicSearchProps {
  toggleSearchType: (searchMode: SearchTypes) => void;
}

const BasicSearch: React.FC<BasicSearchProps> = ({ toggleSearchType }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState<string>(null);
  const { patients, isLoading } = usePatients(query);
  const searchTimeoutInMs = 300;

  const handleSearch = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), searchTimeoutInMs), []);

  const performSearch = () => setQuery(searchTerm);

  return (
    <div className={patients?.length ? styles.lightBackground : styles.resultsContainer}>
      <div className={styles.searchboxContainer}>
        <Search
          autoFocus
          light
          className={styles.searchInput}
          labelText="Search for a patient"
          placeholder={t('searchboxPlaceholder', 'Search for a patient name or ID number')}
          onChange={(event) => handleSearch(event.target.value)}
          onClear={() => setQuery(null)}
        />
        <Button onClick={performSearch} iconDescription="Basic search" size="field" kind="secondary">
          {t('search', 'Search')}
        </Button>
      </div>
      {
        <>
          {query === null && (
            <div>
              <div className={styles.tileContainer}>
                <Tile className={styles.tile} light>
                  <SearchIllustration />
                  <div className={styles.helperText}>
                    <p className={styles.primaryText}>{t('primaryHelperText', 'Search for a patient')}</p>
                    <p className={styles.secondaryText}>
                      {t('secondaryHelperText', "Type the patient's name or unique ID number")}
                    </p>
                  </div>
                </Tile>
              </div>
              <p className={styles.separator}>{t('or', 'or')}</p>
              <div className={styles.linkContainer}>
                <ConfigurableLink className={styles.btnLink} to={`\${openmrsSpaBase}\patient-registration`}>
                  {t('registerNewPatient', 'Register new patient')}
                </ConfigurableLink>
              </div>
            </div>
          )}
          {isLoading && (
            <div className={styles.loadingContainer}>
              <InlineLoading description={t('loading', 'Loading...')} />
            </div>
          )}

          {patients.length > 0 && <SearchResults patients={patients} />}
          {patients.length === 0 && query !== null && !isLoading && (
            <div className={styles.resultsContainer}>
              <div>
                <p className={styles.resultsText}>{t('noResultsFound', 'No results found')}</p>
                <Tile className={styles.emptySearchResultsTile}>
                  <EmptyDataIllustration />
                  <p className={styles.emptyResultText}>
                    {t('noPatientFoundMessage', 'Sorry, no patient has been found')}
                  </p>
                  <p className={styles.actionText}>
                    <span>
                      {t('trySearchWithPatientUniqueID', "Try searching with the patient's unique ID number")}
                    </span>
                    <br />
                    <span>{t('orPatientName', "OR the patient's name(s)")}</span>
                  </p>
                </Tile>
              </div>
            </div>
          )}
        </>
      }
    </div>
  );
};

export default BasicSearch;
