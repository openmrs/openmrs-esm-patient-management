import React, { HTMLAttributes, useMemo, useState, useCallback, type CSSProperties } from 'react';
import debounce from 'lodash-es/debounce';
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
import { ConfigurableLink, useLayoutType, isDesktop, showToast } from '@openmrs/esm-framework';
import { removePatientFromList } from '../api/api-remote';
import { EmptyDataIllustration } from '../patient-list-list/empty-state/empty-data-illustration.component';
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
  patients;
  columns: Array<PatientTableColumn>;
  style?: CSSProperties;
  autoFocus?: boolean;
  isLoading: boolean;
  isFetching?: boolean;
  mutateListDetails: () => void;
  mutateListMembers: () => void;
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
  mutateListMembers,
  mutateListDetails,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const patientListsPath = window.getOpenmrsSpaBase() + 'home/patient-lists';

  const [patientName, setPatientName] = useState('');
  const [membershipUuid, setMembershipUuid] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const rows: Array<typeof DataTableRow> = useMemo(
    () =>
      patients.map((patient) => ({
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
      })),
    [columns, patients],
  );

  const handleSearch = useMemo(() => debounce((searchTerm) => search.onSearch(searchTerm), 300), [search]);

  const handleRemovePatientFromList = useCallback(async () => {
    setIsDeleting(true);

    try {
      await removePatientFromList(membershipUuid);
      mutateListMembers();
      mutateListDetails();

      showToast({
        critical: true,
        kind: 'success',
        description: t('listUpToDate', 'The list is now up to date'),
        title: t('patientRemovedFromList', 'Patient removed from list'),
      });
    } catch (error) {
      showToast({
        critical: true,
        kind: 'error',
        description: error?.message,
        title: t('errorRemovingPatientFromList', 'Failed to remove patient from list'),
      });
    }

    setIsDeleting(false);
    setShowConfirmationModal(false);
  }, [membershipUuid, mutateListDetails, mutateListMembers, t]);

  const otherSearchProps = useMemo(() => search.otherSearchProps || {}, [search]);

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
                  id="patient-list-search"
                  placeholder={search.placeHolder}
                  labelText=""
                  size={isDesktop(layout) ? 'sm' : 'lg'}
                  className={styles.searchOverrides}
                  onChange={(event) => handleSearch(event.target.value)}
                  defaultValue={search.currentSearchTerm}
                  {...otherSearchProps}
                />
              </Layer>
            </div>
          </div>
          <DataTable rows={rows} headers={columns} isSortable size={isDesktop(layout) ? 'sm' : 'lg'} useZebraStyles>
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
                              size={isDesktop(layout) ? 'sm' : 'lg'}
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

export default PatientTable;
