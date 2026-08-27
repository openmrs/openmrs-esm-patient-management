import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import { EmptyCardIllustration } from '@openmrs/esm-framework';
import { type SearchedPatient } from '../types';
import PatientBanner, { PatientBannerSkeleton } from './patient-banner/banner/patient-banner.component';
import styles from './patient-search-lg.scss';

interface PatientSearchResultsProps {
  searchResults: SearchedPatient[];
}

export const EmptyState: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layer>
      <Tile className={styles.emptySearchResultsTile}>
        <EmptyCardIllustration />
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
        <EmptyCardIllustration />
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

export const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({ searchResults }) => {
  return (
    <div data-openmrs-role="Search Results">
      {searchResults.map((patient) => (
        <PatientBanner key={patient.uuid} patientUuid={patient.uuid} patient={patient} />
      ))}
    </div>
  );
};
