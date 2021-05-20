import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
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
      </BrowserRouter>
    </ResourcesContext.Provider>
  );
}
