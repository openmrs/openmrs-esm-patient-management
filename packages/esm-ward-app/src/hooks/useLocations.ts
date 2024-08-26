import { fhirBaseUrl, useFhirPagination } from '@openmrs/esm-framework';

export default function useLocations(
  filterCriteria: Array<Array<string>> = [],
  pageSize: number,
  skip: boolean = false,
) {
  const searchParams = new URLSearchParams(filterCriteria);
  const urlWithSearchParams = `${fhirBaseUrl}/Location?${searchParams.toString()}`;
  return useFhirPagination<fhir.Location>(skip ? null : urlWithSearchParams, pageSize, { immutable: true });
}
