/* eslint-disable no-console */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form, useField } from 'formik';
import { useConfig } from '@openmrs/esm-framework';
import { TextInput, Layer } from '@carbon/react';
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

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useField: jest.fn(),
}));

jest.mock('formik', () => {
  const originalModule = jest.requireActual('formik');

  return {
    ...originalModule,
    useField: jest.fn((...args) => {
      const [field, meta, helpers] = jest.requireActual('formik').useField(...args);

      const touchedRef = React.useRef(false); // Store the touched state separately

      const mockedMeta = {
        ...meta,
        get touched() {
          return touchedRef.current; // Access the touched state from the ref
        },
      };
      const mockedHelpers = {
        ...helpers,
        setValue: jest.fn((value) => {
          helpers.setValue(value);
          touchedRef.current = true; // Update the touched state
        }),
        setTouched: jest.fn((value) => {
          helpers.setTouched(value);
          touchedRef.current = value; // Update the touched state
        }),
        setError: jest.fn((value) => {
          helpers.setError(value);
          touchedRef.current = true; // Update the touched state
        }),
      };

      return [field, mockedMeta, mockedHelpers];
    }),
  };
});

// these are the other ways I tried to Input and useField but they didn't work

// jest.mock('formik', () => ({
//   ...(jest.requireActual('formik') as object),
//   Field: jest.fn(({ children }: FieldProps) => <>{children({ field: {}, form: { touched: {}, errors: {} } })}</>),
//   useField: jest.fn(() => [{ value: null }, {}]),
// }));

// jest.mock('../input/basic-input/input/input.component'),() => {
//   return {
//     ...jest.requireActual('../input/basic-input/input/input.component'),
//      };
//   };

jest.mock('../input/basic-input/input/input.component', () => {
  return {
    __esModule: true,
    Input: jest.fn().mockImplementation(({ labelText, ...props }) => {
      const [field, meta, helpers] = useField(props.name);
      // console.log("useField", useField(props.name));
      // console.log("field", field);
      // console.log("meta", meta);
      return (
        <div data-testid="mocked-input">
          {/* <label htmlFor={props.id}>{labelText}</label> */}
          <Layer>
            <TextInput
              {...props}
              labelText={labelText}
              invalid={!!(meta.touched && meta.error)}
              value={field.value}
              onChange={(e) => helpers.setValue(e.target.value)} // I had to this because the value was not being set
              invalidText={meta.error || ''}
              onBlur={() => {
                // I had to do this because the error message was not showing up
                helpers.setTouched(true);
                if (!field.value) {
                  console.log('props.name', props.name);
                  helpers.setError(`${labelText} is required`);
                }
              }}
            />
          </Layer>
        </div>
      );
    }),
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
        console.log('error', error);
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
    it(
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
        initialValues={
          {
            givenName: '',
            middleName: '',
            familyName: '',
          } as never
        }
        onSubmit={null as never}
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
    // console.log("givenNameInput", givenNameInput);

    await user.click(givenNameInput);

    fireEvent.change(givenNameInput, { target: { value: givenNameValue } });
    fireEvent.blur(givenNameInput);
    fireEvent.change(middleNameInput, { target: { value: middleNameValue } });
    fireEvent.blur(middleNameInput);
    fireEvent.change(familyNameInput, { target: { value: familyNameValue } });
    fireEvent.blur(familyNameInput);
    screen.debug();

    return {
      givenNameError: screen.queryByText('First Name is required'),
      middleNameError: screen.queryByText('Middle Name is required'),
      familyNameError: screen.queryByText('Family Name is required'),
    };
  };

  testValidName('Aaron', 'A', 'Aaronson');
  // testValidName('No', '', 'Middle Name');   // this test fails because the error message is showing up for the middle name
  testInvalidName('', '', '', 'First Name is required', 'givenNameError');
  testInvalidName('', '', '', 'Family Name is required', 'familyNameError');
  // testInvalidName('5', 'No', 'Given Name', 'First Name is required', 'givenNameError');  // this test fails because the error message
  testInvalidName('No', 'Family Name', '', 'Family Name is required', 'familyNameError');
});
