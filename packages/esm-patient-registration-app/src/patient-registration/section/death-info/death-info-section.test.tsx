import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type FormValues } from '../../patient-registration.types';
import { initialFormValues } from '../../patient-registration.component';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { DeathInfoSection } from './death-info-section.component';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

/**
 * Helper to render DeathInfoSection with Formik for state-dependent tests.
 */
function renderDeathInfoSectionWithFormik(fields: string[] = [], initialValues: Partial<FormValues> = {}) {
  const defaultValues = {
    isDead: false,
    ...initialValues,
  };

  let formValuesRef: FormValues = { ...initialFormValues, ...defaultValues } as FormValues;

  const utils = render(
    <Formik initialValues={defaultValues} onSubmit={() => {}}>
      {({ setFieldValue, values }) => {
        formValuesRef = { ...initialFormValues, ...values } as FormValues;
        return (
          <Form>
            <PatientRegistrationContextProvider
              value={{
                identifierTypes: [],
                values: formValuesRef,
                validationSchema: null,
                inEditMode: false,
                setFieldValue: setFieldValue as any,
                setCapturePhotoProps: jest.fn(),
                setFieldTouched: jest.fn().mockResolvedValue(undefined),
                currentPhoto: '',
                isOffline: false,
                initialFormValues: formValuesRef,
              }}>
              <DeathInfoSection fields={fields} />
            </PatientRegistrationContextProvider>
          </Form>
        );
      }}
    </Formik>,
  );

  return {
    ...utils,
    getFormValues: () => formValuesRef,
  };
}

describe('Death info section', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldDefinitions: [],
    });
  });

  describe('Rendering', () => {
    it('renders the section with checkbox', () => {
      renderDeathInfoSectionWithFormik();

      expect(screen.getByRole('region', { name: /death info section/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /is dead/i })).toBeInTheDocument();
    });

    it('shows checkbox as checked when isDead is true', () => {
      renderDeathInfoSectionWithFormik([], { isDead: true });

      const checkbox = screen.getByRole('checkbox', { name: /is dead/i });
      expect(checkbox).toBeChecked();
    });

    it('shows checkbox as unchecked when isDead is false', () => {
      renderDeathInfoSectionWithFormik([], { isDead: false });

      const checkbox = screen.getByRole('checkbox', { name: /is dead/i });
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('User interaction', () => {
    it('toggles death info fields when user clicks the checkbox', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderDeathInfoSectionWithFormik([]);

      const checkbox = screen.getByRole('checkbox', { name: /is dead/i });
      expect(checkbox).not.toBeChecked();

      // Click to check
      await user.click(checkbox);

      await waitFor(() => {
        expect(getFormValues().isDead).toBe(true);
      });

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });

      // Click to uncheck
      await user.click(checkbox);

      await waitFor(() => {
        expect(getFormValues().isDead).toBe(false);
      });

      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });
    });

    it('updates form values when user toggles the checkbox', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderDeathInfoSectionWithFormik([]);

      const checkbox = screen.getByRole('checkbox', { name: /is dead/i });
      expect(checkbox).not.toBeChecked();
      expect(getFormValues().isDead).toBe(false);

      // Check the checkbox
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
      expect(getFormValues().isDead).toBe(true);

      // Uncheck the checkbox
      await user.click(checkbox);
      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });
      expect(getFormValues().isDead).toBe(false);
    });
  });
});
