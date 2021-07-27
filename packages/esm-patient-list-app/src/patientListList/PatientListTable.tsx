import React, { CSSProperties } from 'react';
import DataTable, {
  DataTableCustomRenderProps,
  DataTableHeader,
} from 'carbon-components-react/lib/components/DataTable';
import Table from 'carbon-components-react/lib/components/DataTable/Table';
import TableContainer from 'carbon-components-react/lib/components/DataTable/TableContainer';
import TableHead from 'carbon-components-react/lib/components/DataTable/TableHead';
import TableHeader from 'carbon-components-react/lib/components/DataTable/TableHeader';
import TableRow from 'carbon-components-react/lib/components/DataTable/TableRow';
import TableCell from 'carbon-components-react/lib/components/DataTable/TableCell';
import TableBody from 'carbon-components-react/lib/components/DataTable/TableBody';
import DataTableSkeleton from 'carbon-components-react/lib/components/DataTableSkeleton';
import Star16 from '@carbon/icons-react/es/star/16';
import StarFilled16 from '@carbon/icons-react/es/star--filled/16';
import { PatientList, PatientListType } from '../patientListData/types';
import { useTranslation } from 'react-i18next';

const defaultHeaders: Array<DataTableHeader<keyof PatientList>> = [
  { key: 'display', header: 'List Name' },
  { key: 'type', header: 'List Type' },
  { key: 'memberCount', header: 'No. Patients' },
  { key: 'isStarred', header: '' },
];

interface PatientListTableProps {
  patientLists: Array<PatientList>;
  loading?: boolean;
  headers?: Array<DataTableHeader<keyof PatientList>>;
  style?: CSSProperties;
  setListStarred: (listUuid: string, star: boolean) => void;
  openPatientList: (uuid: string) => void;
}

const PatientListTable: React.FC<PatientListTableProps> = ({
  patientLists,
  setListStarred,
  headers = defaultHeaders,
  style,
  loading = false,
  openPatientList,
}) => {
  const { t } = useTranslation();

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
              {rows.map((row) => (
                <TableRow style={{ height: '3rem' }} key={row.id} {...getRowProps({ row })}>
                  {row.cells.map((cell) => {
                    switch (cell.info.header) {
                      case 'display':
                        return (
                          <TableCell style={{ color: '#0f62fe' }} key={cell.id} onClick={() => openPatientList(row.id)}>
                            {cell.value}
                          </TableCell>
                        );

                      case 'isStarred':
                        return (
                          <TableCell
                            key={cell.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setListStarred(row.id, !cell.value)}>
                            {cell.value ? <StarFilled16 color="#0f62fe" /> : <Star16 color="#0f62fe" />}
                          </TableCell>
                        );

                      case 'type':
                        const val: PatientListType = cell.value;
                        return (
                          <TableCell key={cell.id}>
                            {val === PatientListType.SYSTEM
                              ? t('patientListTableTypeSystem', 'system')
                              : t('patientListTableTypeUser', 'user')}
                          </TableCell>
                        );

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
      style={{ ...style, backgroundColor: 'transparent', padding: '0rem', margin: '1rem' }}
      showToolbar={false}
      showHeader={false}
      rowCount={4}
      columnCount={4}
      zebra
    />
  );
};

export default PatientListTable;
