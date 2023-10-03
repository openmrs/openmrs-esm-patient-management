import React, { useMemo, CSSProperties, HTMLAttributes } from 'react';

import {
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Layer,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import debounce from 'lodash-es/debounce';
import { ConfigurableLink, useLayoutType, isDesktop, OpenmrsResource } from '@openmrs/esm-framework';
import PatientListOverflowMenuComponent from './overflow-menu.component';
import styles from './patient-table.scss';

// FIXME Temporarily included types from Carbon
type InputPropsBase = Omit<HTMLAttributes<HTMLInputElement>, 'onChange'>;
interface SearchProps extends InputPropsBase {
  /**
   * Specify an optional value for the `autocomplete` property on the underlying
   * `<input>`, defaults to "off"
   */
  autoComplete?: string;

  /**
   * Specify an optional className to be applied to the container node
   */
  className?: string;

  /**
   * Specify a label to be read by screen readers on the "close" button
   */
  closeButtonLabelText?: string;

  /**
   * Optionally provide the default value of the `<input>`
   */
  defaultValue?: string | number;

  /**
   * Specify whether the `<input>` should be disabled
   */
  disabled?: boolean;

  /**
   * Specify whether or not ExpandableSearch should render expanded or not
   */
  isExpanded?: boolean;

  /**
   * Specify a custom `id` for the input
   */
  id?: string;

  /**
   * Provide the label text for the Search icon
   */
  labelText: React.ReactNode;

  /**
   * Optional callback called when the search value changes.
   */
  onChange?(e: { target: HTMLInputElement; type: 'change' }): void;

  /**
   * Optional callback called when the search value is cleared.
   */
  onClear?(): void;

  /**
   * Optional callback called when the magnifier icon is clicked in ExpandableSearch.
   */
  onExpand?(e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>): void;

  /**
   * Provide an optional placeholder text for the Search.
   * Note: if the label and placeholder differ,
   * VoiceOver on Mac will read both
   */
  placeholder?: string;

  /**
   * Rendered icon for the Search.
   * Can be a React component class
   */
  renderIcon?: React.ComponentType | React.FunctionComponent;

  /**
   * Specify the role for the underlying `<input>`, defaults to `searchbox`
   */
  role?: string;

  /**
   * Specify the size of the Search
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Optional prop to specify the type of the `<input>`
   */
  type?: string;

  /**
   * Specify the value of the `<input>`
   */
  value?: string | number;
}

interface PatientTableProps {
  patients: Array<OpenmrsResource>;
  columns: Array<PatientTableColumn>;
  style?: CSSProperties;
  autoFocus?: boolean;
  isLoading: boolean;
  isFetching?: boolean;
  cohortName: string;
  mutatePatientListMembers: () => void;
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
  cohortName,
  mutatePatientListMembers,
}) => {
  const layout = useLayoutType();
  const rows: Array<any> = useMemo(
    () =>
      patients.map((patient, index) => {
        const row = {
          id: patient.membershipUuid,
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
    return (
      <DataTableSkeleton
        data-testid="data-table-skeleton"
        className={styles.dataTableSkeleton}
        rowCount={5}
        columnCount={5}
        zebra
      />
    );
  }

  return (
    <div className={styles.tableOverride}>
      <div className={styles.searchContainer}>
        <div>{isFetching && <InlineLoading />}</div>
        <div>
          <Layer>
            <Search
              id="patient-list-search"
              placeholder={search.placeHolder}
              labelText=""
              size={isDesktop(layout) ? 'sm' : 'lg'}
              className={styles.searchOverrides}
              onChange={(evnt) => handleSearch(evnt.target.value)}
              defaultValue={search.currentSearchTerm}
              {...otherSearchProps}
            />
          </Layer>
        </div>
      </div>
      <DataTable
        rows={rows}
        headers={columns}
        isSortable={true}
        size={isDesktop(layout) ? 'sm' : 'lg'}
        useZebraStyles={true}>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
          <TableContainer>
            <Table {...getTableProps()} data-testid="patientsTable">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}
                      className={isDesktop(layout) ? styles.desktopHeader : styles.tabletHeader}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    {...getRowProps({ row })}
                    className={isDesktop(layout) ? styles.desktopRow : styles.tabletRow}
                    key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                    ))}
                    <TableCell className="cds--table-column-menu">
                      <PatientListOverflowMenuComponent
                        cohortMembershipUuid={row.id}
                        cohortName={cohortName}
                        mutatePatientListMembers={mutatePatientListMembers}
                      />
                    </TableCell>
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
          backwardText="Next Page"
          forwardText="Previous Page"
        />
      )}
    </div>
  );
};

export default PatientTable;
