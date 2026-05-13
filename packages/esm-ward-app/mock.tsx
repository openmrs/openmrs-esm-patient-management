import { vi } from 'vitest';
import {
  mockAdmissionLocation,
  mockInpatientAdmissions,
  mockInpatientRequests,
  mockLocationInpatientWard,
} from '__mocks__';
import { useAdmissionLocation } from './src/hooks/useAdmissionLocation';
import { useInpatientAdmission } from './src/hooks/useInpatientAdmission';
import { createAndGetWardPatientGrouping } from './src/ward-view/ward-view.resource';
import { useInpatientRequest } from './src/hooks/useInpatientRequest';
import { useWardPatientGrouping } from './src/hooks/useWardPatientGrouping';
import { type WardViewContext } from './src/types';
import DefaultWardPatientCardHeader from './src/ward-view/default-ward/default-ward-patient-card-header.component';

vi.mock('./src/hooks/useAdmissionLocation', () => ({
  useAdmissionLocation: vi.fn(),
}));
vi.mock('./src/hooks/useInpatientAdmission', () => ({
  useInpatientAdmission: vi.fn(),
}));
vi.mock('./src/hooks/useInpatientRequest', () => ({
  useInpatientRequest: vi.fn(),
}));
vi.mock('./src/hooks/useWardPatientGrouping', () => ({
  useWardPatientGrouping: vi.fn(),
}));
const mockAdmissionLocationResponse = vi.mocked(useAdmissionLocation).mockReturnValue({
  error: undefined,
  mutate: vi.fn(),
  isValidating: false,
  isLoading: false,
  admissionLocation: mockAdmissionLocation,
});
const mockInpatientAdmissionResponse = vi.mocked(useInpatientAdmission).mockReturnValue({
  data: mockInpatientAdmissions,
  hasMore: false,
  loadMore: vi.fn(),
  isValidating: false,
  isLoading: false,
  error: undefined,
  mutate: vi.fn(),
  totalCount: mockInpatientAdmissions.length,
  nextUri: null,
});

const mockInpatientRequestResponse = vi.mocked(useInpatientRequest).mockReturnValue({
  inpatientRequests: mockInpatientRequests,
  hasMore: false,
  loadMore: vi.fn(),
  isValidating: false,
  isLoading: false,
  error: undefined,
  mutate: vi.fn(),
  totalCount: mockInpatientRequests.length,
  nextUri: null,
});

export const mockWardPatientGroupDetails = vi.mocked(useWardPatientGrouping).mockReturnValue({
  admissionLocationResponse: mockAdmissionLocationResponse(),
  inpatientAdmissionResponse: mockInpatientAdmissionResponse(),
  inpatientRequestResponse: mockInpatientRequestResponse(),
  ...createAndGetWardPatientGrouping(
    mockInpatientAdmissions,
    mockAdmissionLocation,
    mockInpatientRequests,
    [],
    mockLocationInpatientWard,
  ),
  isLoading: false,
  mutate: vi.fn(),
});

export const mockWardViewContext: WardViewContext = {
  wardPatientGroupDetails: mockWardPatientGroupDetails(),
  WardPatientHeader: DefaultWardPatientCardHeader,
};
