import DataTable, {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react/lib/components/DataTable';
import React from 'react';

const PatientTable: React.FC<{ patients: Array<Object>; columns: Array<PatientTableColumn> }> = ({
  patients,
  columns,
}) => {
  const rows = patients.map((patient) => {
    const row = {};
    columns.forEach((column) => {
      row['id'] = patient['id'] || patient['uuid'];
      row[column.key] = column.getValue ? column.getValue(patient) : patient[column.key];
    });
    return row;
  });
  return (
    <TableContainer>
      <DataTable rows={rows as any} headers={columns as any} isSortable={true} size="normal" useZebraStyles={true}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader
                    {...getHeaderProps({
                      header,
                      isSortable: header.isSortable,
                    })}>
                    {header.header?.content ?? header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </TableContainer>
  );
};

export interface PatientTableColumn {
  key: string;
  label: string;
  getValue?: (patient) => any;
}

export default PatientTable;
