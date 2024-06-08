import React, { useMemo, useState, useEffect } from 'react';
import classNames from 'classnames';
import useSWRImmutable from 'swr/immutable';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Grid, Row } from '@carbon/react';
import { ExtensionSlot, useConnectivity, useSession, useConfig } from '@openmrs/esm-framework';
import {
  ResourcesContext,
  fetchAddressTemplate,
  fetchAllRelationshipTypes,
  fetchPatientIdentifierTypesWithSources,
} from './offline.resources';
import { FormManager } from './patient-registration/form-manager';
import { PatientRegistration } from './patient-registration/patient-registration.component';
import styles from './root.scss';
import Joyride, { type CallBackProps, STATUS } from 'react-joyride';
import { onboardingSteps } from './onboardingSteps';
import { type RegistrationConfig } from './config-schema';

export default function Root() {
  const isOnline = useConnectivity();
  const currentSession = useSession();
  const config = useConfig() as RegistrationConfig;
  const [runJoyride, setRunJoyride] = useState<boolean>(config.showTutorial);
  const { data: addressTemplate } = useSWRImmutable('patientRegistrationAddressTemplate', fetchAddressTemplate);
  const { data: relationshipTypes } = useSWRImmutable(
    'patientRegistrationRelationshipTypes',
    fetchAllRelationshipTypes,
  );
  const { data: identifierTypes } = useSWRImmutable(
    'patientRegistrationPatientIdentifiers',
    fetchPatientIdentifierTypesWithSources,
  );
  const savePatientForm = useMemo(
    () => (isOnline ? FormManager.savePatientFormOnline : FormManager.savePatientFormOffline),
    [isOnline],
  );

  const handleJoyrideCallback = (data: CallBackProps) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setRunJoyride(false);
    }
  };

  useEffect(() => {
    setRunJoyride(config.showTutorial);
  }, [config.showTutorial]);

  return (
    <main className={classNames('omrs-main-content', styles.root)}>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={runJoyride}
        showProgress
        showSkipButton
        steps={onboardingSteps as []}
        locale={{
          last: 'Done',
        }}
        styles={{
          options: {
            primaryColor: '#005D5D',
          },
          overlay: {
            backgroundColor: 'none',
            mixBlendMode: 'unset',
          },
          spotlight: {
            backgroundColor: 'none',
          },
        }}
      />
      <Grid className={styles.grid}>
        <Row>
          <ExtensionSlot name="breadcrumbs-slot" />
        </Row>
        <ResourcesContext.Provider
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
                element={<PatientRegistration savePatientForm={savePatientForm} isOffline={!isOnline} />}
              />
              <Route
                path="patient/:patientUuid/edit"
                element={<PatientRegistration savePatientForm={savePatientForm} isOffline={!isOnline} />}
              />
            </Routes>
          </BrowserRouter>
        </ResourcesContext.Provider>
      </Grid>
    </main>
  );
}
