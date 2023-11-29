import React, { type CSSProperties, HTMLAttributes, useCallback, useId, useMemo, useState } from 'react';
import fuzzy from 'fuzzy';
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
  Tile,
} from '@carbon/react';
import { ArrowLeft, TrashCan } from '@carbon/react/icons';
import { ConfigurableLink, useLayoutType, isDesktop, showSnackbar, useDebounce } from '@openmrs/esm-framework';
import { removePatientFromList } from '../api/api-remote';
import { EmptyDataIllustration } from '../empty-state/empty-data-illustration.component';
import styles from './list-details-table.scss';

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

interface ListDetailsTableProps {
  autoFocus?: boolean;
  columns: Array<PatientTableColumn>;
  isFetching?: boolean;
  isLoading: boolean;
  mutateListDetails: () => void;
  mutateListMembers: () => void;
  pagination: {
    usePagination: boolean;
    currentPage: number;
    onChange(props: any): any;
    pageSize: number;
    totalItems: number;
    pagesUnknown?: boolean;
    lastPage?: boolean;
  };
  patients;
  style?: CSSProperties;
}

interface PatientTableColumn {
  key: string;
  header: string;
  getValue?(patient: any): any;
  link?: {
    getUrl(patient: any): string;
  };
}

const ListDetailsTable: React.FC<ListDetailsTableProps> = ({
  columns,
  isFetching,
  isLoading,
  mutateListDetails,
  mutateListMembers,
  pagination,
  patients,
}) => {
  const { t } = useTranslation();
  const id = useId();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const patientListsPath = window.getOpenmrsSpaBase() + 'home/patient-lists';

  const [isDeleting, setIsDeleting] = useState(false);
  const [membershipUuid, setMembershipUuid] = useState('');
  const [patientName, setPatientName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm);

  const filteredPatients = useMemo(() => {
    if (!debouncedSearchTerm) {
      return patients;
    }

    return debouncedSearchTerm
      ? fuzzy
          .filter(debouncedSearchTerm, patients, {
            extract: (patient: any) => `${patient.name} ${patient.identifier} ${patient.sex}`,
          })
          .sort((r1, r2) => r1.score - r2.score)
          .map((result) => result.original)
      : patients;
  }, [debouncedSearchTerm, patients]);

  const tableRows: Array<typeof DataTableRow> = useMemo(
    () =>
      filteredPatients?.map((patient) => ({
        id: patient.identifier,
        identifier: patient.identifier,
        membershipUuid: patient.membershipUuid,
        name: columns.find((column) => column.key === 'name')?.link ? (
          <ConfigurableLink
            className={styles.link}
            to={columns.find((column) => column.key === 'name')?.link?.getUrl(patient)}>
            {patient.name}
          </ConfigurableLink>
        ) : (
          patient.name
        ),
        sex: patient.sex,
        startDate: patient.startDate,
      })) ?? [],
    [columns, filteredPatients],
  );

  const handleRemovePatientFromList = useCallback(async () => {
    setIsDeleting(true);

    try {
      await removePatientFromList(membershipUuid);
      mutateListMembers();
      mutateListDetails();

      showSnackbar({
        isLowContrast: false,
        kind: 'success',
        subtitle: t('listUpToDate', 'The list is now up to date'),
        title: t('patientRemovedFromList', 'Patient removed from list'),
      });
    } catch (error) {
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        subtitle: error?.message,
        title: t('errorRemovingPatientFromList', 'Failed to remove patient from list'),
      });
    }

    setIsDeleting(false);
    setShowConfirmationModal(false);
  }, [membershipUuid, mutateListDetails, mutateListMembers, t]);

  const BackButton = () => (
    <div className={styles.backButton}>
      <ConfigurableLink to={patientListsPath}>
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowLeft size={24} {...props} />}
          iconDescription="Return to lists page"
          size="sm"
          onClick={() => {}}>
          <span>{t('backToListsPage', 'Back to lists page')}</span>
        </Button>
      </ConfigurableLink>
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        <DataTableSkeleton
          data-testid="data-table-skeleton"
          className={styles.dataTableSkeleton}
          rowCount={5}
          columnCount={5}
          zebra
        />
      </div>
    );
  }

  if (patients.length > 0) {
    return (
      <>
        <BackButton />
        <div className={styles.tableOverride}>
          <div className={styles.searchContainer}>
            <div>{isFetching && <InlineLoading />}</div>
            <div>
              <Layer>
                <Search
                  className={styles.searchOverrides}
                  id={`${id}-search`}
                  labelText=""
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  placeholder={t('searchThisList', 'Search this list')}
                  size={responsiveSize}
                />
              </Layer>
            </div>
          </div>
          <DataTable rows={tableRows} headers={columns} isSortable size={responsiveSize} useZebraStyles>
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
                    {rows.map((row) => {
                      const currentPatient = patients.find((patient) => patient.identifier === row.id);

                      return (
                        <TableRow
                          {...getRowProps({ row })}
                          className={isDesktop(layout) ? styles.desktopRow : styles.tabletRow}
                          key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                          <TableCell className="cds--table-column-menu">
                            <Button
                              className={styles.removeButton}
                              kind="ghost"
                              hasIconOnly
                              renderIcon={TrashCan}
                              iconDescription={t('removeFromList', 'Remove from list')}
                              size={responsiveSize}
                              tooltipPosition="left"
                              onClick={() => {
                                setMembershipUuid(currentPatient.membershipUuid);
                                setPatientName(currentPatient.name);
                                setShowConfirmationModal(true);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
          {filteredPatients?.length === 0 && (
            <div className={styles.filterEmptyState}>
              <Layer level={0}>
                <Tile className={styles.filterEmptyStateTile}>
                  <p className={styles.filterEmptyStateContent}>
                    {t('noMatchingPatients', 'No matching patients to display')}
                  </p>
                  <p className={styles.filterEmptyStateHelper}>{t('checkFilters', 'Check the filters above')}</p>
                </Tile>
              </Layer>
            </div>
          )}
          {pagination.usePagination && (
            <Pagination
              backwardText={t('nextPage', 'Next page')}
              className={styles.paginationOverride}
              forwardText={t('previousPage', 'Previous page')}
              isLastPage={pagination.lastPage}
              onChange={pagination.onChange}
              page={pagination.currentPage}
              pageSize={pagination.pageSize}
              pageSizes={[10, 20, 30, 40, 50]}
              pagesUnknown={pagination?.pagesUnknown}
              totalItems={pagination.totalItems}
            />
          )}
        </div>
        {showConfirmationModal && (
          <Modal
            open
            danger
            modalHeading={t(
              'removePatientFromListConfirmation',
              'Are you sure you want to remove {{patientName}} from this list?',
              {
                patientName: patientName,
              },
            )}
            primaryButtonText={t('removeFromList', 'Remove from list')}
            secondaryButtonText={t('cancel', 'Cancel')}
            onRequestClose={() => setShowConfirmationModal(false)}
            onRequestSubmit={handleRemovePatientFromList}
            primaryButtonDisabled={isDeleting}
          />
        )}
      </>
    );
  }

  return (
    <>
      <BackButton />
      <Layer>
        <Tile className={styles.tile}>
          <div className={styles.illo}>
            <EmptyDataIllustration />
          </div>
          <p className={styles.content}>{t('noPatientsInList', 'There are no patients in this list')}</p>
        </Tile>
      </Layer>
    </>
  );
};

export default ListDetailsTable;
