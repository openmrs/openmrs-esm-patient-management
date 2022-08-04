import React, { useMemo, useState } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './search-results.scss';

interface SearchResultsProps {
  patients: Array<fhir.Patient>;
  hidePanel?: any;
}

const SearchResults: React.FC<SearchResultsProps> = ({ patients }) => {
  return (
    <>
      {patients.map((patient) => (
        <div key={patient.id} className={styles.patientChart}>
          <div className={styles.container}>
            <ExtensionSlot
              extensionSlotName="patient-header-slot"
              state={{
                patient,
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default SearchResults;
