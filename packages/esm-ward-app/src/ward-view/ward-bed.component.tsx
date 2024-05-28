import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import EmptyBed from '../empty-beds/empty-bed.component';
import { type Bed } from '../types';
import AdmittedPatient from '../admitted-patient/admitted-patient';

interface WardBedProps {
  bed: Bed;
  patients: Patient[];
}

const WardBed = ({ bed, patients }: WardBedProps) => {
  // return <>{patients?.length > 0 ? <div></div> : <EmptyBed bed={bed} />}</>;
  return <AdmittedPatient />;
};

export default WardBed;
