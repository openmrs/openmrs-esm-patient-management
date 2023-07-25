import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TextPersonAttributeField } from './text-person-attribute-field.component';
import { Form, Formik } from 'formik';

// jest.mock('formik', () => ({
//   ...jest.requireActual('formik'),
// }));

jest.mock('formik', () => {
  const ActualFormik = jest.requireActual('formik');
  return {
    ...ActualFormik,
    Field: ({ name, validate, children }) => {
      const MockedField = () =>
        children({
          field: { name },
          form: { touched: {}, errors: {} },
          meta: { error: validate && validate('test-value') },
        });
      return <MockedField />;
    },
  };
});

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

    expect(screen.getByLabelText(/Custom Label/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders the input field with the default label if label prop is not provided', () => {
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <TextPersonAttributeField id="attributeId" personAttributeType={mockPersonAttributeType} />
        </Form>
      </Formik>,
    );

    expect(screen.getByLabelText(/Referred by/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it.skip('validates the input with the provided validationRegex', () => {
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

    const inputElement = screen.getByRole('textbox');

    // Valid input: "ABC"
    act(() => {
      fireEvent.change(inputElement, { target: { value: 'ABC' } });
    });
    expect(screen.queryByText(/Invalid Input/i)).not.toBeInTheDocument();

    // Invalid input: "abc" (contains lowercase letters)
    act(() => {
      fireEvent.change(inputElement, { target: { value: 'abc' } });
    });
    screen.debug();
    expect(screen.getByText(/Invalid Input/i)).toBeInTheDocument();
  });

  it('renders the input field as required when required prop is true', () => {
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <TextPersonAttributeField id="attributeId" personAttributeType={mockPersonAttributeType} required />
        </Form>
      </Formik>,
    );

    const inputElement = screen.getByRole('textbox');

    // Required attribute should be present on the input element
    expect(inputElement).toHaveAttribute('required');
  });
});
