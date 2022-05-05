import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { Grid, Row } from 'carbon-components-react';
import { ExtensionSlot, Session } from '@openmrs/esm-framework';
import {
  fetchAddressTemplate,
  fetchAllRelationshipTypes,
  fetchCurrentSession,
  fetchPatientIdentifierTypesWithSources,
  Resources,
  ResourcesContext,
} from './offline.resources';
import { SavePatientForm } from './patient-registration/form-manager';
import { PatientRegistration, PatientRegistrationProps } from './patient-registration/patient-registration.component';
import useSWR from 'swr';

export interface RootProps extends PatientRegistrationProps, Resources {
  savePatientForm: SavePatientForm;
  isOffline: boolean;
}

export default function Root({ savePatientForm, isOffline }: RootProps) {
  const { data: currentSession } = useSWR<Session, Error>('patientRegistrationCurrentSessionInfo', fetchCurrentSession);
  const { data: addressTemplate } = useSWR('patientRegistrationAddressTemplate', fetchAddressTemplate);
  const { data: relationshipTypes } = useSWR('patientRegistrationRelationshipTypes', fetchAllRelationshipTypes);
  const { data: identifierTypes } = useSWR(
    'patientRegistrationPatientIdentifiers',
    fetchPatientIdentifierTypesWithSources,
  );

  return (
    <ResourcesContext.Provider
      value={{
        currentSession,
        addressTemplate,
        relationshipTypes,
        identifierTypes,
      }}>
      <BrowserRouter basename={window['getOpenmrsSpaBase']()}>
        <main className="omrs-main-content" style={{ backgroundColor: 'white' }}>
          <Grid>
            <Row>
              <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
            </Row>
            <Route
              exact
              path="/patient-registration"
              render={(props) => (
                <PatientRegistration savePatientForm={savePatientForm} isOffline={isOffline} {...props} />
              )}
            />
            <Route
              exact
              path="/patient/:patientUuid/edit"
              render={(props) => (
                <PatientRegistration savePatientForm={savePatientForm} isOffline={isOffline} {...props} />
              )}
            />
          </Grid>
        </main>
      </BrowserRouter>
    </ResourcesContext.Provider>
  );
}
