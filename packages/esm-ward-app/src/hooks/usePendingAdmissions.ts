import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type Bed, type BedStatus } from '../types/index';
import {mockPatientAlice} from '../../../../__mocks__/patient.mock';

export function usePendingAdmissions(locationUuid: string) {
  return {
    patients: [mockPatientAlice]
  };
}
