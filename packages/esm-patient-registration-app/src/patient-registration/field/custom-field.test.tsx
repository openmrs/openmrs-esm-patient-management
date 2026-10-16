import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema, type FieldDefinition, type RegistrationConfig } from '../../config-schema';
import { type FormValues } from '../patient-registration.types';
import { usePersonAttributeType } from './person-attributes/person-attributes.resource';
import { CustomField } from './custom-field.component';

vi.mock('./person-attributes/person-attributes.resource', async () => ({
  ...((await vi.importActual('./person-attributes/person-attributes.resource')) as object),
  usePersonAttributeType: vi.fn(),
}));

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);
const mockUsePersonAttributeType = vi.mocked(usePersonAttributeType);

const relationshipUuid = 'relationship-attribute-uuid';
const guardianNameUuid = 'guardian-name-attribute-uuid';
const selfUuid = 'self-concept-uuid';
const guardianUuid = 'guardian-concept-uuid';

const fieldDefinitions = [
  {
    id: 'relationship',
    type: 'person attribute',
    uuid: relationshipUuid,
    label: 'Relationship to Patient',
    customConceptAnswers: [
      { uuid: selfUuid, label: 'Self' },
      { uuid: guardianUuid, label: 'Guardian' },
    ],
  },
  {
    id: 'guardianName',
    type: 'person attribute',
    uuid: guardianNameUuid,
    label: 'Name of guardian',
    showWhen: { field: 'relationship', answers: [guardianUuid] },
  },
] as Array<FieldDefinition>;

function renderFields(attributes: Record<string, string> = {}) {
  let values: FormValues;
  render(
    <Formik initialValues={{ attributes } as FormValues} onSubmit={vi.fn()}>
      {(formik) => {
        values = formik.values;
        return (
          <Form>
            <CustomField name="relationship" />
            <CustomField name="guardianName" />
          </Form>
        );
      }}
    </Formik>,
  );
  return { getAttributes: () => values.attributes };
}

describe('CustomField showWhen', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema), fieldDefinitions });
    mockUsePersonAttributeType.mockImplementation((uuid) => ({
      data:
        uuid === relationshipUuid
          ? { uuid, display: 'Relationship', name: 'Relationship', description: '', format: 'org.openmrs.Concept' }
          : { uuid, display: 'Guardian name', name: 'Guardian name', description: '', format: 'java.lang.String' },
      isLoading: false,
      error: null,
    }));
  });

  it('shows the field only while the controlling field has one of its answers', async () => {
    const user = userEvent.setup();
    renderFields();

    expect(screen.queryByRole('textbox', { name: /name of guardian/i })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: /relationship to patient/i }), 'Guardian');
    expect(screen.getByRole('textbox', { name: /name of guardian/i })).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: /relationship to patient/i }), 'Self');
    expect(screen.queryByRole('textbox', { name: /name of guardian/i })).not.toBeInTheDocument();
  });

  it('clears a value entered before the field was hidden', async () => {
    const user = userEvent.setup();
    const { getAttributes } = renderFields();

    await user.selectOptions(screen.getByRole('combobox', { name: /relationship to patient/i }), 'Guardian');
    await user.type(screen.getByRole('textbox', { name: /name of guardian/i }), 'Jane Doe');
    expect(getAttributes()[guardianNameUuid]).toBe('Jane Doe');

    await user.selectOptions(screen.getByRole('combobox', { name: /relationship to patient/i }), 'Self');
    expect(getAttributes()[guardianNameUuid]).toBe('');
  });

  it('keeps a saved value of a field that loads hidden', () => {
    const { getAttributes } = renderFields({ [relationshipUuid]: selfUuid, [guardianNameUuid]: 'Jane Doe' });

    expect(screen.queryByRole('textbox', { name: /name of guardian/i })).not.toBeInTheDocument();
    expect(getAttributes()[guardianNameUuid]).toBe('Jane Doe');
  });

  it('always shows a field without showWhen', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldDefinitions: [fieldDefinitions[0], { ...fieldDefinitions[1], showWhen: undefined }],
    });
    renderFields();

    expect(screen.getByRole('textbox', { name: /name of guardian/i })).toBeInTheDocument();
  });
});
