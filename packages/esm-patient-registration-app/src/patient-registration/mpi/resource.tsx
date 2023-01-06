import { openmrsFetch } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';

export function useMPIPatient(patientId) {
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    openmrsFetch('/ws/fhir2/R4/MPIPatient/' + patientId).then((response) => {
      if (response.status == 200 && response.data) {
        setPatient(response.data);
        setIsLoading(false);
      }
    });
  }, [patientId]);

  return {
    isLoading,
    patient,
    error: null,
  };
}
