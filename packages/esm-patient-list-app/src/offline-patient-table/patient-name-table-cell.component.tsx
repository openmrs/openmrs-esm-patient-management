import { navigate } from '@openmrs/esm-framework';
import { TableCell } from 'carbon-components-react/lib/components/DataTable';
import Link from 'carbon-components-react/lib/components/Link';
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
