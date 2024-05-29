import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import EmptyBed from '../empty-beds/empty-bed.component';
import { type Bed } from '../types';
import AdmittedPatient from '../admitted-patient/admitted-patient';

interface WardBedProps {
  bed: Bed;
  patients: Patient[];
}

const WardBed: React.FC<WardBedProps> = ({ bed, patients }) => {
  return patients?.length > 0 ? 
    <AdmittedPatient bed={bed} patients={patients} />
    : <EmptyBed bed={bed} />;
};

export default WardBed;
