import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

const customRepresentation =
  'custom:(display,uuid,' +
  'personA:(uuid,display,person:(age,display)),' +
  'personB:(uuid,display,person:(age,display)),' +
  'relationshipType:(uuid,display,description,aIsToB,bIsToA))';

export function useRelationships(patientUuid: string) {
  const { data, error, isValidating } = useSWR<{ data: RelationshipsResponse }, Error>(
    `/ws/rest/v1/relationship?v=${customRepresentation}&person=${patientUuid}`,
    openmrsFetch,
  );

  const formattedRelationships = data?.data?.results?.length
    ? extractRelationshipData(patientUuid, data.data.results)
    : null;

  return {
    data: data ? formattedRelationships : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
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
        relationshipType: r.relationshipType.bIsToA,
      });
    } else {
      relationshipsData.push({
        uuid: r.uuid,
        display: r.personA.person.display,
        relativeAge: r.personA.person.age,
        relativeUuid: r.personA.uuid,
        relationshipType: r.relationshipType.aIsToB,
      });
    }
  }
  return relationshipsData;
}

interface RelationshipsResponse {
  results: Array<Relationship>;
}

interface ExtractedRelationship {
  uuid: string;
  display: string;
  relativeAge: number;
  relativeUuid: string;
  relationshipType: string;
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
