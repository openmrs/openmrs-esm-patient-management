import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import { EmailField } from './email-field.component';
import { Formik, Form } from 'formik';

describe('email field', () => {
  it('should render email field with label Email', async () => {
    const { findByLabelText } = render(
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <EmailField />
        </Form>
      </Formik>,
    );

    const email = await findByLabelText('Email');
    expect(email).toBeInTheDocument();
  });
});
