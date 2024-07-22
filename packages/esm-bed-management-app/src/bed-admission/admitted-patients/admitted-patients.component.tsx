import React from 'react';
import ActivePatientsTable from '../active-patients/active-patients-table.component';

interface AdmittedPatientsListProps {
  status: string;
  setPatientCount: (value: number) => void;
}

const AdmittedPatientsList: React.FC<AdmittedPatientsListProps> = ({ status, setPatientCount }) => {
  return (
    <>
      <ActivePatientsTable status={status} setPatientCount={setPatientCount} />
    </>
  );
};

export default AdmittedPatientsList;
