import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import isEmpty from 'lodash-es/isEmpty';
import { usePagination } from '@openmrs/esm-framework';
import PaginationNav from 'carbon-components-react/es/components/PaginationNav';
import { Tile } from 'carbon-components-react/es/components/Tile';
import { SearchedPatient } from '../types/index';
import EmptyDataIllustration from './empty-data-illustration.component';
import PatientSearchResults from '../patient-search-result/patient-search-result.component';
import styles from './patient-search.scss';
import Loading from 'carbon-components-react/es/components/Loading';

const resultsPerPage = 5;

interface PatientSearchProps {
  hidePanel?: () => void;
  searchResults: Array<SearchedPatient>;
  status: 'searching' | 'resolved' | 'error' | 'idle';
}

const PatientSearch: React.FC<PatientSearchProps> = ({ hidePanel, searchResults, status }) => {
  const { t } = useTranslation();
  const { totalPages, currentPage, goToNext, goToPrevious, results, goTo } = usePagination(
    searchResults,
    resultsPerPage,
  );

  const handlePageChange = (page: number) => {
    if (page === 0 && currentPage === 0) {
      goToNext();
    } else if (page + 1 > currentPage) {
      goToNext();
    } else if (page + 1 < currentPage) {
      goToPrevious();
    }
  };

  useEffect(() => {
    if (searchResults.length) {
      goTo(0);
    }
  }, [searchResults]);

  return (
    <div className={styles.searchResultsContainer}>
      {status === 'resolved' && (
        <>
          {!isEmpty(searchResults) && (
            <div className={styles.searchResults}>
              <p className={styles.resultsText}>{t('patientsFound', { count: searchResults.length })}</p>
              <PatientSearchResults hidePanel={hidePanel} patients={results} />
              <div className={styles.pagination}>
                <PaginationNav itemsShown={resultsPerPage} totalItems={totalPages} onChange={handlePageChange} />
              </div>
            </div>
          )}
          {isEmpty(searchResults) && (
            <div className={styles.searchResults}>
              <p className={styles.resultsText}>{t('noResultsFound', 'No results found')}</p>
              <Tile className={styles.emptySearchResultsTile}>
                <EmptyDataIllustration />
                <p className={styles.emptyResultText}>
                  {t('noPatientChartsFoundMessage', 'Sorry, no patient charts have been found')}
                </p>
                <p className={styles.actionText}>
                  <span>{t('trySearchWithPatientUniqueID', "Try searching with the patient's unique ID number")}</span>
                  <br />
                  <span>{t('orPatientName', "OR the patient's name(s)")}</span>
                </p>
              </Tile>
            </div>
          )}
        </>
      )}
      {status === 'searching' && <Loading description="Active loading indicator" withOverlay={true} />}
    </div>
  );
};

export default PatientSearch;
