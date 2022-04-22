import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { initialFormValues } from '../../patient-registration.component';
import { DemographicsSection } from './demographics-section.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { FormValues } from '../../patient-registration-types';

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

describe('demographics section', () => {
  const formValues: FormValues = initialFormValues;

  const setupSection = async (birthdateEstimated?: boolean, addNameInLocalLanguage?: boolean) => {
    render(
      <Formik initialValues={{ ...initialFormValues, birthdateEstimated, addNameInLocalLanguage }} onSubmit={null}>
        <Form>
          <PatientRegistrationContext.Provider
            value={{
              identifierTypes: [],
              validationSchema: {},
              setValidationSchema: () => {},
              fieldConfigs: [],
              values: { ...initialFormValues, birthdateEstimated, addNameInLocalLanguage },
              inEditMode: false,
              setFieldValue: () => {},
              currentPhoto: 'TEST',
              isOffline: true,
              setCapturePhotoProps: (value) => {},
            }}>
            <DemographicsSection fields={['name', 'gender', 'id']} id="demographics" />
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
