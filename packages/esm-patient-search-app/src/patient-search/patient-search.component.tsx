import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePagination } from '@openmrs/esm-framework';
import { Loading, PaginationNav, Tile } from 'carbon-components-react';
import EmptyDataIllustration from './empty-data-illustration.component';
import PatientSearchResults from '../patient-search-result/patient-search-result.component';
import styles from './patient-search.scss';
import { usePatients } from '../hooks/usePatients';

const resultsPerPage = 5;

interface PatientSearchProps {
  hidePanel?: () => void;
  querySearchTerm: string;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ hidePanel, querySearchTerm }) => {
  const { t } = useTranslation();
  const { patients, isLoading, error } = usePatients(querySearchTerm);
  const { totalPages, results, goTo } = usePagination(patients, resultsPerPage);

  const handlePageChange = (page: number) => {
    goTo(page + 1);
  };

  useEffect(() => {
    if (patients.length) {
      goTo(1);
    }
  }, [patients.length, querySearchTerm]);

  if (error) {
    return (
      <div className={styles.searchResults}>
        <p className={styles.resultsText}>{t('errorText', 'An error occurred while performing search')}</p>
        <Tile className={styles.emptySearchResultsTile}>
          <EmptyDataIllustration />
          <div>
            <p className={styles.errorMessage}>
              {t('error', 'Error')} {`${error?.status}: `}
              {error?.statusText}
            </p>
            <p className={styles.errorCopy}>
              {t(
                'errorCopy',
                'Sorry, there was a an error. You can try to reload this page, or contact the site administrator and quote the error code above.',
              )}
            </p>
          </div>
        </Tile>
      </div>
    );
  }

  if (isLoading) {
    return <Loading description="Active loading indicator" withOverlay={true} />;
  }
  return (
    <Tile onClick={(event) => event.stopPropagation()} className={styles.searchResultsContainer}>
      <>
        {patients.length > 0 ? (
          <div className={styles.searchResults}>
            <p className={styles.resultsText}>{t('patientsFound', { count: patients.length })}</p>
            <PatientSearchResults hidePanel={hidePanel} patients={results} />
            <div className={styles.pagination}>
              <PaginationNav itemsShown={resultsPerPage} totalItems={totalPages} onChange={handlePageChange} />
            </div>
          </div>
        ) : (
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
    </Tile>
  );
};

export default PatientSearch;
