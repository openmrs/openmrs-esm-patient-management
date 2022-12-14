import React from 'react';
import { SearchedPatient } from '../types';
import styles from '../compact-patient-search/patient-search.scss';
import { useTranslation } from 'react-i18next';
import { useRESTPatient } from '../patient-search.resource';
import CompactPatientBanner, { SearchResultSkeleton } from '../compact-patient-search/compact-patient-banner.component';

interface RecentSearchProps {
  selectPatientAction: (evt, patient: SearchedPatient) => void;
  patientsVisited: Array<string>;
}

const RecentSearch: React.FC<RecentSearchProps> = ({ selectPatientAction, patientsVisited }) => {
  const { t } = useTranslation();

  if (patientsVisited?.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.searchResults}
      style={{
        maxHeight: '22rem',
      }}>
      <p className={styles.resultsText}>{t('recentlyViewedCharts', 'Recently viewed charts')}</p>
      {patientsVisited.map((patientUuid) => (
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
