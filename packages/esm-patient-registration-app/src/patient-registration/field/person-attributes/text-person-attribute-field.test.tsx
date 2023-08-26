import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import { TextPersonAttributeField } from './text-person-attribute-field.component';

describe('TextPersonAttributeField', () => {
  const mockPersonAttributeType = {
    format: 'java.lang.String',
    display: 'Referred by',
    uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
  };

  it('renders the input field with a label', () => {
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <TextPersonAttributeField
            id="attributeId"
            personAttributeType={mockPersonAttributeType}
            label="Custom Label"
          />
        </Form>
      </Formik>,
    );

    expect(screen.getByRole('textbox', { name: /custom label \(optional\)/i })).toBeInTheDocument();
  });

  it('renders the input field with the default label if label prop is not provided', () => {
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <TextPersonAttributeField id="attributeId" personAttributeType={mockPersonAttributeType} />
        </Form>
      </Formik>,
    );

    expect(screen.getByRole('textbox', { name: /referred by \(optional\)/i })).toBeInTheDocument();
  });

  it('validates the input with the provided validationRegex', async () => {
    const user = userEvent.setup();
    const validationRegex = '^[A-Z]+$'; // Accepts only uppercase letters

    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <TextPersonAttributeField
            id="attributeId"
            personAttributeType={mockPersonAttributeType}
            validationRegex={validationRegex}
          />
        </Form>
      </Formik>,
    );

    const textbox = screen.getByRole('textbox', { name: /referred by \(optional\)/i });
    expect(textbox).toBeInTheDocument();

    // Valid input: "ABC"
    await user.type(textbox, 'ABC');
    await user.tab();

    expect(screen.queryByText(/invalid input/i)).not.toBeInTheDocument();
    await user.clear(textbox);

    // // Invalid input: "abc" (contains lowercase letters)
    await user.type(textbox, 'abc');
    await user.tab();
    expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
  });

  it('renders the input field as required when required prop is true', () => {
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <TextPersonAttributeField id="attributeId" personAttributeType={mockPersonAttributeType} required />
        </Form>
      </Formik>,
    );
    const textbox = screen.getByRole('textbox', { name: /referred by/i });

    // Required attribute should be truthy on the input element
    expect(textbox).toBeInTheDocument();
    expect(textbox).toBeRequired();
  });
});
