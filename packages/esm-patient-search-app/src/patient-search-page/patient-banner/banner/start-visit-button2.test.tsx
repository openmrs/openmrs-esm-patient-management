import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StartVisitButton2 from './start-visit-button2.component';

describe('StartVisitButton2', () => {
  const patient = { id: 'patient-1' } as fhir.Patient;

  it('starts a visit by default', async () => {
    const user = userEvent.setup();
    const launchChildWorkspace = jest.fn();

    render(
      <StartVisitButton2
        closeWorkspace={jest.fn()}
        launchChildWorkspace={launchChildWorkspace}
        patient={patient}
        patientUuid="patient-1"
        startVisitWorkspaceName="test-start-visit-workspace"
      />,
    );

    await user.click(screen.getByRole('button', { name: /start visit/i }));

    expect(launchChildWorkspace).toHaveBeenCalledWith('test-start-visit-workspace', {
      openedFrom: 'patient-search-results',
      patient,
      patientUuid: 'patient-1',
    });
  });

  it('runs the select-patient action when configured', async () => {
    const user = userEvent.setup();
    const closeWorkspace = jest.fn();
    const launchChildWorkspace = jest.fn();
    const onPatientSelected = jest.fn();

    render(
      <StartVisitButton2
        closeWorkspace={closeWorkspace}
        launchChildWorkspace={launchChildWorkspace}
        onPatientSelected={onPatientSelected}
        patient={patient}
        patientUuid="patient-1"
        primaryActionLabel="Create appointment"
        primaryActionMode="selectPatient"
        startVisitWorkspaceName="test-start-visit-workspace"
      />,
    );

    await user.click(screen.getByRole('button', { name: /create appointment/i }));

    expect(onPatientSelected).toHaveBeenCalledWith('patient-1', patient, launchChildWorkspace, closeWorkspace);
    expect(launchChildWorkspace).not.toHaveBeenCalled();
  });
});
