import { type Visit, type Patient } from '@openmrs/esm-framework';
import React from 'react';
import EmptyBed from '../beds/empty-bed.component';
import { type WardPatient, type Bed } from '../types';
import OccupiedBed from '../beds/occupied-bed.component';
export interface WardBedProps {
  patientInfos: Array<WardPatient>;
  bed: Bed;
}

const WardBed: React.FC<WardBedProps> = ({ bed, patientInfos }) => {
  return patientInfos?.length > 0 ? <OccupiedBed bed={bed} patientInfos={patientInfos} /> : <EmptyBed bed={bed} />;
};

export default WardBed;
