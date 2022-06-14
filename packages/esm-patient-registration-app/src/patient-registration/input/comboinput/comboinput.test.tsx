import { fireEvent, render, screen, wait } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { ComboInput } from './comboinput.component';

describe.skip('Combo box input', () => {
  const setupInput = async () => {
    const nulldata = [];
    const selected = null;
    const setSelectedValue = null;
    render(
      <Formik initialValues={{ text: '' }} onSubmit={null}>
        <Form>
          <ComboInput
            items={nulldata}
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
    return screen.getByLabelText('text') as HTMLInputElement;
  };

  it('exists', async () => {
    const input = await setupInput();
    expect(input.type).toEqual('text');
  });

  it('can input data', async () => {
    const input = await setupInput();
    const expected = 'Some text';

    fireEvent.change(input, { target: { value: expected } });
    fireEvent.blur(input);

    await wait();

    expect(input.value).toEqual(expected);
  });
});
