import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile, Button } from '@carbon/react';
import { type SearchedPatient } from '../types';
import EmptyDataIllustration from '../ui-components/empty-data-illustration.component';
import PatientBanner, { PatientBannerSkeleton } from './patient-banner/banner/patient-banner.component';
import styles from './patient-search-lg.scss';
import { navigate, useFeatureFlag } from '@openmrs/esm-framework';

interface CommonProps {
  searchMode?: 'mpi' | null | undefined;
  searchTerm: string;
}

interface PatientSearchResultsProps {
  searchResults: SearchedPatient[];
  searchTerm: string;
  searchMode?: 'mpi' | null | undefined;
}

export const EmptyState: React.FC<CommonProps> = ({ searchMode, searchTerm }) => {
  const { t } = useTranslation();
  const isMPIEnabled = useFeatureFlag('mpiFlag');
  const isSearchPage = window.location.pathname === '/openmrs/spa/search';
  return (
    <Layer>
      <Tile className={styles.emptySearchResultsTile}>
        <EmptyDataIllustration />
        <p className={styles.emptyResultText}>
          {t('noPatientChartsFoundMessage', 'Sorry, no patient charts were found')}
        </p>
        {isMPIEnabled && isSearchPage ? (
          <>
            <div className={styles.dividerWrapper}>
              <div className={styles.divider}></div>
            </div>
            {(searchMode === undefined || searchMode === null || searchMode !== 'mpi') && (
              <>
                <div className={styles.emptyResultsMarginRules}>
                  <p>
                    {t(
                      'trySearchFromClientRegistry',
                      "Try searching using the patient's unique ID number or search the external registry",
                    )}
                  </p>
                </div>
                <Button
                  kind="ghost"
                  renderIcon={'Search'}
                  onClick={(e) => {
                    doMPISearch(searchTerm);
                  }}>
                  {`${t('search', 'Search')} ${'External Registry'}`}
                </Button>
              </>
            )}
          </>
        ) : (
          <p className={styles.actionText}>
            <span>{t('trySearchWithPatientUniqueID', "Try to search again using the patient's unique ID number")}</span>
          </p>
        )}
      </Tile>
    </Layer>
  );
};

export const LoadingState: React.FC = () => {
  return (
    <div className={styles.results}>
      <PatientBannerSkeleton />
      <PatientBannerSkeleton />
      <PatientBannerSkeleton />
      <PatientBannerSkeleton />
      <PatientBannerSkeleton />
    </div>
  );
};

export const ErrorState: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layer>
      <Tile className={styles.emptySearchResultsTile}>
        <EmptyDataIllustration />
        <div>
          <p className={styles.errorMessage}>{t('error', 'Error')}</p>
          <p className={styles.errorCopy}>
            {t(
              'errorCopy',
              'Sorry, there was an error. You can try to reload this page, or contact the site administrator and quote the error code above.',
            )}
          </p>
        </div>
      </Tile>
    </Layer>
  );
};

export const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({ searchResults, searchMode }) => {
  return (
    <div data-openmrs-role="Search Results">
      {searchResults.map((patient) => (
        <PatientBanner
          key={patient.uuid}
          patientUuid={patient.uuid}
          patient={patient}
          isMPIPatient={searchMode == 'mpi'}
        />
      ))}
    </div>
  );
};

function doMPISearch(searchTerm: string) {
  navigate({
    to: '${openmrsSpaBase}/search?query=${searchTerm}&mode=mpi',
    templateParams: { searchTerm: searchTerm },
  });
}
