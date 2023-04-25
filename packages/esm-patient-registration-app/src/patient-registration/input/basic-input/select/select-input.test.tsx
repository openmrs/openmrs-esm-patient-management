import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { SelectInput } from './select-input.component';

describe('the select input', () => {
  const setupSelect = async () => {
    render(
      <Formik initialValues={{ select: '' }} onSubmit={null}>
        <Form>
          <SelectInput label="Select" name="select" options={['A Option', 'B Option']} required />
        </Form>
      </Formik>,
    );
    return screen.getByLabelText('Select') as HTMLInputElement;
  };

  it('exists', async () => {
    const input = await setupSelect();
    expect(input.type).toEqual('select-one');
  });

  it('can input data', async () => {
    const input = await setupSelect();
    const expected = 'A Option';

    fireEvent.change(input, { target: { value: expected } });
    fireEvent.blur(input);

    await waitFor(() => expect(input.value).toEqual(expected));
  });

  it('should show optional label if the input is not required', () => {
    render(
      <Formik initialValues={{ select: '' }} onSubmit={null}>
        <Form>
          <SelectInput label="Select" name="select" options={['A Option', 'B Option']} />
        </Form>
      </Formik>,
    );
    const selectInput = screen.getByRole('combobox', { name: 'Select (optional)' }) as HTMLSelectElement;
    expect(selectInput.labels).toHaveLength(1);
    expect(selectInput.labels[0]).toHaveTextContent('Select (optional)');
  });
});
