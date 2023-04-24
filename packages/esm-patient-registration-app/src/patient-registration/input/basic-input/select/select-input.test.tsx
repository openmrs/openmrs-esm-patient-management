import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { SelectInput } from './select-input.component';

describe('select input', () => {
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
  it('optional get added if the input is not required', () => {
    const input = render(
      <Formik initialValues={{ select: '' }} onSubmit={null}>
        <Form>
          <SelectInput label="Select" name="select" options={['A Option', 'B Option']} />
        </Form>
      </Formik>,
    );
    expect(screen.getByLabelText('Select (optional)')).toBeInTheDocument();
  });
});
