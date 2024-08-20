// import { type FetchResponse, openmrsFetch, restBaseUrl, useAppContext } from '@openmrs/esm-framework';
// import type { DispositionType, InpatientRequestFetchResponse, WardAppContext } from '../types';
// import useSWR from 'swr';
// import useWardLocation from './useWardLocation';
// import { useMemo } from 'react';

// interface MothersAndChildrenSearchCriteria {
//   mother?: Array<string>,
//   child?: Array<string>,
//   requireMotherHasActiveVisit?: boolean;
//   requireChildHasActiveVisit?: boolean;
//   requireChildBornDuringMothersActiveVisit?: boolean;
// }

// export function useMotherAndChildren(
//   criteria: MothersAndChildrenSearchCriteria,
//   rep: string = "default",
// ) {
//   const {allPatientsByPatientUuid} = useAppContext<WardAppContext>('ward');
//   const patientUuids = Array(allPatientsByPatientUuid.keys()).join(',');

//   patientUuids
//   useSWR(`${restBaseUrl}/emrapi/maternal/mothersAndChildren`))

//   return results;
// }
