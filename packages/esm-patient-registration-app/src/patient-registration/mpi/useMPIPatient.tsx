import { openmrsFetch } from '@openmrs/esm-framework';
import { useEffect, useMemo, useState } from 'react';

export function useMPIPatient(patientId: string, path: string = '/ws/fhir2/R4/MPIPatient') {
  const [patient, setPatient] = useState<fhir.Patient>(null);
  const [isLoading, setIsLoading] = useState(false);

  const url = useMemo(() => (path.endsWith('/') ? path + patientId : `${path}/${patientId}`), [path, patientId]);
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
