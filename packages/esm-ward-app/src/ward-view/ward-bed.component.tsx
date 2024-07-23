import React from 'react';
import EmptyBed from '../beds/empty-bed.component';
import { type WardPatient, type Bed } from '../types';
import OccupiedBed from '../beds/occupied-bed.component';
export interface WardBedProps {
  wardPatients: Array<WardPatient>;
  bed: Bed;
}

const WardBed: React.FC<WardBedProps> = ({ bed, wardPatients }) => {
  return wardPatients?.length > 0 ? <OccupiedBed bed={bed} wardPatients={wardPatients} /> : <EmptyBed bed={bed} />;
};

export default WardBed;
