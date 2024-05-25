import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import EmptyBed from '../empty-beds/empty-bed.component';
import { type Bed } from '../types';

interface WardBedProps {
  bed: Bed;
  patients: Patient[];
}

const WardBed = ({ bed, patients }: WardBedProps) => {
  return <>{patients?.length > 0 ? <div></div> : <EmptyBed bed={bed} />}</>;
};

export default WardBed;
