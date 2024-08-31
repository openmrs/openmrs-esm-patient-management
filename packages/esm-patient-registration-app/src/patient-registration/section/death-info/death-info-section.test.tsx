import React from 'react';
import { render, screen } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { initialFormValues } from '../../patient-registration.component';
import { type FormValues } from '../../patient-registration.types';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { DeathInfoSection } from './death-info-section.component';

const initialContextValues = {
  currentPhoto: 'data:image/png;base64,1234567890',
  identifierTypes: [],
  inEditMode: false,
  initialFormValues: {} as FormValues,
  isOffline: false,
  setCapturePhotoProps: jest.fn(),
  setFieldValue: jest.fn(),
  setInitialFormValues: jest.fn(),
  validationSchema: null,
  values: {
    isDead: true,
  } as FormValues,
};

describe('Death info section', () => {
  const renderDeathInfoSection = (isDead) => {
    initialContextValues.values.isDead = isDead;

    render(
      <PatientRegistrationContext.Provider value={initialContextValues}>
        <Formik initialValues={initialFormValues} onSubmit={jest.fn()}>
          <Form>
            <DeathInfoSection fields={[]} />
          </Form>
        </Formik>
      </PatientRegistrationContext.Provider>,
    );
  };

  it('shows fields for recording death info when the patient is marked as dead', () => {
    renderDeathInfoSection(true);

    expect(screen.getByRole('region', { name: /death info section/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /is dead/i })).toBeInTheDocument();
  });
});
