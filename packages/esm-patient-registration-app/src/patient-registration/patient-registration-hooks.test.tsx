import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema } from '../config-schema';
import { useInitialFormValues, usePatientUuidMap } from './patient-registration-hooks';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const dateOfFirstVisit = 'd2a4f9a1-3c5e-4a7b-9b1d-6f8e2c4a1b3d';
const referredBy = '4dd56a75-14ab-4148-8700-1f4f704dc5b0';

describe('useInitialFormValues', () => {
  it('converts date attribute values to the YYYY-MM-DD format they are saved in', async () => {
    vi.mocked(useConfig).mockReturnValue(getDefaultsFromConfigSchema(esmPatientRegistrationSchema));
    mockOpenmrsFetch.mockImplementation(((url: string) =>
      Promise.resolve({
        data: url.includes('/attribute')
          ? {
              results: [
                {
                  uuid: 'a1',
                  display: '2026-09-20',
                  attributeType: {
                    uuid: dateOfFirstVisit,
                    display: 'Date of first visit',
                    format: 'org.openmrs.util.AttributableDate',
                  },
                  value: '2026-09-20T00:00:00.000+0000',
                },
                {
                  uuid: 'a2',
                  display: 'Dr. Smith',
                  attributeType: { uuid: referredBy, display: 'Referred by', format: 'java.lang.String' },
                  value: 'Dr. Smith',
                },
              ],
            }
          : { results: [] },
      })) as unknown as typeof openmrsFetch);

    const { result } = renderHook(() => useInitialFormValues(undefined, 'patient-uuid'), {
      wrapper: ({ children }) => <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>,
    });

    await waitFor(() => expect(result.current[0].attributes?.[dateOfFirstVisit]).toBe('2026-09-20'));
    expect(result.current[0].attributes[referredBy]).toBe('Dr. Smith');
  });
});

describe('editing registration obs', () => {
  const patientToEdit = {
    resourceType: 'Patient',
    id: 'patient-uuid',
    name: [{ id: 'name-uuid', given: ['John'], family: 'Doe' }],
    identifier: [],
    address: [],
    gender: 'male',
    birthDate: '2000-01-01',
  } as fhir.Patient;

  const registrationEncounters = [
    {
      uuid: 'older-encounter-uuid',
      encounterDatetime: '2026-01-01T10:00:00.000+0000',
      obs: [{ uuid: 'old-complaint-obs-uuid', concept: { uuid: 'chief-complaint-uuid' }, value: 'Old complaint' }],
    },
    {
      uuid: 'latest-encounter-uuid',
      encounterDatetime: '2026-06-01T10:00:00.000+0000',
      obs: [
        { uuid: 'complaint-obs-uuid', concept: { uuid: 'chief-complaint-uuid' }, value: 'Headache' },
        { uuid: 'nationality-obs-uuid', concept: { uuid: 'nationality-uuid' }, value: { uuid: 'usa', display: 'USA' } },
      ],
    },
  ];

  const wrapper = ({ children }) => <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;

  beforeEach(() => {
    const defaultConfig = getDefaultsFromConfigSchema(esmPatientRegistrationSchema);
    vi.mocked(useConfig).mockReturnValue({
      ...defaultConfig,
      registrationObs: { ...defaultConfig.registrationObs, encounterTypeUuid: 'registration-encounter-type-uuid' },
    });
    mockOpenmrsFetch.mockImplementation(((url: string) =>
      Promise.resolve({
        data: { results: url.includes('/encounter?') ? registrationEncounters : [] },
      })) as unknown as typeof openmrsFetch);
  });

  it('fills the form with the obs values of the latest registration encounter, including text obs', async () => {
    const { result } = renderHook(() => useInitialFormValues(patientToEdit, 'patient-uuid'), { wrapper });

    await waitFor(() =>
      expect(result.current[0].obs).toEqual({ 'chief-complaint-uuid': 'Headache', 'nationality-uuid': 'usa' }),
    );
  });

  it('keeps the uuids of the latest registration encounter and its obs, so they can be updated on save', async () => {
    const { result } = renderHook(() => usePatientUuidMap({}, patientToEdit, 'patient-uuid'), { wrapper });

    await waitFor(() =>
      expect(result.current[0].registrationEncounter).toEqual({
        uuid: 'latest-encounter-uuid',
        obs: {
          'chief-complaint-uuid': { uuid: 'complaint-obs-uuid', value: 'Headache' },
          'nationality-uuid': { uuid: 'nationality-obs-uuid', value: 'usa' },
        },
      }),
    );
    // The SWR response is copied before sorting, so its order is unchanged
    expect(registrationEncounters[0].uuid).toBe('older-encounter-uuid');
  });
});
