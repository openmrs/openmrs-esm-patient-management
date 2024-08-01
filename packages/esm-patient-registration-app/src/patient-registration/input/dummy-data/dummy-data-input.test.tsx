import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DummyDataInput, dummyFormValues } from './dummy-data-input.component';
import { initialFormValues } from '../../patient-registration.component';
import { type FormValues } from '../../patient-registration.types';

describe('Dummy data input', () => {
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
    const user = userEvent.setup();
    const input = await setupInput();

    await user.click(input);
    expect(formValues).toEqual(dummyFormValues);
  });
});
