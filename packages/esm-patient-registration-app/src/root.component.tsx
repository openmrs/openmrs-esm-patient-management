import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { Grid, Row } from 'carbon-components-react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { Resources, ResourcesContext } from './offline.resources';
import { SavePatientForm } from './patient-registration/form-manager';
import { PatientRegistration, PatientRegistrationProps } from './patient-registration/patient-registration.component';

export interface RootProps extends PatientRegistrationProps, Resources {
  savePatientForm: SavePatientForm;
}

export default function Root({
  currentSession,
  addressTemplate,
  relationshipTypes,
  patientIdentifiers,
  savePatientForm,
}: RootProps) {
  const resources = {
    currentSession,
    addressTemplate,
    relationshipTypes,
    patientIdentifiers,
  };

  return (
    <ResourcesContext.Provider value={resources}>
      <BrowserRouter basename={window['getOpenmrsSpaBase']()}>
        <main className="omrs-main-content" style={{ backgroundColor: 'white' }}>
          <Grid>
            <Row>
              <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
            </Row>
            <Route
              exact
              path="/patient-registration"
              render={(props) => <PatientRegistration savePatientForm={savePatientForm} {...props} />}
            />
            <Route
              exact
              path="/patient/:patientUuid/edit"
              render={(props) => <PatientRegistration savePatientForm={savePatientForm} {...props} />}
            />
          </Grid>
        </main>
      </BrowserRouter>
    </ResourcesContext.Provider>
  );
}
