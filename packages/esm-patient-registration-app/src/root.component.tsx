import React from 'react';
import { Grid, Row } from 'carbon-components-react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { Resources, ResourcesContext } from './offline.resources';
import { PatientRegistration, PatientRegistrationProps } from './patient-registration/patient-registration.component';

export default function Root({
  currentSession,
  addressTemplate,
  relationshipTypes,
  identifierTypes,
  savePatientForm,
  isOffline,
}: PatientRegistrationProps & Resources) {
  const resources = {
    currentSession,
    addressTemplate,
    relationshipTypes,
    identifierTypes,
  };

  return (
    <ResourcesContext.Provider value={resources}>
      <main className="omrs-main-content" style={{ backgroundColor: 'white' }}>
        <Grid>
          <Row>
            <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
          </Row>
          <PatientRegistration savePatientForm={savePatientForm} isOffline={isOffline} />
        </Grid>
      </main>
    </ResourcesContext.Provider>
  );
}
