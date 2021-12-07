import React, { useMemo, CSSProperties } from 'react';
import { ConfigurableLink, useLayoutType } from '@openmrs/esm-framework';
import {
  DataTable,
  DataTableSkeleton,
  InlineLoading,
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
  isFetching?: boolean;
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

const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  columns,
  search,
  pagination,
  isLoading,
  autoFocus,
  isFetching,
}) => {
  const isDesktop = useLayoutType() === 'desktop';
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
      <div id="table-tool-bar" className={styles.searchContainer}>
        <div>{isFetching && <InlineLoading />}</div>
        <div>
          <Search
            id="patient-list-search"
            placeholder={search.placeHolder}
            labelText=""
            size={isDesktop ? 'sm' : 'xl'}
            className={styles.searchOverrides}
            light
            onChange={(evnt) => handleSearch(evnt.target.value)}
            defaultValue={search.currentSearchTerm}
            {...otherSearchProps}
          />
        </div>
      </div>
      <DataTable rows={rows} headers={columns} isSortable={true} useZebraStyles={true}>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}
                      className={isDesktop ? styles.desktopHeader : styles.tabletHeader}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    {...getRowProps({ row })}
                    className={isDesktop ? styles.desktopRow : styles.tabletRow}
                    key={row.id}>
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
          backwardText=""
          forwardText=""
        />
      )}
    </div>
  );
};

export default PatientTable;
