import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import styles from './ward-view.scss';
import AdmittedPatientHeader from '../admitted-patient/admitted-patient-header.component';
import { type Bed } from '../types';

interface WardBedProps {
  bed: Bed;
  patients: Patient[];
}

const WardBed = (props: WardBedProps) => {
  const { bed, patients } = props;
  const { bedNumber } = bed;

  if (patients?.length > 0) {
    return (
      <div className={styles.wardBed}>
        {patients.map((patient) => (
          <div key={patient.uuid}>
            <AdmittedPatientHeader bed={bed} patient={patient} />
          </div>
        ))}
      </div>
    );
  } else {
    return <div className={styles.wardBed}>{bedNumber} Empty bed</div>;
  }
};

export default WardBed;
