import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './patient-search-lg.scss';
import { Layer, Tile, Button } from '@carbon/react';
import EmptyDataIllustration from '../ui-components/empty-data-illustration.component';
import PatientBanner, { PatientBannerSkeleton } from './patient-banner/banner/patient-banner.component';
import { MPIConfig, SearchedPatient, SearchMode } from '../types';
import UserSearchIllustration from '../mpi/components/user-search-illustration';
import { Search } from '@carbon/react/icons';
import { doMPISearch } from '../mpi/utils';

interface EmptyQueryIllustrationProps {
  inTabletOrOverlay: boolean;
}

export const EmptyQueryIllustration: React.FC<EmptyQueryIllustrationProps> = ({ inTabletOrOverlay }) => {
  const { t } = useTranslation();
  return (
    <Layer>
      <Tile className={`${styles.emptySearchResultsTile} ${inTabletOrOverlay && styles.paddedEmptySearchResultsTile}`}>
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
    </Layer>
  );
};

interface LoadingSearchResultsProps {}

export const LoadingSearchResults: React.FC<LoadingSearchResultsProps> = () => {
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

interface FetchErrorIllustrationProps {
  inTabletOrOverlay: boolean;
}

export const FetchErrorIllustration: React.FC<FetchErrorIllustrationProps> = ({ inTabletOrOverlay }) => {
  const { t } = useTranslation();
  return (
    <Layer>
      <Tile className={`${styles.emptySearchResultsTile} ${inTabletOrOverlay && styles.paddedEmptySearchResultsTile}`}>
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

interface EmptySearchResultsIllustrationProps {
  inTabletOrOverlay: boolean;
  searchTerm: string;
  searchMode: SearchMode;
  mpiConfig?: MPIConfig;
}

export const EmptySearchResultsIllustration: React.FC<EmptySearchResultsIllustrationProps> = ({
  inTabletOrOverlay,
  searchTerm,
  searchMode,
  mpiConfig,
}) => {
  const { t } = useTranslation();
  const { isMPIEnabled, title } = mpiConfig;
  return (
    <Layer>
      <Tile className={`${styles.emptySearchResultsTile} ${inTabletOrOverlay && styles.paddedEmptySearchResultsTile}`}>
        <UserSearchIllustration />
        <div className={styles.emptyResultsMarginRules}>
          <p>
            {t('noResultsFoundTitle', 'Sorry, no results found matching ')}{' '}
            <span className={styles.searchTermEmphasized}>{`"${searchTerm}"`}</span>
          </p>
        </div>
        <div className={styles.dividerWrapper}>
          <div className={styles.divider}></div>
        </div>
        {searchMode == 'Internal' && (
          <>
            <div className={styles.emptyResultsMarginRules}>
              <p>
                {t('trySearchFromClientRegistry', 'You can try searching for patients registred at another location.')}
              </p>
            </div>
            <div className={styles.emptyResultsMarginRules}>
              <Button
                kind="ghost"
                renderIcon={Search}
                onClick={(e) => {
                  e.preventDefault();
                  doMPISearch(searchTerm);
                }}>
                {`${t('search', 'Search')} ${title}`}
              </Button>
            </div>
          </>
        )}
        {searchMode == 'External' && (
          <div className={styles.emptyResultsMarginRules}>
            <p>{t('checkYourSearchMessage', 'Please check your search and try again')}</p>
          </div>
        )}
      </Tile>
    </Layer>
  );
};

interface PatientSearchResultsProps {
  searchResults: SearchedPatient[];
  handlePatientSelection: (evt: any, patientUuid: string) => void;
  searchMode: SearchMode;
  mpiConfig: MPIConfig;
}

export const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({
  searchResults,
  handlePatientSelection,
  searchMode,
  mpiConfig,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.results}>
        {searchResults.map((patient, indx) => (
          <PatientBanner
            key={indx}
            selectPatientAction={handlePatientSelection}
            patientUuid={patient.uuid}
            patient={patient}
            isMPIPatient={searchMode == 'External'}
            mpiConfig={mpiConfig}
          />
        ))}
      </div>
    </div>
  );
};
