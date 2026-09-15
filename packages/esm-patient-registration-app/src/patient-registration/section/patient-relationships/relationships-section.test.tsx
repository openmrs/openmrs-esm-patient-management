import React from 'react';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { type Resources } from '../../../offline.resources';
import { type FormValues } from '../../patient-registration.types';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { RelationshipsSection } from './relationships-section.component';
import { ResourcesContextProvider } from '../../../resources-context';
import { renderWithContext } from 'tools';
import { initialFormValues } from '../../patient-registration.component';

vi.mock('../../patient-registration.resource', () => ({
  fetchPerson: vi.fn().mockResolvedValue([
    { uuid: '42ae5ce0-d64b-11ea-9064-5adc43bbdd24', display: 'Person 1' },
    { uuid: '691eed12-c0f1-11e2-94be-8c13b969e334', display: 'Person 2' },
  ]),
}));

const mockRelationshipTypes = {
  results: [
    {
      displayAIsToB: 'Mother',
      aIsToB: 'Mother',
      bIsToA: 'Child',
      displayBIsToA: 'Child',
      uuid: '42ae5ce0-d64b-11ea-9064-5adc43bbdd34',
    },
    {
      displayAIsToB: 'Father',
      aIsToB: 'Father',
      bIsToA: 'Child',
      displayBIsToA: 'Child',
      uuid: '52ae5ce0-d64b-11ea-9064-5adc43bbdd24',
    },
  ],
};

/**
 * Helper to render RelationshipsSection with Formik for state-dependent tests.
 */
function renderRelationshipsSectionWithFormik(
  initialValues: Partial<FormValues> = {},
  resourcesContextValue: Resources,
) {
  const defaultValues = {
    ...initialFormValues,
    relationships: [],
    ...initialValues,
  };

  let formValuesRef: FormValues = { ...initialFormValues, ...defaultValues } as FormValues;

  const utils = renderWithContext(
    <Formik initialValues={defaultValues} onSubmit={() => {}}>
      {({ setFieldValue, values }) => {
        formValuesRef = { ...initialFormValues, ...values } as FormValues;
        return (
          <Form>
            <PatientRegistrationContextProvider
              value={{
                identifierTypes: [],
                values: formValuesRef,
                validationSchema: null,
                inEditMode: false,
                setFieldValue: setFieldValue as any,
                setCapturePhotoProps: vi.fn(),
                setFieldTouched: vi.fn().mockResolvedValue(undefined),
                currentPhoto: '',
                isOffline: false,
                initialFormValues: formValuesRef,
              }}>
              <RelationshipsSection />
            </PatientRegistrationContextProvider>
          </Form>
        );
      }}
    </Formik>,
    ResourcesContextProvider,
    resourcesContextValue,
  );

  return {
    ...utils,
    getFormValues: () => formValuesRef,
  };
}

describe('RelationshipsSection', () => {
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error');
  });

  afterEach(() => {
    const keyWarnings = consoleErrorSpy.mock.calls.filter((call) => String(call[0]).includes('unique "key" prop'));
    consoleErrorSpy.mockRestore();
    expect(keyWarnings).toHaveLength(0);
  });

  describe('Loading state', () => {
    it('renders a loader when relationshipTypes are not available', () => {
      const mockResourcesContextValue = {
        addressTemplate: null,
        currentSession: {
          authenticated: true,
          sessionId: 'JSESSION',
          currentProvider: { uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002', identifier: 'PRO-123' },
        },
        identifierTypes: [],
        relationshipTypes: null,
      } as Resources;

      renderRelationshipsSectionWithFormik({}, mockResourcesContextValue);

      expect(screen.getByLabelText(/loading relationships section/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText(/add relationship/i)).not.toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    it('renders the relationships section when relationshipTypes are available', () => {
      const mockResourcesContextValue = {
        addressTemplate: null,
        currentSession: {
          authenticated: true,
          sessionId: 'JSESSION',
          currentProvider: { uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002', identifier: 'PRO-123' },
        },
        identifierTypes: [],
        relationshipTypes: mockRelationshipTypes,
      } as Resources;

      renderRelationshipsSectionWithFormik({}, mockResourcesContextValue);

      expect(screen.getByLabelText(/relationships section/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add relationship/i })).toBeInTheDocument();
    });

    it('renders existing relationships', () => {
      const mockResourcesContextValue = {
        addressTemplate: null,
        currentSession: {
          authenticated: true,
          sessionId: 'JSESSION',
          currentProvider: { uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002', identifier: 'PRO-123' },
        },
        identifierTypes: [],
        relationshipTypes: mockRelationshipTypes,
      } as Resources;

      renderRelationshipsSectionWithFormik(
        {
          relationships: [
            {
              clientId: 'new-relationship-1',
              action: 'ADD',
              relatedPersonUuid: '11524ae7-3ef6-4ab6-aff6-804ffc58704a',
              relatedPersonName: 'John Doe',
              relationshipType: '',
            },
          ],
        },
        mockResourcesContextValue,
      );

      expect(screen.getByLabelText(/relationships section/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /relationship/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('searchbox', { name: /full name/i })).toBeInTheDocument();
    });

    it('renders relationship type options', () => {
      const mockResourcesContextValue = {
        addressTemplate: null,
        currentSession: {
          authenticated: true,
          sessionId: 'JSESSION',
          currentProvider: { uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002', identifier: 'PRO-123' },
        },
        identifierTypes: [],
        relationshipTypes: mockRelationshipTypes,
      } as Resources;

      renderRelationshipsSectionWithFormik(
        {
          relationships: [
            { clientId: 'new-relationship-1', action: 'ADD', relatedPersonUuid: '', relationshipType: '' },
          ],
        },
        mockResourcesContextValue,
      );

      expect(screen.getByRole('option', { name: /mother/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /father/i })).toBeInTheDocument();
      expect(screen.getAllByRole('option', { name: /child/i }).length).toBeGreaterThan(0);
    });
  });

  describe('User interaction', () => {
    it('adds a new relationship when user clicks add relationship button', async () => {
      const user = userEvent.setup();
      const mockResourcesContextValue = {
        addressTemplate: null,
        currentSession: {
          authenticated: true,
          sessionId: 'JSESSION',
          currentProvider: { uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002', identifier: 'PRO-123' },
        },
        identifierTypes: [],
        relationshipTypes: mockRelationshipTypes,
      } as Resources;

      const { getFormValues } = renderRelationshipsSectionWithFormik({}, mockResourcesContextValue);

      const addButton = screen.getByRole('button', { name: /add relationship/i });
      expect(addButton).toBeInTheDocument();

      await user.click(addButton);

      await waitFor(() => {
        const formValues = getFormValues();
        expect(formValues.relationships.length).toBe(1);
      });

      await waitFor(() => {
        const formValues = getFormValues();
        expect(formValues.relationships[0]?.action).toBe('ADD');
      });

      // New relationship form should be visible
      expect(screen.getByRole('searchbox', { name: /full name/i })).toBeInTheDocument();
    });

    it('removes a new relationship from the array when user clicks delete button', async () => {
      const user = userEvent.setup();
      const mockResourcesContextValue = {
        addressTemplate: null,
        currentSession: {
          authenticated: true,
          sessionId: 'JSESSION',
          currentProvider: { uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002', identifier: 'PRO-123' },
        },
        identifierTypes: [],
        relationshipTypes: mockRelationshipTypes,
      } as Resources;

      const { getFormValues } = renderRelationshipsSectionWithFormik(
        {
          relationships: [
            {
              clientId: 'new-relationship-1',
              action: 'ADD',
              relatedPersonUuid: 'test-uuid',
              relatedPersonName: 'Test Person',
              relationshipType: '',
            },
          ],
        },
        mockResourcesContextValue,
      );

      expect(getFormValues().relationships.length).toBe(1);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();

      await user.click(deleteButton);

      // For new relationships (action: 'ADD'), clicking delete removes them from the array
      await waitFor(() => {
        const formValues = getFormValues();
        expect(formValues.relationships.length).toBe(0);
      });
    });

    it('marks an existing relationship for deletion when user clicks delete button', async () => {
      const user = userEvent.setup();
      const mockResourcesContextValue = {
        addressTemplate: null,
        currentSession: {
          authenticated: true,
          sessionId: 'JSESSION',
          currentProvider: { uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002', identifier: 'PRO-123' },
        },
        identifierTypes: [],
        relationshipTypes: mockRelationshipTypes,
      } as Resources;

      const { getFormValues } = renderRelationshipsSectionWithFormik(
        {
          relationships: [
            {
              uuid: 'existing-relationship-uuid',
              relatedPersonUuid: 'test-uuid',
              relatedPersonName: 'Test Person',
              relationshipType: '42ae5ce0-d64b-11ea-9064-5adc43bbdd34/aIsToB',
            },
          ],
        },
        mockResourcesContextValue,
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();

      await user.click(deleteButton);

      // For existing relationships (with uuid, no action), clicking delete sets action to 'DELETE'
      await waitFor(() => {
        const formValues = getFormValues();
        expect(formValues.relationships[0]?.action).toBe('DELETE');
      });

      // Should show restore notification
      await waitFor(() => {
        expect(screen.getByText(/relationship removed/i)).toBeInTheDocument();
      });
    });

    it('keeps the remaining new relationship row associated with its own values when another row is removed', async () => {
      const user = userEvent.setup();
      const person1Uuid = '42ae5ce0-d64b-11ea-9064-5adc43bbdd24';
      const person2Uuid = '691eed12-c0f1-11e2-94be-8c13b969e334';
      const motherValue = '42ae5ce0-d64b-11ea-9064-5adc43bbdd34/aIsToB';
      const fatherValue = '52ae5ce0-d64b-11ea-9064-5adc43bbdd24/aIsToB';
      const mockResourcesContextValue = {
        addressTemplate: null,
        currentSession: {
          authenticated: true,
          sessionId: 'JSESSION',
          currentProvider: { uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002', identifier: 'PRO-123' },
        },
        identifierTypes: [],
        relationshipTypes: mockRelationshipTypes,
      } as Resources;

      const { getFormValues } = renderRelationshipsSectionWithFormik({}, mockResourcesContextValue);

      const addButton = screen.getByRole('button', { name: /add relationship/i });
      await user.click(addButton);
      await user.click(addButton);

      const searchboxes = screen.getAllByRole('searchbox', { name: /full name/i });
      const selects = screen.getAllByRole('combobox', { name: /relationship/i });
      expect(searchboxes).toHaveLength(2);
      expect(selects).toHaveLength(2);

      await user.type(searchboxes[0], 'Person');
      await user.click(await screen.findByText('Person 1'));
      await user.selectOptions(selects[0], motherValue);

      await user.type(searchboxes[1], 'Person');
      await user.click(await screen.findByText('Person 2'));
      await user.selectOptions(selects[1], fatherValue);

      await waitFor(() => {
        const { relationships } = getFormValues();
        expect(relationships[0]).toMatchObject({ relatedPersonUuid: person1Uuid, relationshipType: motherValue });
        expect(relationships[1]).toMatchObject({ relatedPersonUuid: person2Uuid, relationshipType: fatherValue });
      });

      await user.click(screen.getAllByRole('button', { name: /delete/i })[0]);

      await waitFor(() => {
        const { relationships } = getFormValues();
        expect(relationships).toHaveLength(1);
        expect(relationships[0]).toMatchObject({
          action: 'ADD',
          relatedPersonUuid: person2Uuid,
          relationshipType: fatherValue,
        });
      });
      expect(screen.getByRole('searchbox', { name: /full name/i })).toHaveValue('Person 2');
      expect(screen.getByRole('combobox', { name: /relationship/i })).toHaveValue(fatherValue);
    });
  });
});
