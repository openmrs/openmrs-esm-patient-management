import React, { useMemo, CSSProperties } from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import {
  DataTable,
  DataTableSkeleton,
  Pagination,
  Search,
  SearchProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react';
import debounce from 'lodash-es/debounce';
import styles from './patient-table.scss';

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
    otherSearchProps?: SearchProps;
  };
  pagination: {
    usePagination: boolean;
    currentPage: number;
    onChange(props: any): any;
    pageSize: number;
    totalItems: number;
    pagesUnknown?: boolean;
    lastPage?: boolean;
  };
}

interface PatientTableColumn {
  key: string;
  header: string;
  getValue?(patient: any): any;
  link?: {
    getUrl(patient: any): string;
  };
}

const PatientTable: React.FC<PatientTableProps> = ({ patients, columns, search, pagination, isLoading, autoFocus }) => {
  const rows: Array<any> = useMemo(
    () =>
      patients.map((patient, index) => {
        const row = {
          id: index,
        };
        columns.forEach((column) => {
          const value = column.getValue?.(patient) || patient[column.key];
          row[column.key] = column.link ? (
            <ConfigurableLink className={styles.link} to={column.link.getUrl(patient)}>
              {value}
            </ConfigurableLink>
          ) : (
            value
          );
        });
        return row;
      }),
    [patients, columns],
  );

  const handleSearch = useMemo(() => debounce((searchTerm) => search.onSearch(searchTerm), 300), []);
  const otherSearchProps = useMemo(() => search.otherSearchProps || {}, [search]);

  if (isLoading) {
    return <DataTableSkeleton className={styles.dataTableSkeleton} rowCount={5} columnCount={5} zebra />;
  }

  return (
    <div className={styles.tableOverride}>
      <div id="table-tool-bar" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Search
          id="patient-list-search"
          labelText=""
          placeholder={search.placeHolder}
          onChange={(evnt) => handleSearch(evnt.target.value)}
          className={styles.searchOverrides}
          defaultValue={search.currentSearchTerm}
          light
          size="sm"
          {...otherSearchProps}
        />
      </div>
      <DataTable rows={rows} headers={columns} isSortable={true} size="short" useZebraStyles={true}>
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
          className={styles.paginationOverride}
          pagesUnknown={pagination?.pagesUnknown}
          isLastPage={pagination.lastPage}
        />
      )}
    </div>
  );
};

export default PatientTable;
