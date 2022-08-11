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
import useSWR from 'swr';
import styles from './root.scss';
export interface RootProps extends PatientRegistrationProps, Resources {
  savePatientForm: SavePatientForm;
  isOffline: boolean;
}

export default function Root({ savePatientForm, isOffline }: RootProps) {
  const currentSession = useSession();
  const { data: addressTemplate } = useSWR('patientRegistrationAddressTemplate', fetchAddressTemplate);
  const { data: relationshipTypes } = useSWR('patientRegistrationRelationshipTypes', fetchAllRelationshipTypes);
  const { data: identifierTypes } = useSWR(
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
          <BrowserRouter basename={`${window['getOpenmrsSpaBase']()}patient-registration`}>
            <Routes>
              <Route
                path=""
                element={<PatientRegistration savePatientForm={savePatientForm} isOffline={isOffline} />}
              />
              <Route
                path="/patient/:patientUuid/edit"
                element={<PatientRegistration savePatientForm={savePatientForm} isOffline={isOffline} />}
              />
            </Routes>
          </BrowserRouter>
        </ResourcesContext.Provider>
      </Grid>
    </main>
  );
}
