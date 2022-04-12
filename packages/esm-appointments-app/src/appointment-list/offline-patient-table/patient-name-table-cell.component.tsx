import { navigate } from '@openmrs/esm-framework';
import { Link, TableCell } from 'carbon-components-react';
import React from 'react';

export interface PatientNameTableCellProps {
  patient: fhir.Patient;
}

const PatientNameTableCell: React.FC<PatientNameTableCellProps> = ({ patient }) => {
  const name = `${patient.name[0].given.join(' ')} ${patient.name[0].family}`;
  return (
    <TableCell>
      <Link onClick={() => navigate({ to: `${window.getOpenmrsSpaBase()}patient/${patient.id}/chart` })}>{name}</Link>
    </TableCell>
  );
};

export default PatientNameTableCell;
