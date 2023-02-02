import { FetchResponse, openmrsFetch, showToast } from '@openmrs/esm-framework';
import { RelationshipValue } from '../../patient-registration-types';
import useSWR from 'swr';
import { useMemo } from 'react';
import { personRelationshipRepresentation } from '../../../constants';

export function useInitialPatientRelationships(patientUuid: string): {
  data: Array<RelationshipValue>;
  isLoading: boolean;
} {
  const shouldFetch = !!patientUuid;
  const { data, error, isLoading } = useSWR<FetchResponse<RelationshipsResponse>, Error>(
    shouldFetch ? `/ws/rest/v1/relationship?v=${personRelationshipRepresentation}&person=${patientUuid}` : null,
    openmrsFetch,
  );

  const result = useMemo(() => {
    const relationships: Array<RelationshipValue> | undefined = data?.data?.results.map((r) =>
      r.personA.uuid === patientUuid
        ? {
            relatedPersonName: r.personB.display,
            relatedPersonUuid: r.personB.uuid,
            relation: r.relationshipType.bIsToA,
            relationshipType: `${r.relationshipType.uuid}/bIsToA`,
            /**
             * Value kept for restoring initial value
             */
            initialrelationshipTypeValue: `${r.relationshipType.uuid}/bIsToA`,
            uuid: r.uuid,
          }
        : {
            relatedPersonName: r.personA.display,
            relatedPersonUuid: r.personA.uuid,
            relation: r.relationshipType.aIsToB,
            relationshipType: `${r.relationshipType.uuid}/aIsToB`,
            /**
             * Value kept for restoring initial value
             */
            initialrelationshipTypeValue: `${r.relationshipType.uuid}/aIsToB`,
            uuid: r.uuid,
          },
    );
    return {
      data: relationships,
      error,
      isLoading,
    };
  }, [patientUuid, data, error]);

  return result;
}

export interface Relationship {
  display: string;
  uuid: string;
  personA: {
    age: number;
    display: string;
    birthdate: string;
    uuid: string;
  };
  personB: {
    age: number;
    display: string;
    birthdate: string;
    uuid: string;
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
