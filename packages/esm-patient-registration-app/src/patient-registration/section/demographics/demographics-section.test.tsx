import React from 'react';
import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { Formik, Form } from 'formik';
import { initialFormValues } from '../../patient-registration.component';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { DemographicsSection } from './demographics-section.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  validator: jest.fn(),
  getLocale: jest.fn().mockReturnValue('en'),
  OpenmrsDatePicker: jest.fn().mockImplementation(({ id, labelText, value, onChange }) => {
    return (
      <>
        <label htmlFor={id}>{labelText}</label>
        <input
          id={id}
          value={value ? dayjs(value).format('DD/MM/YYYY') : ''}
          onChange={(evt) => {
            onChange(dayjs(evt.target.value).toDate());
          }}
        />
      </>
    );
  }),
}));

jest.mock('../../field/name/name-field.component', () => {
  return {
    NameField: () => (
      <div>
        <input type="text" name="name" />
      </div>
    ),
  };
});

jest.mock('../../field/gender/gender-field.component', () => {
  return {
    GenderField: () => (
      <div>
        <input type="text" name="name" />
      </div>
    ),
  };
});

jest.mock('../../field/id/id-field.component', () => {
  return {
    IdField: () => (
      <div>
        <input type="text" name="name" />
      </div>
    ),
  };
});

describe('Demographics section', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        dateOfBirth: {
          allowEstimatedDateOfBirth: true,
          useEstimatedDateOfBirth: { enabled: true, dayOfMonth: 0, month: 0 },
        },
      } as RegistrationConfig['fieldConfigurations'],
    });
  });

  const setupSection = async (birthdateEstimated?: boolean, addNameInLocalLanguage?: boolean) => {
    render(
      <Formik initialValues={{ ...initialFormValues, birthdateEstimated, addNameInLocalLanguage }} onSubmit={null}>
        <Form>
          <PatientRegistrationContext.Provider
            value={{
              initialFormValues: null,
              identifierTypes: [],
              validationSchema: {},
              values: { ...initialFormValues, birthdateEstimated, addNameInLocalLanguage },
              inEditMode: false,
              setFieldValue: () => {},
              currentPhoto: 'TEST',
              isOffline: true,
              setCapturePhotoProps: (value) => {},
            }}>
            <DemographicsSection fields={['name', 'gender', 'dob']} />
          </PatientRegistrationContext.Provider>
        </Form>
      </Formik>,
    );
    const allInputs = screen.getAllByRole('textbox') as Array<HTMLInputElement>;
    return allInputs.map((input) => input.name);
  };

  it('inputs corresponding to number of fields', async () => {
    const inputNames = await setupSection();
    expect(inputNames.length).toBe(3);
  });
});
