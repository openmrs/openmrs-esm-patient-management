import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { IdentifierInput } from './identifier-input.component';
import { initialFormValues } from '../../../patient-registration.component';
import { PatientIdentifierType } from '../../../patient-registration-types';

describe.skip('identifier input', () => {
  const openmrsID = {
    name: 'OpenMRS ID',
    fieldName: 'openMrsId',
    required: true,
    uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
    format: null,
    isPrimary: true,
    identifierSources: [
      {
        uuid: '691eed12-c0f1-11e2-94be-8c13b969e334',
        name: 'Generator 1 for OpenMRS ID',
        autoGenerationOption: {
          manualEntryEnabled: false,
          automaticGenerationEnabled: true,
        },
      },
      {
        uuid: '01af8526-cea4-4175-aa90-340acb411771',
        name: 'Generator 2 for OpenMRS ID',
        autoGenerationOption: {
          manualEntryEnabled: true,
          automaticGenerationEnabled: true,
        },
      },
    ],
    autoGenerationSource: null,
  };
  const setupIdentifierInput = async (identifierType: PatientIdentifierType) => {
    initialFormValues['source-for-' + identifierType.fieldName] = identifierType.identifierSources[0].name;
    render(
      <Formik initialValues={initialFormValues} onSubmit={null}>
        <Form>
          <IdentifierInput identifierType={identifierType} />
        </Form>
      </Formik>,
    );
    const identifierInput = screen.getByLabelText(identifierType.fieldName) as HTMLInputElement;
    let identifierSourceSelectInput = undefined;
    try {
      identifierSourceSelectInput = screen.getByLabelText('source-for-' + identifierType.fieldName) as HTMLInputElement;
    } catch (e) {}
    return {
      identifierInput,
      identifierSourceSelectInput,
    };
  };

  it('exists', async () => {
    const { identifierInput, identifierSourceSelectInput } = await setupIdentifierInput(openmrsID);
    expect(identifierInput.type).toBe('text');
    expect(identifierSourceSelectInput.type).toBe('select-one');
  });

  it('has correct props for identifier source select input', async () => {
    const { identifierSourceSelectInput } = await setupIdentifierInput(openmrsID);
    expect(identifierSourceSelectInput.childElementCount).toBe(3);
    expect(identifierSourceSelectInput.value).toBe('Generator 1 for OpenMRS ID');
  });

  it('has correct props for identifier input', async () => {
    const { identifierInput } = await setupIdentifierInput(openmrsID);
    expect(identifierInput.placeholder).toBe('Auto-generated');
    expect(identifierInput.disabled).toBe(true);
  });

  it('text input should not be disabled if manual entry is enabled', async () => {
    // setup
    openmrsID.identifierSources[0].autoGenerationOption.manualEntryEnabled = true;
    // replay
    const { identifierInput } = await setupIdentifierInput(openmrsID);
    expect(identifierInput.placeholder).toBe('Auto-generated');
    expect(identifierInput.disabled).toBe(false);
  });

  it('should not render select widget if auto-entry is false', async () => {
    // setup
    openmrsID.identifierSources = [
      {
        uuid: '691eed12-c0f1-11e2-94be-8c13b969e334',
        name: 'Generator 1 for OpenMRS ID',
        autoGenerationOption: {
          manualEntryEnabled: true,
          automaticGenerationEnabled: false,
        },
      },
    ];
    // replay
    const { identifierInput, identifierSourceSelectInput } = await setupIdentifierInput(openmrsID);
    expect(identifierInput.placeholder).toBe('Enter identifier');
    expect(identifierInput.disabled).toBe(false);
    expect(identifierSourceSelectInput).toBe(undefined);
  });
});
