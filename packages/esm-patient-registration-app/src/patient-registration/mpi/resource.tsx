import { useEffect, useState } from 'react';
import { patientsById } from './mock';

export function useMPIPatient(patientId) {
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchMPIPatient(patientId).then((response) => {
      if (response.status == 200 && response.data) {
        setPatient(response.data.entry[0].resource);
        setIsLoading(false);
      }
    });
  }, [patientId]);

  console.log({ patient });
  return {
    isLoading,
    patient,
    error: null,
  };
}

function fetchMPIPatient(patientId: string) {
  return Promise.resolve({ data: patientsById[patientId], status: 200 });
}
