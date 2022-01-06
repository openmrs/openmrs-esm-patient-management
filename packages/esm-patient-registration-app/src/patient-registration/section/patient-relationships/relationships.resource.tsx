import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

const customRepresentation =
  'custom:(display,uuid,' +
  'personA:(uuid,display,person:(age,display)),' +
  'personB:(uuid,display,person:(age,display)),' +
  'relationshipType:(uuid,display,description,aIsToB,bIsToA))';

export async function getPatientRelationships(patientUuid: string) {
  const response = await openmrsFetch<RelationshipsResponse>(
    `/ws/rest/v1/relationship?v=${customRepresentation}&person=${patientUuid}`,
  );
  if (response.ok) {
    const relationships = response?.data?.results;
    return relationships.map((r) =>
      r.personA.uuid === patientUuid
        ? {
            relatedPerson: r.personB.person.display,
            relationshipType: r.relationshipType.bIsToA,
            relationship: `${r.relationshipType.uuid}/bIsToA`,
          }
        : {
            relatedPerson: r.personB.person.display,
            relationshipType: r.relationshipType.aIsToB,
            relationship: `${r.relationshipType.uuid}/aIsToB`,
          },
    );
  }
  return null;
}

function extractRelationshipData(
  patientIdentifier: string,
  relationships: Array<Relationship>,
): Array<ExtractedRelationship> {
  const relationshipsData = [];
  for (const r of relationships) {
    if (patientIdentifier === r.personA.uuid) {
      relationshipsData.push({
        uuid: r.uuid,
        display: r.personB.person.display,
        relativeAge: r.personB.person.age,
        relativeUuid: r.personB.uuid,
        relationshipType: r.relationshipType,
        direction: 'bIsToA',
      });
    } else {
      relationshipsData.push({
        uuid: r.uuid,
        display: r.personA.person.display,
        relativeAge: r.personA.person.age,
        relativeUuid: r.personA.uuid,
        relationshipType: r.relationshipType.aIsToB,
        direction: 'aIsToB',
      });
    }
  }
  return relationshipsData;
}

export interface Relationship {
  display: string;
  uuid: number;
  personA: {
    uuid: string;
    person: {
      age: number;
      display: string;
    };
  };
  personB: {
    uuid: string;
    person: {
      age: number;
      display: string;
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

interface ExtractedRelationship {
  uuid: string;
  display: string;
  relativeAge: number;
  relativeUuid: string;
  relationshipType: Relationship['relationshipType'];
  direction?: string;
}
