import React from 'react';
import { render, screen } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { type FormValues } from '../../patient-registration.types';
import { renderWithContext } from 'tools';
import { initialFormValues } from '../../patient-registration.component';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { DeathInfoSection } from './death-info-section.component';

const initialContextValues = {
  currentPhoto: 'data:image/png;base64,1234567890',
  identifierTypes: [],
  inEditMode: false,
  initialFormValues: {} as FormValues,
  isOffline: false,
  setCapturePhotoProps: jest.fn(),
  setFieldValue: jest.fn(),
  setFieldTouched: jest.fn(),
  setInitialFormValues: jest.fn(),
  validationSchema: null,
  values: {
    isDead: true,
  } as FormValues,
};

describe('Death info section', () => {
  const renderDeathInfoSection = (isDead) => {
    initialContextValues.values.isDead = isDead;

    renderWithContext(
      <Formik initialValues={initialFormValues} onSubmit={jest.fn()}>
        <Form>
          <DeathInfoSection fields={[]} />
        </Form>
      </Formik>,
      PatientRegistrationContextProvider,
      initialContextValues,
    );
  };

  it('shows fields for recording death info when the patient is marked as dead', () => {
    renderDeathInfoSection(true);

    expect(screen.getByRole('region', { name: /death info section/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /is dead/i })).toBeInTheDocument();
  });
});
