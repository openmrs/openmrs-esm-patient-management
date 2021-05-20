import React from 'react';
import { render, fireEvent, wait, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Input } from './input.component';

describe.skip('number input', () => {
  const setupInput = async () => {
    render(
      <Formik initialValues={{ number: 0 }} onSubmit={null}>
        <Form>
          <Input id="number" labelText="Number" name="number" light />
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
    const input = await setupInput();
    const expected = 1;

    fireEvent.change(input, { target: { valueAsNumber: expected } });
    fireEvent.blur(input);

    await wait();

    expect(input.valueAsNumber).toEqual(expected);
  });
});

describe.skip('text input', () => {
  const setupInput = async () => {
    render(
      <Formik initialValues={{ text: '' }} onSubmit={null}>
        <Form>
          <Input id="text" labelText="Text" name="text" placeholder="Enter text" light />
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

describe.skip('telephone number input', () => {
  const setupInput = async () => {
    render(
      <Formik initialValues={{ telephoneNumber: '' }} onSubmit={null}>
        <Form>
          <Input
            id="tel"
            labelText="Telephone Number"
            name="telephoneNumber"
            placeholder="Enter telephone number"
            light
          />
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
    const input = await setupInput();
    const expected = '0800001066';

    fireEvent.change(input, { target: { value: expected } });
    fireEvent.blur(input);

    await wait();

    expect(input.value).toEqual(expected);
  });
});

describe.skip('date input', () => {
  const setupInput = async () => {
    render(
      <Formik initialValues={{ date: '' }} onSubmit={null}>
        <Form>
          <Input id="date" labelText="date" name="date" light />
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
    const input = await setupInput();
    const expected = '1990-09-10';

    fireEvent.change(input, { target: { value: expected } });
    fireEvent.blur(input);

    await wait();

    expect(input.value).toEqual(expected);
  });
});

describe.skip('checkbox input', () => {
  const setupInput = async () => {
    render(
      <Formik initialValues={{ checkbox: false }} onSubmit={null}>
        <Form>
          <Input id="checkbox" labelText="checkbox" name="checkbox" light />
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
    const input = await setupInput();
    const expected = true;

    fireEvent.click(input);
    fireEvent.blur(input);

    await wait();

    expect(input.checked).toEqual(expected);
  });

  it('can update data', async () => {
    const input = await setupInput();
    const expected = false;

    fireEvent.click(input);
    fireEvent.blur(input);

    fireEvent.click(input);
    fireEvent.blur(input);

    await wait();

    expect(input.checked).toEqual(expected);
  });
});
