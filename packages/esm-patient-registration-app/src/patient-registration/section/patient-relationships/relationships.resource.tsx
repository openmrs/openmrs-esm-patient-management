import { openmrsFetch } from '@openmrs/esm-framework';
import { FormValues } from '../../patient-registration-types';

const customRepresentation =
  'custom:(display,uuid,' +
  'personA:(uuid,display,person:(age,display,birthdate,uuid)),' +
  'personB:(uuid,display,person:(age,display,birthdate,uuid)),' +
  'relationshipType:(uuid,display,description,aIsToB,bIsToA))';

export async function getPatientRelationships(patientUuid: string): Promise<FormValues['relationships']> {
  const response = await openmrsFetch<RelationshipsResponse>(
    `/ws/rest/v1/relationship?v=${customRepresentation}&person=${patientUuid}`,
  );
  if (response.ok) {
    const relationships = response?.data?.results;
    return relationships.map((r) =>
      r.personA.uuid === patientUuid
        ? {
            relatedPersonName: r.personB.person.display,
            relatedPersonUuid: r.personB.person.uuid,
            relationshipType: r.relationshipType.bIsToA,
            relationship: `${r.relationshipType.uuid}/bIsToA`,
            action: 'UPDATE',
            uuid: r.uuid,
          }
        : {
            relatedPersonName: r.personA.person.display,
            relatedPersonUuid: r.personA.person.display,
            relationshipType: r.relationshipType.aIsToB,
            relationship: `${r.relationshipType.uuid}/aIsToB`,
            action: 'UPDATE',
            uuid: r.uuid,
          },
    );
  }
  return null;
}

export interface Relationship {
  display: string;
  uuid: string;
  personA: {
    uuid: string;
    person: {
      age: number;
      display: string;
      birthdate: string;
      uuid: string;
    };
  };
  personB: {
    uuid: string;
    person: {
      age: number;
      display: string;
      birthdate: string;
      uuid: string;
    };
  };
  relationshipType: {
    uuid: string;
    display: string;
    aIsToB: string;
    bIsToA: string;
  };
}

interface RelationshipsResponse {
  results: Array<Relationship>;
}
