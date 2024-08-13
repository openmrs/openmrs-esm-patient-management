import React from 'react';
import { type ObsElementDefinition } from '../../config-schema';
import { type WardPatientCard } from '../../types';
import WardPatientObs from '../row-elements/ward-patient-obs';
import { useConfig } from '@openmrs/esm-framework';

const AdmissionRequestNoteRowExtension: WardPatientCard = ({ patient, visit, inpatientAdmission }) => {
  const { conceptUuid } = useConfig<ObsElementDefinition>();
  const config: ObsElementDefinition = {
    conceptUuid,
    limit: 0,
    id: 'admission-note',
    onlyWithinCurrentVisit: true,
    orderBy: 'ascending',
    label: 'Admission Note',
  };

  // only show if the patient has not been admitted yet
  const admitted = inpatientAdmission != null;
  if (admitted) {
    return <></>;
  } else {
    return <WardPatientObs config={config} patient={patient} visit={visit} />;
  }
};

export default AdmissionRequestNoteRowExtension;
