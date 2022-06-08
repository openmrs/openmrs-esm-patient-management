import React, { useCallback } from 'react';
import styles from './patient-search-result.scss';
import { ExtensionSlot, useConfig, interpolateString, navigate } from '@openmrs/esm-framework';

const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({ patients, hidePanel }) => {
  const config = useConfig();

  const onClickSearchResult = useCallback((patientUuid) => {
    navigate({
      to: interpolateString(config.search.patientResultUrl, {
        patientUuid: patientUuid,
      }),
    });
    hidePanel();
  }, []);

  return (
    <>
      {patients.map((patient) => (
        <div key={patient.id} className={styles.patientChart}>
          <div className={styles.container}>
            <ExtensionSlot
              extensionSlotName="patient-header-slot"
              state={{
                patient,
                patientUuid: patient.id,
                onClick: onClickSearchResult,
                onTransition: hidePanel,
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

interface PatientSearchResultsProps {
  patients: Array<fhir.Patient>;
  hidePanel?: any;
}

export default PatientSearchResults;
