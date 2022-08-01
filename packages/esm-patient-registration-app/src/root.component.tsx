import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Grid, Row } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { Resources, ResourcesContext } from './offline.resources';
import { SavePatientForm } from './patient-registration/form-manager';
import { PatientRegistration, PatientRegistrationProps } from './patient-registration/patient-registration.component';
import styles from './root.scss';

export interface RootProps extends PatientRegistrationProps, Resources {
  savePatientForm: SavePatientForm;
  isOffline: boolean;
}

export default function Root({
  currentSession,
  addressTemplate,
  relationshipTypes,
  identifierTypes,
  savePatientForm,
  isOffline,
}: RootProps) {
  const resources = {
    currentSession,
    addressTemplate,
    relationshipTypes,
    identifierTypes,
  };

  return (
    <main className="omrs-main-content" style={{ backgroundColor: 'white' }}>
      <Grid className={styles.grid}>
        <Row>
          <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
        </Row>
        <ResourcesContext.Provider value={resources}>
          <BrowserRouter basename={window['getOpenmrsSpaBase']()}>
            <Routes>
              <Route
                path="/patient-registration"
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
