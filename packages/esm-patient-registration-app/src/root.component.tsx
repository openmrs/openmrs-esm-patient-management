import React from 'react';
import classNames from 'classnames';
import useSWRImmutable from 'swr/immutable';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Grid } from '@carbon/react';
import { useSession } from '@openmrs/esm-framework';
import {
  fetchAddressTemplate,
  fetchAllRelationshipTypes,
  fetchPatientIdentifierTypesWithSources,
} from './registration.resource';
import { ResourcesContextProvider } from './resources-context';
import { FormManager } from './patient-registration/form-manager';
import { PatientRegistration } from './patient-registration/patient-registration.component';
import styles from './root.scss';

export default function Root() {
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
    <main className={classNames('omrs-main-content', styles.root)}>
      <Grid className={styles.grid}>
        <ResourcesContextProvider
          value={{
            addressTemplate,
            relationshipTypes,
            identifierTypes,
            currentSession,
          }}>
          <BrowserRouter basename={window.getOpenmrsSpaBase()}>
            <Routes>
              <Route
                path="patient-registration"
                element={<PatientRegistration savePatientForm={FormManager.savePatientFormOnline} />}
              />
              <Route
                path="patient/:patientUuid/edit"
                element={<PatientRegistration savePatientForm={FormManager.savePatientFormOnline} />}
              />
            </Routes>
          </BrowserRouter>
        </ResourcesContextProvider>
      </Grid>
    </main>
  );
}
