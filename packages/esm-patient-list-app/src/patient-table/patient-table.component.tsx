import React, { HTMLAttributes, useMemo, useState, useCallback, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableRow,
  DataTableSkeleton,
  InlineLoading,
  Layer,
  Modal,
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
import { TrashCan } from '@carbon/react/icons';
import debounce from 'lodash-es/debounce';
import { ConfigurableLink, useLayoutType, isDesktop, OpenmrsResource, showToast } from '@openmrs/esm-framework';
import { removePatientFromList } from '../api/api-remote';
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
  isFetching,
  cohortName,
  mutatePatientListMembers,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  const [membershipUuid, setMembershipUuid] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const rows: Array<typeof DataTableRow> = useMemo(
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

  const confirmRemovePatientFromList = useCallback(async () => {
    setIsDeleting(true);
    try {
      await removePatientFromList(membershipUuid);
      mutatePatientListMembers();
      showToast({
        title: t('removed', 'Removed'),
        description: `${t('successRemovePatientFromList', 'Successfully removed patient from list')}: ${cohortName}`,
      });
    } catch (error) {
      showToast({
        title: t('error', 'Error'),
        kind: 'error',
        description: `${t('errorRemovePatientFromList', 'Failed to remove patient from list')}: ${cohortName}`,
      });
    }

    setIsDeleting(false);
    setShowConfirmationModal(false);
  }, [membershipUuid, cohortName, mutatePatientListMembers, t]);

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
    <>
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
          isSortable
          size={isDesktop(layout) ? 'sm' : 'lg'}
          overflowMenuOnHover={isDesktop}
          useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
            <TableContainer>
              <Table className={styles.table} {...getTableProps()} data-testid="patientsTable">
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
                        <Button
                          size={isDesktop(layout) ? 'sm' : 'lg'}
                          kind="danger--ghost"
                          hasIconOnly
                          renderIcon={TrashCan}
                          iconDescription={t('removeFromList', 'Remove from list')}
                          onClick={() => {
                            setMembershipUuid(row.id);
                            setShowConfirmationModal(true);
                          }}
                          tooltipPosition="left"
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
      {showConfirmationModal && (
        <Modal
          open
          danger
          modalHeading={t('confirmRemovePatient', 'Are you sure you want to remove this patient from {cohortName}?', {
            cohortName: cohortName,
          })}
          modalLabel={t('removePatientFromList', 'Remove patient from list')}
          primaryButtonText="Remove patient"
          secondaryButtonText="Cancel"
          onRequestClose={() => setShowConfirmationModal(false)}
          onRequestSubmit={confirmRemovePatientFromList}
          primaryButtonDisabled={isDeleting}
        />
      )}
    </>
  );
};

export default PatientTable;
