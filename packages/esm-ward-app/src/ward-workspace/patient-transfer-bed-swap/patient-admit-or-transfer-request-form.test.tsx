import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useAppContext, useConfig } from '@openmrs/esm-framework';
import { mockPatientAlice, mockVisitAlice } from '__mocks__';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { configSchema, type WardConfigObject } from '../../config-schema';
import useEmrConfiguration, { type EmrApiConfigurationResponse } from '../../hooks/useEmrConfiguration';
import useLocations from '../../hooks/useLocations';
import { useCreateEncounter } from '../../ward.resource';
import type { WardPatient, WardViewContext } from '../../types';
import PatientAdmitOrTransferForm from './patient-admit-or-transfer-request-form.component';

vi.mock('../../hooks/useEmrConfiguration', () => ({ default: vi.fn() }));
vi.mock('../../hooks/useLocations', () => ({ default: vi.fn() }));
vi.mock('../../ward.resource', () => ({ useCreateEncounter: vi.fn() }));

const mockUseConfig = vi.mocked(useConfig<WardConfigObject>);
const mockUseLocations = vi.mocked(useLocations);
const defaultConfig: WardConfigObject = getDefaultsFromConfigSchema(configSchema);

const emrConfiguration = {
  supportsTransferLocationTag: { uuid: 'transfer-tag-uuid', display: 'Transfer Location', name: 'Transfer Location' },
  dispositions: [],
} as unknown as EmrApiConfigurationResponse;

const wardPatient: WardPatient = {
  patient: mockPatientAlice,
  visit: mockVisitAlice,
  bed: null,
  inpatientAdmission: null,
  inpatientRequest: null,
};

function lastFilterCriteria() {
  return mockUseLocations.mock.calls.at(-1)[0];
}

describe('PatientAdmitOrTransferForm location selector', () => {
  beforeEach(() => {
    vi.mocked(useEmrConfiguration).mockReturnValue({
      emrConfiguration,
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
      mutateEmrConfiguration: vi.fn(),
    });
    vi.mocked(useCreateEncounter).mockReturnValue({
      createEncounter: vi.fn(),
      emrConfiguration,
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
    });
    vi.mocked(useAppContext<WardViewContext>).mockReturnValue({
      wardPatientGroupDetails: { inpatientAdmissionsByPatientUuid: new Map(), mutate: vi.fn() },
    } as unknown as WardViewContext);
    mockUseLocations.mockReturnValue({
      data: [{ resourceType: 'Location', id: 'icu-uuid', name: 'Intensive Care' }],
      isLoading: false,
      totalCount: 1,
      currentPage: 1,
      totalPages: 1,
      goToNext: vi.fn(),
      goToPrevious: vi.fn(),
    } as unknown as ReturnType<typeof useLocations>);
  });

  it('limits transfer locations to those within the visit location by default', () => {
    mockUseConfig.mockReturnValue(defaultConfig);

    render(<PatientAdmitOrTransferForm wardPatient={wardPatient} onSuccess={vi.fn()} onCancel={vi.fn()} />);

    expect(lastFilterCriteria()).toEqual([
      ['_tag', 'Transfer Location'],
      ['partof:below', mockVisitAlice.location.uuid],
    ]);
    expect(screen.getByRole('radio', { name: 'Intensive Care' })).toBeInTheDocument();
  });

  it('offers all transfer locations when restrictTransferLocationsToVisitLocation is false', () => {
    mockUseConfig.mockReturnValue({ ...defaultConfig, restrictTransferLocationsToVisitLocation: false });

    render(<PatientAdmitOrTransferForm wardPatient={wardPatient} onSuccess={vi.fn()} onCancel={vi.fn()} />);

    expect(lastFilterCriteria()).toEqual([['_tag', 'Transfer Location']]);
    expect(screen.getByRole('radio', { name: 'Intensive Care' })).toBeInTheDocument();
  });
});
