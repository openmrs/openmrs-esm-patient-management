import { openmrsFetch } from '@openmrs/esm-framework';
import { useEffect, useMemo, useState } from 'react';

export function useMPIPatient(patientId: string, apiPath: string = '/ws/fhir2/R4/MPIPatient') {
  const [patient, setPatient] = useState<fhir.Patient>(null);
  const [isLoading, setIsLoading] = useState(false);

  const url = useMemo(
    () => (apiPath.endsWith('/') ? apiPath + patientId : `${apiPath}/${patientId}`),
    [apiPath, patientId],
  );
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
