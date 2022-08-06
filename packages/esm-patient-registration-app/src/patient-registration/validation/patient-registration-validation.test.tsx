import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { useConfig } from '@openmrs/esm-framework';
import { validationSchema } from './patient-registration-validation';
import { NameField } from '../field/name/name-field.component';
import { PatientRegistrationContext } from '../patient-registration-context';
import { initialFormValues } from '../patient-registration.component';
import { FormValues } from '../patient-registration-types';

const mockUseConfig = useConfig as jest.Mock;
const mockFieldConfigs = {
  fieldConfigurations: {
    name: {
      displayMiddleName: true,
    },
  },
};

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn(),
    validator: jest.fn(),
  };
});

describe('Name input', () => {
  const formValues: FormValues = initialFormValues;

  const testValidName = (givenNameValue: string, middleNameValue: string, familyNameValue: string) => {
    it(
      'does not display error message when givenNameValue: ' +
        givenNameValue +
        ', middleNameValue: ' +
        middleNameValue +
        ', familyNameValue: ' +
        familyNameValue,
      async () => {
        const error = await updateNameAndReturnError(givenNameValue, middleNameValue, familyNameValue);
        Object.values(error).map((currentError) => expect(currentError).toBeNull());
      },
    );
  };

  const testInvalidName = (
    givenNameValue: string,
    middleNameValue: string,
    familyNameValue: string,
    expectedError: string,
    errorType: string,
  ) => {
    it.skip(
      'displays error message when givenNameValue: ' +
        givenNameValue +
        ', middleNameValue: ' +
        middleNameValue +
        ', familyNameValue: ' +
        familyNameValue,
      async () => {
        const error = (await updateNameAndReturnError(givenNameValue, middleNameValue, familyNameValue))[errorType];
        expect(error.textContent).toEqual(expectedError);
      },
    );
  };

  const updateNameAndReturnError = async (givenNameValue: string, middleNameValue: string, familyNameValue: string) => {
    const user = userEvent.setup();

    mockUseConfig.mockReturnValue(mockFieldConfigs);

    render(
      <Formik
        initialValues={{
          givenName: '',
          middleName: '',
          familyName: '',
        }}
        onSubmit={null}
        validationSchema={validationSchema}>
        <Form>
          <PatientRegistrationContext.Provider
            value={{
              initialFormValues: null,
              identifierTypes: [],
              validationSchema,
              setValidationSchema: () => {},
              values: formValues,
              inEditMode: false,
              setFieldValue: () => null,
              currentPhoto: 'TEST',
              isOffline: true,
              setCapturePhotoProps: (value) => {},
            }}>
            <NameField />
          </PatientRegistrationContext.Provider>
        </Form>
      </Formik>,
    );
    const givenNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
    const middleNameInput = screen.getByLabelText(/Middle Name/i) as HTMLInputElement;
    const familyNameInput = screen.getByLabelText('Family Name') as HTMLInputElement;

    await user.click(givenNameInput);

    fireEvent.change(givenNameInput, { target: { value: givenNameValue } });
    fireEvent.blur(givenNameInput);
    fireEvent.change(middleNameInput, { target: { value: middleNameValue } });
    fireEvent.blur(middleNameInput);
    fireEvent.change(familyNameInput, { target: { value: familyNameValue } });
    fireEvent.blur(familyNameInput);

    return {
      givenNameError: screen.queryByText('Given name is required'),
      middleNameError: screen.queryByText('Middle name is required'),
      familyNameError: screen.queryByText('Family name is required'),
    };
  };

  testValidName('Aaron', 'A', 'Aaronson');
  testValidName('No', '', 'Middle Name');
  testInvalidName('', '', '', 'Given name is required', 'givenNameError');
  testInvalidName('', '', '', 'Family name is required', 'familyNameError');
  testInvalidName('', 'No', 'Given Name', 'Given name is required', 'givenNameError');
  testInvalidName('No', 'Family Name', '', 'Family name is required', 'familyNameError');
});
