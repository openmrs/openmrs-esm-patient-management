import React from 'react';
import { render, fireEvent, wait, screen } from '@testing-library/react';
import { DummyDataInput, dummyFormValues } from './dummy-data-input.component';
import { initialFormValues } from '../../patient-registration.component';
import { FormValues } from '../../patient-registration-types';

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
    await wait();

    expect(formValues).toEqual(dummyFormValues);
  });
});
