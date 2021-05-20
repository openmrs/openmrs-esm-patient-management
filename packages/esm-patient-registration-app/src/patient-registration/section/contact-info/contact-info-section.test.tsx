import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { ContactInfoSection } from './contact-info-section.component';

jest.mock('../../field/address/address-field.component', () => {
  return {
    AddressField: () => {
      return (
        <div>
          <input name="address" id="address" />
        </div>
      );
    },
  };
});

describe('contact info section', () => {
  const setupSection = async (fields) => {
    render(
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <ContactInfoSection fields={fields} />
        </Form>
      </Formik>,
    );
    const allInputs = screen.getAllByRole('textbox') as Array<HTMLInputElement>;
    return allInputs.map((input) => input.name);
  };

  it('has 3 fields', async () => {
    const inputNames = await setupSection(['address', 'phone', 'email']);
    expect(inputNames.length).toBe(3);
  });

  it('has only two fields', async () => {
    const inputNames = await setupSection(['phone', 'email']);
    expect(inputNames.length).toBe(2);
  });
});
