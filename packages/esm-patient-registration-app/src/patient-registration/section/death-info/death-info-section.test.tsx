import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { initialFormValues } from '../../patient-registration.component';
import { DeathInfoSection } from './death-info-section.component';
import { type FormValues } from '../../patient-registration.types';
import { PatientRegistrationContext } from '../../patient-registration-context';

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
            <DeathInfoSection />
          </Form>
        </Formik>
      </PatientRegistrationContext.Provider>,
    );
  };

  it('shows fields for recording death info when the patient is marked as dead', () => {
    renderDeathInfoSection(true);

    expect(screen.getByRole('region', { name: /death info section/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /death info/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /is dead \(optional\)/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /date of death \(optional\)/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /cause of death \(optional\)/i })).toBeInTheDocument();
  });

  it('has the correct number of inputs if is dead is not checked', async () => {
    renderDeathInfoSection(false);

    expect(screen.queryByRole('textbox', { name: /date of death \(optional\)/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /cause of death \(optional\)/i })).not.toBeInTheDocument();
  });
});
