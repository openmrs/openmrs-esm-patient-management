import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema } from '../config-schema';
import { useInitialFormValues } from './patient-registration-hooks';

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
