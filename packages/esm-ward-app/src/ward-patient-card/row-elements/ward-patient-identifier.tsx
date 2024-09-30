import { type Patient, type PatientIdentifier, PatientBannerPatientIdentifier } from '@openmrs/esm-framework';
import React from 'react';
import { type IdentifierElementDefinition } from '../../config-schema';

/** Sort the identifiers by preferred first. The identifier with value of true
 * takes precedence over false. If both identifiers have same preferred value,
 * sort them by most recently created or changed. */
const identifierCompareFunction = (pi1: PatientIdentifier, pi2: PatientIdentifier) => {
  let comp = (pi2.preferred ? 1 : 0) - (pi1.preferred ? 1 : 0);

  if (comp == 0) {
    const date1 = pi1.auditInfo.dateChanged ?? pi1.auditInfo.dateCreated;
    const date2 = pi2.auditInfo.dateChanged ?? pi2.auditInfo.dateCreated;
    comp = date2.localeCompare(date1);
  }
  return comp;
};

export interface WardPatientIdentifierProps {
  patient: Patient;
  /** If the config is not passed, this will be the default identifier element, which uses the preferred identifier type. */
  config?: IdentifierElementDefinition;
}

const WardPatientIdentifier: React.FC<WardPatientIdentifierProps> = ({ config, patient }) => {
  
  const fhirIdentifiers : fhir.Identifier[] = patient.identifiers.map((identifier: PatientIdentifier) => ({
    value: identifier.identifier,
    type: {
      text: identifier.identifierType.name,
      coding: [
        {
          code: identifier.identifierType.uuid
        }
      ]
    }
  }));

  return <PatientBannerPatientIdentifier identifier={fhirIdentifiers} showIdentifierLabel={config?.showIdentifierLabel}/>
};

export default WardPatientIdentifier;
