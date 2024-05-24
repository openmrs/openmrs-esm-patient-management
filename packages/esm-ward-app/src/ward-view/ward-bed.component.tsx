import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import styles from './ward-view.scss';
import { type Bed } from '../types';
import EmptyBed from '../empty-beds/empty-bed.component';

interface WardBedProps {
  bed: Bed;
  patients: Patient[];
}

const WardBed = ({ bed, patients }: WardBedProps) => {
  const { bedNumber } = bed;

  return <>{patients?.length > 0 ? <div></div> : <EmptyBed bedNumber={bedNumber} />}</>;
};

export default WardBed;
