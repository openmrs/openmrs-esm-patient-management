import React from 'react';
import { SearchedPatient } from '../types';
import styles from '../compact-patient-search/patient-search.scss';
import { useTranslation } from 'react-i18next';
import { useRESTPatient, useUserUuid } from '../patient-search.resource';
import CompactPatientBanner, { SearchResultSkeleton } from '../compact-patient-search/compact-patient-banner.component';

interface RecentSearchProps {
  selectPatientAction: (evt, patient: SearchedPatient) => void;
}

const RecentSearch: React.FC<RecentSearchProps> = ({ selectPatientAction }) => {
  const { t } = useTranslation();
  const { user, userUuid, isLoadingUser, patientsVisited } = useUserUuid();

  if (isLoadingUser || !patientsVisited) {
    return null;
  }

  const patientUuids = patientsVisited.split(',');

  return (
    <div
      className={styles.searchResults}
      style={{
        maxHeight: '22rem',
      }}>
      <p className={styles.resultsText}>
        {patientUuids?.length} {t('searchResultsText', 'search result(s)')}
      </p>
      {patientUuids.map((patientUuid) => (
        <RecentPatient key={patientUuid} patientUuid={patientUuid} selectPatientAction={selectPatientAction} />
      ))}
    </div>
  );
};

const RecentPatient = ({ patientUuid, selectPatientAction }) => {
  const { patient, isLoading: isLoadingPatient } = useRESTPatient(patientUuid);

  if (isLoadingPatient) {
    return <SearchResultSkeleton />;
  }

  return <CompactPatientBanner patient={patient} selectPatientAction={selectPatientAction} />;
};

export default RecentSearch;
