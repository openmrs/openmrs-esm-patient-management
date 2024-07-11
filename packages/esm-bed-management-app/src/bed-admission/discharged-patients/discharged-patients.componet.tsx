import React from "react";
import ActivePatientsTable from "../active-patients/active-patients-table.component";
interface DischargedPatientsListProps {
  status: string;
  setPatientCount: (value: number) => void;
}

const DischargedPatientsList: React.FC<DischargedPatientsListProps> = ({
  status,
  setPatientCount,
}) => {
  return (
    <>
      <ActivePatientsTable status={status} setPatientCount={setPatientCount} />
    </>
  );
};

export default DischargedPatientsList;
