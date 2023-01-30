import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Grid, Row } from '@carbon/react';
import { ExtensionSlot, useSession } from '@openmrs/esm-framework';
import {
  Resources,
  ResourcesContext,
  fetchAddressTemplate,
  fetchAllRelationshipTypes,
  fetchPatientIdentifierTypesWithSources,
} from './offline.resources';
import { SavePatientForm } from './patient-registration/form-manager';
import { PatientRegistration, PatientRegistrationProps } from './patient-registration/patient-registration.component';
import useSWRImmutable from 'swr/immutable';
import styles from './root.scss';
import PatientVerificationSearch from './patient-verification/verification-search/patient-verification-search.component';
export interface RootProps extends PatientRegistrationProps, Resources {
  savePatientForm: SavePatientForm;
  isOffline: boolean;
}

export default function Root({ savePatientForm, isOffline }: RootProps) {
  const currentSession = useSession();
  const { data: addressTemplate } = useSWRImmutable('patientRegistrationAddressTemplate', fetchAddressTemplate);
  const { data: relationshipTypes } = useSWRImmutable(
    'patientRegistrationRelationshipTypes',
    fetchAllRelationshipTypes,
  );
  const { data: identifierTypes } = useSWRImmutable(
    'patientRegistrationPatientIdentifiers',
    fetchPatientIdentifierTypesWithSources,
  );

  return (
    <main className={`omrs-main-content ${styles.root}`}>
      <Grid className={styles.grid}>
        <Row>
          <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
        </Row>
        <ResourcesContext.Provider
          value={{
            addressTemplate,
            relationshipTypes,
            identifierTypes,
            currentSession,
          }}>
          <BrowserRouter basename={`${window['getOpenmrsSpaBase']()}`}>
            <Routes>
              <Route
                path="patient-registration"
                element={<PatientRegistration savePatientForm={savePatientForm} isOffline={isOffline} />}
              />
              <Route path="patient-registration/patient-verification" element={<PatientVerificationSearch />} />
              <Route
                path="patient/:patientUuid/edit"
                element={<PatientRegistration savePatientForm={savePatientForm} isOffline={isOffline} />}
              />
            </Routes>
          </BrowserRouter>
        </ResourcesContext.Provider>
      </Grid>
    </main>
  );
}
