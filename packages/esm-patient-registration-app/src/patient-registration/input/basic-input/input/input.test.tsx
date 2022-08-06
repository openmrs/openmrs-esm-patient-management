import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { Input } from './input.component';

describe.skip('number input', () => {
  const setupInput = async () => {
    render(
      <Formik initialValues={{ number: 0 }} onSubmit={null}>
        <Form>
          <Input id="number" labelText="Number" name="number" />
        </Form>
      </Formik>,
    );
    return screen.getByLabelText('number') as HTMLInputElement;
  };

  it('exists', async () => {
    const input = await setupInput();
    expect(input.type).toEqual('number');
  });

  it('can input data', async () => {
    const user = userEvent.setup();

    const input = await setupInput();
    const expected = 1;

    await user.type(input, expected.toString());
    await user.tab();

    expect(input.valueAsNumber).toEqual(expected);
  });
});

describe.skip('text input', () => {
  const setupInput = async () => {
    render(
      <Formik initialValues={{ text: '' }} onSubmit={null}>
        <Form>
          <Input id="text" labelText="Text" name="text" placeholder="Enter text" />
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
    const user = userEvent.setup();

    const input = await setupInput();
    const expected = 'Some text';

    await user.type(input, expected);
    await user.tab();

    expect(input.value).toEqual(expected);
  });
});

describe.skip('telephone number input', () => {
  const setupInput = async () => {
    render(
      <Formik initialValues={{ telephoneNumber: '' }} onSubmit={null}>
        <Form>
          <Input id="tel" labelText="Telephone Number" name="telephoneNumber" placeholder="Enter telephone number" />
        </Form>
      </Formik>,
    );
    return screen.getByLabelText('telephoneNumber') as HTMLInputElement;
  };

  it('exists', async () => {
    const input = await setupInput();
    expect(input.type).toEqual('tel');
  });

  it('can input data', async () => {
    const user = userEvent.setup();

    const input = await setupInput();
    const expected = '0800001066';

    await user.type(input, expected);
    await user.tab();

    expect(input.value).toEqual(expected);
  });
});

describe.skip('date input', () => {
  const setupInput = async () => {
    render(
      <Formik initialValues={{ date: '' }} onSubmit={null}>
        <Form>
          <Input id="date" labelText="date" name="date" />
        </Form>
      </Formik>,
    );
    return screen.getByLabelText('date') as HTMLInputElement;
  };

  it('exists', async () => {
    const input = await setupInput();
    expect(input.type).toEqual('date');
  });

  it('can input data', async () => {
    const user = userEvent.setup();

    const input = await setupInput();
    const expected = '1990-09-10';

    await user.type(input, expected);
    await user.tab();

    expect(input.value).toEqual(expected);
  });
});

describe.skip('checkbox input', () => {
  const setupInput = async () => {
    render(
      <Formik initialValues={{ checkbox: false }} onSubmit={null}>
        <Form>
          <Input id="checkbox" labelText="checkbox" name="checkbox" />
        </Form>
      </Formik>,
    );
    return screen.getByLabelText('checkbox') as HTMLInputElement;
  };

  it('exists', async () => {
    const input = await setupInput();
    expect(input.type).toEqual('checkbox');
  });

  it('can input data', async () => {
    const user = userEvent.setup();
    const input = await setupInput();

    const expected = true;

    await user.click(input);
    await user.tab();

    expect(input.checked).toEqual(expected);
  });

  it('can update data', async () => {
    const user = userEvent.setup();
    const input = await setupInput();

    const expected = false;

    await user.click(input);
    await user.tab();

    await user.click(input);
    await user.tab();

    expect(input.checked).toEqual(expected);
  });
});
