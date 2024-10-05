import React from 'react';
import EmptyBed from '../empty-bed.component';
import { type WardPatient, type Bed } from '../../types';
import DefaultWardOccupiedBed from './default-ward-occupied-bed.component';
export interface WardBedProps {
  wardPatients: Array<WardPatient>;
  bed: Bed;
}

const DefaultWardBed: React.FC<WardBedProps> = ({ bed, wardPatients }) => {
  return wardPatients?.length > 0 ? (
    <DefaultWardOccupiedBed bed={bed} wardPatients={wardPatients} />
  ) : (
    <EmptyBed bed={bed} />
  );
};

export default DefaultWardBed;
