import { type FetchResponse, openmrsFetch, type OpenmrsResource, restBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import type { DispositionType } from '../types';

interface LocationTag extends OpenmrsResource {
  name: string;
}

interface EmrApiConfigurationResponse {
  admissionEncounterType: OpenmrsResource;
  clinicianEncounterRole: OpenmrsResource;
  consultFreeTextCommentsConcept: OpenmrsResource;
  visitNoteEncounterType: OpenmrsResource;
  inpatientNoteEncounterType: OpenmrsResource;
  transferRequestEncounterType: OpenmrsResource;
  transferWithinHospitalEncounterType: OpenmrsResource;
  exitFromInpatientEncounterType: OpenmrsResource;
  supportsTransferLocationTag: LocationTag;
  supportsAdmissionLocationTag: LocationTag;
  supportsLoginLocationTag: LocationTag;
  supportsVisitsLocationTag: LocationTag;
  dispositionDescriptor: {
    admissionLocationConcept: OpenmrsResource;
    dateOfDeathConcept: OpenmrsResource;
    dispositionConcept: OpenmrsResource;
    internalTransferLocationConcept: OpenmrsResource;
    dispositionSetConcept: OpenmrsResource;
  };
  dispositions: Array<{
    encounterTypes: null;
    keepsVisitOpen: null;
    additionalObs: null;
    careSettingTypes: ['OUTPATIENT'];
    name: string;
    conceptCode: string;
    type: DispositionType;
    actions: [];
    excludedEncounterTypes: Array<string>;
    uuid: string;
  }>;
  bedAssignmentEncounterType: OpenmrsResource;
  cancelADTRequestEncounterType: OpenmrsResource;
  denyAdmissionConcept: OpenmrsResource;
  admissionDecisionConcept: OpenmrsResource;
  // There are many more keys to this object, but we only need these for now
  // Add more keys as needed
}

const customRepProps = [
  ['metadataSourceName', 'ref'],
  ['orderingProviderEncounterRole', 'ref'],
  ['supportsTransferLocationTag', '(uuid,display,name,links)'],
  ['unknownLocation', 'ref'],
  ['denyAdmissionConcept', 'ref'],
  ['admissionForm', 'ref'],
  ['exitFromInpatientEncounterType', 'ref'],
  ['extraPatientIdentifierTypes', 'ref'],
  ['consultFreeTextCommentsConcept', 'ref'],
  ['sameAsConceptMapType', 'ref'],
  ['testPatientPersonAttributeType', 'ref'],
  ['admissionDecisionConcept', 'ref'],
  ['supportsAdmissionLocationTag', '(uuid,display,name,links)'],
  ['checkInEncounterType', 'ref'],
  ['transferWithinHospitalEncounterType', 'ref'],
  ['suppressedDiagnosisConcepts', 'ref'],
  ['primaryIdentifierType', 'ref'],
  ['nonDiagnosisConceptSets', 'ref'],
  ['fullPrivilegeLevel', 'ref'],
  ['unknownProvider', 'ref'],
  ['diagnosisSets', 'ref'],
  ['personImageDirectory', 'ref'],
  ['visitNoteEncounterType', 'ref'],
  ['inpatientNoteEncounterType', 'ref'],
  ['transferRequestEncounterType', 'ref'],
  ['consultEncounterType', 'ref'],
  ['diagnosisMetadata', 'ref'],
  ['narrowerThanConceptMapType', 'ref'],
  ['clinicianEncounterRole', 'ref'],
  ['conceptSourcesForDiagnosisSearch', 'ref'],
  ['patientDiedConcept', 'ref'],
  ['emrApiConceptSource', 'ref'],
  ['lastViewedPatientSizeLimit', 'ref'],
  ['identifierTypesToSearch', 'ref'],
  ['telephoneAttributeType', 'ref'],
  ['checkInClerkEncounterRole', 'ref'],
  ['dischargeForm', 'ref'],
  ['unknownCauseOfDeathConcept', 'ref'],
  ['visitAssignmentHandlerAdjustEncounterTimeOfDayIfNecessary', 'ref'],
  ['atFacilityVisitType', 'ref'],
  ['visitExpireHours', 'ref'],
  ['admissionEncounterType', 'ref'],
  ['motherChildRelationshipType', 'ref'],
  ['dispositions', 'ref'],
  ['dispositionDescriptor', 'ref'],
  ['highPrivilegeLevel', 'ref'],
  ['supportsLoginLocationTag', '(uuid,display,name,links)'],
  ['unknownPatientPersonAttributeType', 'ref'],
  ['supportsVisitsLocationTag', '(uuid,display,name,links)'],
  ['transferForm', 'ref'],
  ['bedAssignmentEncounterType', 'ref'],
  ['cancelADTRequestEncounterType', 'ref'],
  ['admissionDecisionConcept', 'ref'],
  ['denyAdmissionConcept', 'ref'],
];

const customRep = `custom:${customRepProps.map((prop) => prop.join(':')).join(',')}`;

export default function useEmrConfiguration() {
  const swrData = useSWRImmutable<FetchResponse<EmrApiConfigurationResponse>>(
    `${restBaseUrl}/emrapi/configuration?v=${customRep}`,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      emrConfiguration: swrData.data?.data,
      isLoadingEmrConfiguration: swrData.isLoading,
      mutateEmrConfiguration: swrData.mutate,
      errorFetchingEmrConfiguration: swrData.error,
    }),
    [swrData],
  );
  return results;
}
