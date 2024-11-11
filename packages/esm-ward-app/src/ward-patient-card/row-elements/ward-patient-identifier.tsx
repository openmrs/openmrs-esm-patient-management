import { type Patient, type PatientIdentifier, PatientBannerPatientIdentifier } from '@openmrs/esm-framework';
import React from 'react';
import { useElementConfig } from '../../ward-view/ward-view.resource';

export interface WardPatientIdentifierProps {
  patient: Patient;
  id?: string;
}

const WardPatientIdentifier: React.FC<WardPatientIdentifierProps> = ({ id, patient }) => {
  const config = useElementConfig('patientIdentifier', id);

  const fhirIdentifiers: fhir.Identifier[] = patient.identifiers.map((identifier: PatientIdentifier) => ({
    value: identifier.identifier,
    type: {
      text: identifier.identifierType.name,
      coding: [
        {
          code: identifier.identifierType.uuid,
        },
      ],
    },
  }));

  return (
    <PatientBannerPatientIdentifier identifier={fhirIdentifiers} showIdentifierLabel={config?.showIdentifierLabel} />
  );
};

export default WardPatientIdentifier;
