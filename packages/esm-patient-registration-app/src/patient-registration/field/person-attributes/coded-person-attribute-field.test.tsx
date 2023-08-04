import React from 'react';
import { render, screen } from '@testing-library/react';
import { useConceptAnswers } from '../field.resource';
import { CodedPersonAttributeField } from './coded-person-attribute-field.component';
import { Form, Formik } from 'formik';

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
}));

jest.mock('../field.resource'); // Mock the useConceptAnswers hook

const mockedUseConceptAnswers = useConceptAnswers as jest.Mock;

describe('CodedPersonAttributeField', () => {
  const conceptAnswers = [
    { uuid: '1', display: 'Option 1' },
    { uuid: '2', display: 'Option 2' },
  ];
  const personAttributeType = {
    format: 'org.openmrs.Concept',
    display: 'Referred by',
    uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
  };
  const answerConceptSetUuid = '6682d17f-0777-45e4-a39b-93f77eb3531c';

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseConceptAnswers.mockReturnValue({
      data: conceptAnswers,
      isLoading: false,
    });
  });

  it('renders the Select component when conceptAnswers are available', () => {
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <CodedPersonAttributeField
            id="attributeId"
            personAttributeType={personAttributeType}
            answerConceptSetUuid={answerConceptSetUuid}
            label={personAttributeType.display}
          />
        </Form>
      </Formik>,
    );

    expect(screen.getByLabelText(/Referred by/i)).toBeInTheDocument();
    expect(screen.getByText(/Option 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Option 2/i)).toBeInTheDocument();
  });

  it('renders the Input component when conceptAnswers are not available', () => {
    mockedUseConceptAnswers.mockReturnValueOnce({
      data: null,
      isLoading: false,
    });

    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <CodedPersonAttributeField
            id="attributeId"
            personAttributeType={personAttributeType}
            answerConceptSetUuid={answerConceptSetUuid}
            label={personAttributeType.display}
          />
        </Form>
      </Formik>,
    );

    expect(screen.getByLabelText(/Referred by/i)).toBeInTheDocument();
    expect(screen.queryByText(/Option 1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Option 2/i)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders the Input component when conceptAnswers are still loading', () => {
    mockedUseConceptAnswers.mockReturnValueOnce({
      data: null,
      isLoading: true,
    });

    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <CodedPersonAttributeField
            id="attributeId"
            personAttributeType={personAttributeType}
            answerConceptSetUuid={answerConceptSetUuid}
            label={personAttributeType.display}
          />
        </Form>
      </Formik>,
    );

    expect(screen.getByLabelText(/Referred by/i)).toBeInTheDocument();
    expect(screen.queryByText(/Option 1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Option 2/i)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
