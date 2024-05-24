import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import styles from './ward-view.scss';
import { type Bed } from '../types';
import AdmittedPatient from '../admitted-patient/admitted-patient.component';
import EmptyBed from '../empty-beds/empty-bed.component';

interface WardBedProps {
  bed: Bed;
  patients: Patient[];
}

const WardBed = ({ bed, patients }: WardBedProps) => {
  const { bedNumber } = bed;

  return (
    <>
      {patients?.length > 0 ? (
        patients.map((patient) => (
          <div key={patient.uuid} className={styles.wardBed}>
            <AdmittedPatient bed={bed} patient={patient} />
          </div>
        ))
      ) : (
        <EmptyBed bedNumber={bedNumber} />
      )}
    </>
  );
};

export default WardBed;
