import React, { useEffect, useState } from 'react';
import styles from './patient-search-result.scss';
import { ExtensionSlot, useConfig, fetchCurrentPatient, interpolateString } from '@openmrs/esm-framework';
import { SearchedPatient } from '../types/index';

const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({ patients, hidePanel }) => {
  const [fhirPatients, setFhirPatients] = useState([]);
  const config = useConfig();

  useEffect(() => {
    const fhirPatientsBuffer = [];
    patients.forEach((patient) => {
      fetchCurrentPatient(patient.uuid).then((response) => {
        fhirPatientsBuffer.push(response.data);
        setFhirPatients([...fhirPatientsBuffer]);
      });
    });
  }, [patients]);

  function renderPatient(patient) {
    return (
      <div key={patient.display} className={styles.patientChart}>
        <div className={styles.container}>
          <ExtensionSlot
            extensionSlotName="patient-header-slot"
            state={{
              patient,
              patientUuid: patient.id,
              patientUrl: interpolateString(config.search.patientResultUrl, {
                patientUuid: patient.id,
              }),
              hidePatientSearchPanel: hidePanel,
            }}
          />
        </div>
      </div>
    );
  }
  return <>{fhirPatients.map((patient) => renderPatient(patient))}</>;
};

interface PatientSearchResultsProps {
  patients: Array<SearchedPatient>;
  hidePanel?: any;
}

export default PatientSearchResults;
