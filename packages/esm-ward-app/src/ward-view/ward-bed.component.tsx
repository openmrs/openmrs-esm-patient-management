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

const WardBed = (props: WardBedProps) => {
  const { bed, patients } = props;
  const { bedNumber } = bed;

  return (
    <>
      {patients && patients.length > 0 ? (
        patients.map((patient) => (
          <div className={styles.wardBed}>
            <div key={patient.uuid}>
              <AdmittedPatient bed={bed} patient={patient} />
            </div>
          </div>
        ))
      ) : (
        <EmptyBed bedNum={bedNumber.slice(3)} />
      )}
    </>
  );
};

export default WardBed;
