import { request } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * This configuration is to reuse the signed-in state in the tests
 * by log in only once using the API and then skip the log in step for all the tests.
 *
 * https://playwright.dev/docs/auth#reuse-signed-in-state
 */

async function globalSetup() {
  const requestContext = await request.newContext();
  const token = Buffer.from(`${process.env.E2E_USER_ADMIN_USERNAME}:${process.env.E2E_USER_ADMIN_PASSWORD}`).toString(
    'base64',
  );
  const emrConfigurationResponse = await requestContext.get(
    `${process.env.E2E_BASE_URL}/ws/rest/v1/emrapi/configuration?v=custom:metadataSourceName:ref,orderingProviderEncounterRole:ref,supportsTransferLocationTag:(uuid,display,name,links),unknownLocation:ref,denyAdmissionConcept:ref,admissionForm:ref,exitFromInpatientEncounterType:ref,extraPatientIdentifierTypes:ref,consultFreeTextCommentsConcept:ref,sameAsConceptMapType:ref,testPatientPersonAttributeType:ref,admissionDecisionConcept:ref,supportsAdmissionLocationTag:(uuid,display,name,links),checkInEncounterType:ref,transferWithinHospitalEncounterType:ref,suppressedDiagnosisConcepts:ref,primaryIdentifierType:ref,nonDiagnosisConceptSets:ref,fullPrivilegeLevel:ref,unknownProvider:ref,diagnosisSets:ref,personImageDirectory:ref,visitNoteEncounterType:ref,inpatientNoteEncounterType:ref,transferRequestEncounterType:ref,consultEncounterType:ref,diagnosisMetadata:ref,narrowerThanConceptMapType:ref,clinicianEncounterRole:ref,conceptSourcesForDiagnosisSearch:ref,patientDiedConcept:ref,emrApiConceptSource:ref,lastViewedPatientSizeLimit:ref,identifierTypesToSearch:ref,telephoneAttributeType:ref,checkInClerkEncounterRole:ref,dischargeForm:ref,unknownCauseOfDeathConcept:ref,visitAssignmentHandlerAdjustEncounterTimeOfDayIfNecessary:ref,atFacilityVisitType:ref,visitExpireHours:ref,admissionEncounterType:ref,motherChildRelationshipType:ref,dispositions:ref,dispositionDescriptor:ref,highPrivilegeLevel:ref,supportsLoginLocationTag:(uuid,display,name,links),unknownPatientPersonAttributeType:ref,supportsVisitsLocationTag:(uuid,display,name,links),transferForm:ref,bedAssignmentEncounterType:ref,cancelADTRequestEncounterType:ref,admissionDecisionConcept:ref,denyAdmissionConcept:ref`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`,
      },
    },
  );
  const emrConfigurationData = await emrConfigurationResponse.json();
  await writeFile('e2e/.emr-configuration.json', JSON.stringify(emrConfigurationData ?? {}, null, 2));

  const session = await requestContext.post(`${process.env.E2E_BASE_URL}/ws/rest/v1/session`, {
    data: {
      sessionLocation: process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      locale: 'en',
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  const sessionData = await session.json();
  const currentProviderUuid = sessionData?.currentProvider?.uuid;

  if (!currentProviderUuid) {
    throw new Error('Unable to determine the current provider UUID from the session response.');
  }
  await writeFile('e2e/.current-provider-uuid.json', JSON.stringify({ currentProviderUuid }, null, 2));

  await requestContext.storageState({ path: 'e2e/storageState.json' });
  await requestContext.dispose();
}

export default globalSetup;
