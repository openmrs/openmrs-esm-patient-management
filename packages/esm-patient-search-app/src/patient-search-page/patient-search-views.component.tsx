import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import EmptyDataIllustration from '../ui-components/empty-data-illustration.component';
import PatientBanner, { PatientBannerSkeleton } from './patient-banner/banner/patient-banner.component';
import { SearchedPatient } from '../types';
import styles from './patient-search-lg.scss';

interface CommonProps {
  inTabletOrOverlay: boolean;
}

interface PatientSearchResultsProps {
  searchResults: SearchedPatient[];
  handlePatientSelection: (evt: any, patientUuid: string) => void;
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

export const SearchResultsEmptyState: React.FC<CommonProps> = ({ inTabletOrOverlay }) => {
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

export const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({
  searchResults,
  handlePatientSelection,
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.results}>
      {searchResults.map((patient, indx) => (
        <PatientBanner
          key={indx}
          selectPatientAction={handlePatientSelection}
          patientUuid={patient.uuid}
          patient={patient}
        />
      ))}
    </div>
  );
};
