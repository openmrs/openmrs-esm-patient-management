import React from 'react';
import { type InpatientAdmission } from '../../types';

export interface WardPatientIdentifierProps {
  inpatientAdmission: InpatientAdmission;
}

const WardPatientLocation: React.FC<WardPatientIdentifierProps> = ({ inpatientAdmission }) => {
  const locationDisplay = inpatientAdmission?.encounterAssigningToCurrentInpatientLocation.location?.display;
  return locationDisplay ? (
    <div>
      <span>{locationDisplay}</span>
    </div>
  ) : (
    <></>
  );
};

export default WardPatientLocation;
