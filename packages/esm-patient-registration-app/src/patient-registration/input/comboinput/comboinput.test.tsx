import { fireEvent, render, screen, wait } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { ComboInput } from './comboinput.component';
import React from 'react';

describe('Combo box input', () => {
  const setupInput = async () => {
    const selected = null;
    const setSelectedValue = null;
    render(
      <Formik initialValues={{ text: '' }} onSubmit={null}>
        <Form>
          <ComboInput
            items={[]}
            selected={selected}
            setSelectedValue={setSelectedValue}
            id="text"
            labeltext="Text"
            name="text"
            placeholder="Enter text"
            light
          />
        </Form>
      </Formik>,
    );
    return screen.getByLabelText('Text') as HTMLInputElement;
  };

  it('exists', async () => {
    const input = await setupInput();
    expect(input.type).toEqual('text');
  });

  it('can input data', async () => {
    const input = await setupInput();
    const expected = 'Some Text';

    fireEvent.change(input, { target: { value: expected } });
    fireEvent.blur(input);

    await wait();

    expect(input.value).toEqual(expected);
  });
});
