import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema } from '../config-schema';
import { useInitialFormValues } from './patient-registration-hooks';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const consentDate = 'b29617e3-c49e-5893-8dc7-e06b125a0264';
const referredBy = '4dd56a75-14ab-4148-8700-1f4f704dc5b0';

describe('useInitialFormValues', () => {
  it('loads a date attribute as the YYYY-MM-DD it was saved as, so saving the patient unchanged keeps it', async () => {
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
                    uuid: consentDate,
                    display: 'Consent Date',
                    format: 'org.openmrs.util.AttributableDate',
                  },
                  value: '2026-09-20T00:00:00.000+0000',
                },
                {
                  uuid: 'a2',
                  display: 'Dr. Smith',
                  attributeType: { uuid: referredBy, display: 'Referred by', format: 'java.lang.String' },
                  value: '2026-09-20T00:00:00.000+0000 is not a date here',
                },
              ],
            }
          : { results: [] },
      })) as never);

    const { result } = renderHook(() => useInitialFormValues(undefined, 'patient-uuid'), {
      wrapper: ({ children }) => <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>,
    });

    await waitFor(() => expect(result.current[0].attributes?.[consentDate]).toBe('2026-09-20'));
    expect(result.current[0].attributes[referredBy]).toBe('2026-09-20T00:00:00.000+0000 is not a date here');
  });
});
