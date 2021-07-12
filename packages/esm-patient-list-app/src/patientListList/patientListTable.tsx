import React, { CSSProperties } from 'react';
import DataTable from 'carbon-components-react/lib/components/DataTable';
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
import { usePatientListData } from '../patientListData';
import { PATIENT_LIST_TYPE } from '../patientListData/types';
import { useTranslation } from 'react-i18next';

const defaultHeaders = [
  { key: 'name', header: 'List Name' },
  { key: 'type', header: 'List Type' },
  { key: 'memberCount', header: 'No. Patients' },
  { key: 'isStarred', header: '' },
];

const PatientListTable: React.FC<{
  patientData: ReturnType<typeof usePatientListData>['data'];
  setListStarred: (listUuid: string, star: boolean) => void;
  headers?: Array<{ key: string; header: string }>;
  style?: CSSProperties;
  loading?: boolean;
  openPatientList: (uuid: string) => void;
}> = ({ patientData, setListStarred, headers = defaultHeaders, style, loading = false, openPatientList }) => {
  const { t } = useTranslation();
  return !loading ? (
    <DataTable rows={patientData} headers={headers}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
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
              {rows.map((row, i) => (
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
                          <TableCell key={cell.id} onClick={() => setListStarred(row.id, !cell.value)}>
                            {cell.value ? <StarFilled16 color="#0f62fe" /> : <Star16 color="#0f62fe" />}
                          </TableCell>
                        );

                      case 'type':
                        const val: PATIENT_LIST_TYPE = cell.value;
                        return (
                          <TableCell key={cell.id}>
                            {val === PATIENT_LIST_TYPE.SYSTEM
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
