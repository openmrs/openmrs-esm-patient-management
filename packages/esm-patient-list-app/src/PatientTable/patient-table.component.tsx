import { navigate } from '@openmrs/esm-framework';
import { Link } from 'carbon-components-react';
import DataTable, {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react/lib/components/DataTable';
import DataTableSkeleton from 'carbon-components-react/lib/components/DataTableSkeleton';
import Pagination from 'carbon-components-react/lib/components/Pagination';
import Search from 'carbon-components-react/lib/components/Search';
import { debounce } from 'lodash';
import React, { useMemo, CSSProperties } from 'react';
import styles from './patient-table.component.scss';

const PatientTable: React.FC<PatientTableProps> = ({ patients, columns, search, pagination, isLoading, autoFocus }) => {
  const rows: Array<any> = useMemo(
    () =>
      patients.map((patient, index) => {
        const row = {
          id: index,
        };
        columns.forEach((column) => {
          const value = column.getValue ? column.getValue(patient) : patient[column.key];
          row[column.key] = column.link ? (
            <Link
              onClick={(e) => {
                e.preventDefault();
                navigate({ to: column.link.getUrl(patient) });
              }}>
              {value}
            </Link>
          ) : (
            value
          );
        });
        return row;
      }),
    [patients, columns],
  );
  const handleSearch = React.useMemo(() => debounce((searchTerm) => search.onSearch(searchTerm), 300), []);

  if (isLoading) {
    return (
      <DataTableSkeleton
        style={{ backgroundColor: 'transparent', padding: '0rem', margin: '1rem' }}
        rowCount={5}
        columnCount={5}
        zebra
      />
    );
  }
  return (
    <>
      <div id="table-tool-bar" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Search
          id="patient-list-search"
          labelText=""
          placeholder={search.placeHolder}
          onChange={(evnt) => handleSearch(evnt.target.value)}
          className={styles.searchOverrides}
          value={search.currentSearchTerm}
          autoFocus={autoFocus}
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
    </>
  );
};

interface PatientTableProps {
  patients: Array<Object>;
  columns: Array<PatientTableColumn>;
  style?: CSSProperties;
  autoFocus?: boolean;
  isLoading: boolean;
  search: {
    onSearch(searchTerm: string): any;
    placeHolder: string;
    currentSearchTerm?: string;
  };
  pagination: {
    usePagination: boolean;
    currentPage: number;
    onChange(props: any): any;
    pageSize: number;
    totalItems: number;
  };
}
export interface PatientTableColumn {
  key: string;
  header: string;
  getValue?(patient: any): any;
  link?: {
    getUrl(patient: any): string;
  };
}

export default PatientTable;
