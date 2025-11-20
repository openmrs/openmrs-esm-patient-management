import { type FetchResponse, openmrsFetch, showToast } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type ConceptAnswers, type ConceptResponse } from '../patient-registration/patient-registration.types';
import { type ClientRegistryFhirPatientResponse } from './verification-types';

export function useSearchClientRegistry(searchTerm: string) {
  // const url = `/ws/fhir2/R4/Patient/$cr-search?identifier=${searchTerm}`;
  const url = '/ws/rest/v1/mohbilling/transaction';

  const { data, error } = useSWR<{ data: ClientRegistryFhirPatientResponse }>(url, openmrsFetch);

  if (error) {
    throw new Error(`Error searching client registry: ${error.message}`);
  }

  // return data;
  return {
    data: {
      resourceType: 'Bundle',
      id: 'b479b2c9-bab2-4853-9c59-b89e8f8facb0',
      meta: {
        lastUpdated: '2025-11-20T09:34:34.308+03:00',
      },
      type: 'collection',
      total: 1,
      link: [
        {
          relation: 'self',
          url: 'http://localhost:8080/openmrs/ws/fhir2/R4/Patient/$cr-search?identifier=233337-H',
        },
      ],
      entry: [
        {
          fullUrl: 'http://10.10.69.42:8089/clientregistry/Patient/233337-H',
          resource: {
            resourceType: 'Patient',
            id: '233337-H',
            meta: {
              versionId: '1763549709000',
              lastUpdated: '2025-11-19T13:55:09.000+03:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>f57a5449-25d4-414b-ad07-85ce0f8c124f</td></tr><tr><td>Identifier:</td><td><div>233337-H</div><div>http://test.rwanda.emr/kibagabaga/f57a5449-25d4-414b-ad07-85ce0f8c124f</div><div>233337-H</div></td></tr><tr><td>Active:</td><td>true</td></tr><tr><td>Name:</td><td> ComprehensiveTest <b>ENDPOINT </b></td></tr><tr><td>Gender:</td><td>FEMALE</td></tr><tr><td>Birth Date:</td><td>10/05/1990</td></tr><tr><td>Deceased:</td><td>false</td></tr><tr><td>Address:</td><td><span>Kigali </span><span>Rwanda </span></td></tr></tbody></table></div>',
            },
            identifier: [
              {
                id: 'c48d8239-6582-4a9c-a500-5eb5cc0361ca',
                extension: [
                  {
                    url: 'http://fhir.openmrs.org/ext/patient/identifier#location',
                    valueReference: {
                      reference: 'Location/ba6c3005-fe8e-44e0-bd1d-8253306038eb',
                      type: 'Location',
                      display: 'Hope Hospital',
                    },
                  },
                ],
                use: 'official',
                type: {
                  coding: [
                    {
                      code: 'c37ab937-0fb6-4d98-8c6f-c394c6fa2e14',
                    },
                  ],
                  text: 'Primary Care ID Type',
                },
                value: '233337-H',
              },
              {
                use: 'official',
                system: 'http://clientregistry.org/openmrs',
                value: 'http://test.rwanda.emr/kibagabaga/f57a5449-25d4-414b-ad07-85ce0f8c124f',
              },
              {
                use: 'official',
                system: 'UPI',
                value: '233337-H',
              },
            ],
            active: true,
            name: [
              {
                id: 'd5dcf4cd-586c-4b20-b879-af83e5e59a8f',
                use: 'official',
                text: 'ComprehensiveTest Endpoint',
                family: 'Endpoint',
                given: ['ComprehensiveTest'],
              },
            ],
            gender: 'female',
            birthDate: '1990-05-10',
            deceasedBoolean: false,
            address: [
              {
                id: '4a91085f-05ae-4b0b-ac18-9fff80768f86',
                extension: [
                  {
                    url: 'http://fhir.openmrs.org/ext/address',
                    extension: [
                      {
                        url: 'http://fhir.openmrs.org/ext/address#address1',
                        valueString: '123 Test Street',
                      },
                    ],
                  },
                ],
                use: 'home',
                city: 'Kigali',
                country: 'Rwanda',
              },
            ],
          },
        },
      ],
    },
    error: error,
  };
}

export function useConceptAnswers(conceptUuid: string): { data: Array<ConceptAnswers>; isLoading: boolean } {
  const { data, error, isLoading } = useSWR<FetchResponse<ConceptResponse>, Error>(
    `/ws/rest/v1/concept/${conceptUuid}`,
    openmrsFetch,
  );
  if (error) {
    showToast({
      title: error.name,
      description: error.message,
      kind: 'error',
    });
  }
  return { data: data?.data?.answers ?? [], isLoading };
}
