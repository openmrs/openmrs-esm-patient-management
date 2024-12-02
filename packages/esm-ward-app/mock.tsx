import { mockAdmissionLocation, mockInpatientAdmissions, mockInpatientRequests } from '__mocks__';
import { useAdmissionLocation } from './src/hooks/useAdmissionLocation';
import { useInpatientAdmission } from './src/hooks/useInpatientAdmission';
import { createAndGetWardPatientGrouping } from './src/ward-view/ward-view.resource';
import { useInpatientRequest } from './src/hooks/useInpatientRequest';
import { useWardPatientGrouping } from './src/hooks/useWardPatientGrouping';
import { type WardViewContext } from './src/types';
import DefaultWardPatientCardHeader from './src/ward-view/default-ward/default-ward-patient-card-header.component';

jest.mock('./src/hooks/useAdmissionLocation', () => ({
  useAdmissionLocation: jest.fn(),
}));
jest.mock('./src/hooks/useInpatientAdmission', () => ({
  useInpatientAdmission: jest.fn(),
}));
jest.mock('./src/hooks/useInpatientRequest', () => ({
  useInpatientRequest: jest.fn(),
}));
jest.mock('./src/hooks/useWardPatientGrouping', () => ({
  useWardPatientGrouping: jest.fn(),
}));
const mockAdmissionLocationResponse = jest.mocked(useAdmissionLocation).mockReturnValue({
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  admissionLocation: mockAdmissionLocation,
});
const mockInpatientAdmissionResponse = jest.mocked(useInpatientAdmission).mockReturnValue({
  data: mockInpatientAdmissions,
  hasMore: false,
  loadMore: jest.fn(),
  isValidating: false,
  isLoading: false,
  error: undefined,
  mutate: jest.fn(),
  totalCount: mockInpatientAdmissions.length,
});

const mockInpatientRequestResponse = jest.mocked(useInpatientRequest).mockReturnValue({
  inpatientRequests: mockInpatientRequests,
  hasMore: false,
  loadMore: jest.fn(),
  isValidating: false,
  isLoading: false,
  error: undefined,
  mutate: jest.fn(),
  totalCount: mockInpatientRequests.length,
});

export const mockWardPatientGroupDetails = jest.mocked(useWardPatientGrouping).mockReturnValue({
  admissionLocationResponse: mockAdmissionLocationResponse(),
  inpatientAdmissionResponse: mockInpatientAdmissionResponse(),
  inpatientRequestResponse: mockInpatientRequestResponse(),
  ...createAndGetWardPatientGrouping(mockInpatientAdmissions, mockAdmissionLocation, mockInpatientRequests),
  isLoading: false,
  mutate: jest.fn(),
});

export const mockWardViewContext: WardViewContext = {
  wardPatientGroupDetails: mockWardPatientGroupDetails(),
  WardPatientHeader: DefaultWardPatientCardHeader,
};
