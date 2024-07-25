import React from 'react';
import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import { usePersonAttributeType } from './person-attributes.resource';
import { useConceptAnswers } from '../field.resource';
import { type FieldDefinition } from '../../../config-schema';
import { PersonAttributeField } from './person-attribute-field.component';

jest.mock('./person-attributes.resource');
jest.mock('../field.resource');

const mockUsePersonAttributeType = jest.mocked(usePersonAttributeType);
const mockUseConceptAnswers = jest.mocked(useConceptAnswers);

const mockPersonAttributeType = {
  format: 'java.lang.String',
  display: 'Referred by',
  uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
  name: 'Referred by',
  description: 'The person who referred the patient',
};

let fieldDefinition: FieldDefinition = {
  id: 'referredby',
  label: 'Referred by',
  type: 'person attribute',
  uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
  answerConceptSetUuid: '6682d17f-0777-45e4-a39b-93f77eb3531c',
  validation: {
    matches: '',
    required: true,
  },
  showHeading: true,
};

describe('PersonAttributeField', () => {
  beforeEach(() => {
    mockUsePersonAttributeType.mockReturnValue({
      data: mockPersonAttributeType,
      isLoading: false,
      error: null,
    });
  });

  it('renders the text input field for String format', () => {
    renderPersonAttributeField();

    const input = screen.getByLabelText(/Referred by/i) as HTMLInputElement;
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('text');
  });

  it('should not show heading if showHeading is false', () => {
    fieldDefinition = {
      ...fieldDefinition,
      showHeading: false,
    };

    renderPersonAttributeField();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders the coded attribute field for Concept format', () => {
    fieldDefinition = {
      id: 'referredby',
      ...fieldDefinition,
      label: 'Referred by',
    };

    mockUsePersonAttributeType.mockReturnValue({
      data: { ...mockPersonAttributeType, format: 'org.openmrs.Concept' },
      isLoading: false,
      error: null,
    });

    mockUseConceptAnswers.mockReturnValueOnce({
      data: [
        { uuid: '1', display: 'Option 1' },
        { uuid: '2', display: 'Option 2' },
      ],
      isLoading: false,
    });

    renderPersonAttributeField();

    const input = screen.getByLabelText(/Referred by/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('select-one');
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders an error notification if attribute type has unknown format', () => {
    mockUsePersonAttributeType.mockReturnValue({
      data: { ...mockPersonAttributeType, format: 'unknown' },
      isLoading: false,
      error: null,
    });

    renderPersonAttributeField();

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(/Patient attribute type has unknown format/i)).toBeInTheDocument();
  });

  it('renders an error notification if unable to fetch attribute type', () => {
    mockUsePersonAttributeType.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch attribute type'),
    });

    fieldDefinition = {
      id: 'referredBy',
      uuid: 'attribute-uuid',
      label: 'Attribute',
      showHeading: false,
      type: 'person attribute',
    };

    renderPersonAttributeField();

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(/Unable to fetch person attribute type/i)).toBeInTheDocument();
  });

  it('renders a skeleton if attribute type is loading', async () => {
    mockUsePersonAttributeType.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    fieldDefinition = {
      id: 'referredBy',
      uuid: 'attribute-uuid',
      label: 'Attribute',
      showHeading: true,
      type: 'person attribute',
    };

    renderPersonAttributeField();
    await screen.findByRole('heading', { name: /attribute/i });
    expect(screen.queryByLabelText(/Referred by/i)).not.toBeInTheDocument();
  });
});

function renderPersonAttributeField() {
  render(
    <Formik initialValues={{}} onSubmit={() => {}}>
      <Form>
        <PersonAttributeField fieldDefinition={fieldDefinition} />
      </Form>
    </Formik>,
  );
}
