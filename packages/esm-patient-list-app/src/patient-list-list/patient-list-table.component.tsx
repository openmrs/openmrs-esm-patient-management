import React, { CSSProperties } from 'react';
import {
  DataTable,
  DataTableCustomRenderProps,
  DataTableHeader,
  DataTableSkeleton,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react';
import Star16 from '@carbon/icons-react/es/star/16';
import StarFilled16 from '@carbon/icons-react/es/star--filled/16';
import { useTranslation } from 'react-i18next';
import { useToggleStarredMutation, PatientList, PatientListType } from '../api';
import { useSessionUser, ConfigurableLink } from '@openmrs/esm-framework';

const defaultHeaders: Array<DataTableHeader<keyof PatientList>> = [
  { key: 'display', header: 'List Name' },
  { key: 'type', header: 'List Type' },
  { key: 'size', header: 'No. Patients' },
  { key: 'isStarred', header: '' },
];

interface PatientListTableProps {
  style?: CSSProperties;
  patientLists: Array<PatientList>;
  loading?: boolean;
  headers?: Array<DataTableHeader<keyof PatientList>>;
  refetch(): void;
  openPatientList: (uuid: string) => void;
}

const PatientListTable: React.FC<PatientListTableProps> = ({
  style,
  patientLists = [],
  loading = false,
  headers = defaultHeaders,
  refetch,
  openPatientList,
}) => {
  const { t } = useTranslation();
  const userId = useSessionUser()?.user.uuid;
  const toggleStarredMutation = useToggleStarredMutation();

  const handleToggleStarred = async (patientListId: string, isStarred: boolean) => {
    if (userId) {
      await toggleStarredMutation.refetch({ userId, patientListId, isStarred });
      refetch();
    }
  };

  return !loading ? (
    <DataTable rows={patientLists} headers={headers}>
      {({
        rows,
        headers,
        getHeaderProps,
        getRowProps,
        getTableProps,
        getTableContainerProps,
      }: DataTableCustomRenderProps) => (
        <TableContainer style={{ ...style, backgroundColor: 'transparent' }} {...getTableContainerProps()}>
          <Table {...getTableProps()} isSortable useZebraStyles>
            <colgroup>
              <col span={1} style={{ width: '60%' }} />
              <col span={1} style={{ width: '20%' }} />
              <col span={1} style={{ width: '20%' }} />
            </colgroup>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader key={header.key} {...getHeaderProps({ header })} isSortable>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody style={{ backgroundColor: '#f4f4f4' }}>
              {rows.map((row, index) => (
                <TableRow style={{ height: '3rem' }} key={row.id} {...getRowProps({ row })}>
                  {row.cells.map((cell) => {
                    switch (cell.info.header) {
                      case 'display':
                        return (
                          <TableCell style={{ color: '#0f62fe' }} key={cell.id}>
                            <ConfigurableLink to={`\${openmrsSpaBase}/patient-list/${patientLists[index].id}`}>
                              {cell.value}
                            </ConfigurableLink>
                          </TableCell>
                        );

                      case 'isStarred':
                        return (
                          <TableCell
                            key={cell.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleToggleStarred(row.id, !cell.value)}>
                            {cell.value ? <StarFilled16 color="#0f62fe" /> : <Star16 color="#0f62fe" />}
                          </TableCell>
                        );

                      case 'type':
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;

                      default:
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                    }
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  ) : (
    <DataTableSkeleton
      style={{ ...style, backgroundColor: 'transparent', padding: '0rem' }}
      showToolbar={false}
      showHeader={false}
      rowCount={4}
      columnCount={4}
      zebra
    />
  );
};

export default PatientListTable;
