import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Layer, Tile, Button } from '@carbon/react';
import EmptyDataIllustration from '../ui-components/empty-data-illustration.component';
import PatientBanner, { PatientBannerSkeleton } from './patient-banner/banner/patient-banner.component';
import { type SearchedPatient } from '../types';
import styles from './patient-search-lg.scss';
import { navigate, useFeatureFlag } from '@openmrs/esm-framework';

interface CommonProps {
  inTabletOrOverlay: boolean;
  searchMode?: string;
  searchTerm: string;
}

interface PatientSearchResultsProps {
  searchResults: SearchedPatient[];
  searchTerm: string;
  searchMode?: string;
}

export const EmptyState: React.FC<CommonProps> = ({ inTabletOrOverlay }) => {
  const { t } = useTranslation();
  return (
    <Layer>
      <Tile
        className={classNames(styles.emptySearchResultsTile, {
          [styles.paddedEmptySearchResultsTile]: inTabletOrOverlay,
        })}>
        <EmptyDataIllustration />
        <p className={styles.emptyResultText}>
          {t('noPatientChartsFoundMessage', 'Sorry, no patient charts were found')}
        </p>
        <p className={styles.actionText}>
          <span>{t('trySearchWithPatientUniqueID', "Try to search again using the patient's unique ID number")}</span>
        </p>
      </Tile>
    </Layer>
  );
};

export const LoadingState: React.FC<CommonProps> = ({ inTabletOrOverlay }) => {
  return (
    <div
      className={classNames(styles.results, {
        [styles.paddedEmptySearchResultsTile]: inTabletOrOverlay,
      })}>
      <PatientBannerSkeleton />
      <PatientBannerSkeleton />
      <PatientBannerSkeleton />
      <PatientBannerSkeleton />
      <PatientBannerSkeleton />
    </div>
  );
};

export const ErrorState: React.FC<CommonProps> = ({ inTabletOrOverlay }) => {
  const { t } = useTranslation();
  return (
    <Layer>
      <Tile
        className={classNames(styles.emptySearchResultsTile, {
          [styles.paddedEmptySearchResultsTile]: inTabletOrOverlay,
        })}>
        <EmptyDataIllustration />
        <div>
          <p className={styles.errorMessage}>{`${t('error', 'Error')}`}</p>
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

export const SearchResultsEmptyState: React.FC<CommonProps> = ({ inTabletOrOverlay, searchMode, searchTerm }) => {
  const { t } = useTranslation();
  const isMPIEnabled = useFeatureFlag('mpiFlag');
  const isSearchPage = window.location.pathname === '/openmrs/spa/search';
  return (
    <Layer>
      <Tile
        className={classNames(styles.emptySearchResultsTile, {
          [styles.paddedEmptySearchResultsTile]: inTabletOrOverlay,
        })}>
        <EmptyDataIllustration />
        <p className={styles.emptyResultText}>
          {t('noPatientChartsFoundMessage', 'Sorry, no patient charts were found')}
        </p>
        {isMPIEnabled && isSearchPage ? (
          <>
            <div className={styles.dividerWrapper}>
              <div className={styles.divider}></div>
            </div>
            {(searchMode === undefined || searchMode === null || searchMode !== 'external') && (
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

export const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({ searchResults, searchMode }) => {
  return (
    <div className={styles.results} data-openmrs-role="Search Results">
      {searchResults.map((patient, indx) => (
        <PatientBanner
          key={indx}
          patientUuid={patient.uuid}
          patient={patient}
          isMPIPatient={searchMode == 'external'}
        />
      ))}
    </div>
  );
};

function doMPISearch(searchTerm: string) {
  navigate({
    to: '${openmrsSpaBase}/search?query=${searchTerm}&mode=external',
    templateParams: { searchTerm: searchTerm },
  });
}
