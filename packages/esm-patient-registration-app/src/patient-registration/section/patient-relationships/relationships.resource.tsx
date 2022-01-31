import { openmrsFetch } from '@openmrs/esm-framework';
import { RelationshipValue } from '../../patient-registration-types';

const customRepresentation =
  'custom:(display,uuid,' +
  'personA:(uuid,display,person:(age,display,birthdate,uuid)),' +
  'personB:(uuid,display,person:(age,display,birthdate,uuid)),' +
  'relationshipType:(uuid,display,description,aIsToB,bIsToA))';

export async function getInitialPatientRelationships(patientUuid: string): Promise<Array<RelationshipValue>> {
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
            relation: r.relationshipType.bIsToA,
            relationshipType: `${r.relationshipType.uuid}/bIsToA`,
            /**
             * Value kept for restoring initial value
             */
            initialrelationshipTypeValue: `${r.relationshipType.uuid}/bIsToA`,
            uuid: r.uuid,
          }
        : {
            relatedPersonName: r.personA.person.display,
            relatedPersonUuid: r.personA.person.display,
            relation: r.relationshipType.aIsToB,
            relationshipType: `${r.relationshipType.uuid}/aIsToB`,
            /**
             * Value kept for restoring initial value
             */
            initialrelationshipTypeValue: `${r.relationshipType.uuid}/aIsToB`,
            uuid: r.uuid,
          },
    );
  }
  return [];
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
