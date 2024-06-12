import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import EmptyBed from '../beds/empty-bed.component';
import { type Bed } from '../types';
import OccupiedBed from '../beds/occupied-bed.component';

interface WardBedProps {
  bed: Bed;
  patients: Patient[];
}

const WardBed: React.FC<WardBedProps> = ({ bed, patients }) => {
  return patients?.length > 0 ? 
    <OccupiedBed bed={bed} patients={patients} />
    : <EmptyBed bed={bed} />;
};

export default WardBed;
