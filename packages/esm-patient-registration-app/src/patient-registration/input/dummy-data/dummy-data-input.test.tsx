import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { DummyDataInput, dummyFormValues } from './dummy-data-input.component';
import { initialFormValues } from '../../patient-registration.component';
import { FormValues } from '../../patient-registration-types';

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    validator: jest.fn(),
  };
});

describe('dummy data input', () => {
  let formValues: FormValues = initialFormValues;

  const setupInput = async () => {
    render(
      <DummyDataInput
        setValues={(values) => {
          formValues = values;
        }}
      />,
    );
    return screen.getByLabelText('Dummy Data Input') as HTMLButtonElement;
  };

  it('exists', async () => {
    const input = await setupInput();
    expect(input.type).toEqual('button');
  });

  it('can input data on button click', async () => {
    const input = await setupInput();

    fireEvent.click(input);
    waitFor(() => {
      expect(formValues).toEqual(dummyFormValues);
    });
  });
});
