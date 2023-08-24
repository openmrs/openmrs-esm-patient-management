import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { Input } from './input.component';

describe('text input', () => {
  const setupInput = async () => {
    render(
      <Formik initialValues={{ text: '' }} onSubmit={() => {}}>
        <Form>
          <Input
            id="text"
            labelText="Text"
            name="text"
            placeholder="Enter text"
            required
            checkWarning={(value) => {
              if (value.length > 5) {
                return 'name should be of 5 char';
              }
            }}
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

  it('can input valid data without warning', async () => {
    const user = userEvent.setup();

    const input = await setupInput();
    const userInput = 'text';

    await user.type(input, userInput);
    await user.tab();

    expect(input.value).toEqual(userInput);
    expect(screen.queryByText('name should be of 5 char')).not.toBeInTheDocument();
  });

  it('should show a warning when the invalid input is entered', async () => {
    const user = userEvent.setup();

    const input = await setupInput();
    const userInput = 'Hello World';

    await userEvent.clear(input);

    await user.type(input, userInput);
    await user.tab();

    expect(screen.getByText('name should be of 5 char')).toBeInTheDocument();
  });

  it('should show the correct label text if the field is not required', () => {
    render(
      <Formik initialValues={{ text: '' }} onSubmit={() => {}}>
        <Form>
          <Input id="text" labelText="Text" name="text" placeholder="Enter text" />
        </Form>
      </Formik>,
    );
    expect(screen.getByLabelText('Text (optional)')).toBeInTheDocument();
  });
});
