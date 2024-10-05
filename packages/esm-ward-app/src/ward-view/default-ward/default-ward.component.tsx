import React from 'react';
import DefaultWardBeds from './default-ward-beds.component';
import Ward from '../ward.component';
import DefaultWardUnassignedPatients from './default-ward-unassigned-patients.component';

const DefaultWard = () => {
  const wardBeds = <DefaultWardBeds />;
  const wardUnassignedPatients = <DefaultWardUnassignedPatients />;
  return <Ward {...{ wardBeds, wardUnassignedPatients }} />;
};

export default DefaultWard;
