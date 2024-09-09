import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';

export function useMPIPatient(patientId: string) {
  const [patient, setPatient] = useState<fhir.Patient>(null);
  const [isLoading, setIsLoading] = useState(false);

  let url = `${fhirBaseUrl}/Patient/${patientId}/$cr`;

  useEffect(() => {
    if (patientId && url) {
      setIsLoading(true);
      openmrsFetch(url).then((response) => {
        if (response.status == 200 && response.data) {
          setPatient(response.data);
          setIsLoading(false);
        }
      });
    }
  }, [patientId, url]);

  return {
    isLoading,
    patient,
    error: null,
  };
}
