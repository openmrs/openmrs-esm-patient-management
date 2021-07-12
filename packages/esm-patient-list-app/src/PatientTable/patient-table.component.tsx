import DataTable, {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react/lib/components/DataTable';
import Pagination from 'carbon-components-react/lib/components/Pagination';
import Search from 'carbon-components-react/lib/components/Search';
import { debounce } from 'lodash';
import React, { useMemo } from 'react';
import styles from './patient-table.component.scss';

const PatientTable: React.FC<PatientTableProps> = ({ patients, columns, search, pagination }) => {
  const rows: Array<any> = useMemo(
    () =>
      patients.map((patient) => {
        const row = {};
        columns.forEach((column) => {
          row['id'] = patient['id'] || patient['uuid'];
          row[column.key] = column.getValue ? column.getValue(patient) : patient[column.key];
        });
        return row;
      }),
    [patients, columns],
  );
  const handleSearch = React.useMemo(() => debounce((searchTerm) => search.onSearch(searchTerm), 300), []);

  return (
    <div>
      <div id="table-tool-bar" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Search
          id="patient-list-search"
          labelText=""
          placeholder={search.placeHolder}
          onChange={(evnt) => handleSearch(evnt.target.value)}
          className={styles.searchOverrides}
        />
      </div>
      <DataTable rows={rows} headers={columns} isSortable={true} size="normal" useZebraStyles={true}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
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
          </TableContainer>
        )}
      </DataTable>
      {pagination.usePagination && (
        <Pagination
          page={pagination.currentPage}
          pageSize={pagination.pageSize}
          pageSizes={[10, 20, 30, 40, 50]}
          totalItems={pagination.totalItems}
          onChange={pagination.onChange}
        />
      )}
    </div>
  );
};

interface PatientTableProps {
  patients: Array<Object>;
  columns: Array<PatientTableColumn>;
  search: {
    onSearch: (searchTerm: string) => {};
    placeHolder: string;
  };
  pagination: {
    usePagination: boolean;
    currentPage: number;
    onChange: (props: any) => {};
    pageSize: number;
    totalItems: number;
  };
}
export interface PatientTableColumn {
  key: string;
  header: string;
  getValue?: (patient) => any;
}

export default PatientTable;
