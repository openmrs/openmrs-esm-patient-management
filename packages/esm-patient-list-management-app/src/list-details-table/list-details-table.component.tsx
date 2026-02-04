import React, { type CSSProperties, type HTMLAttributes, useCallback, useId, useMemo, useState } from 'react';
import fuzzy from 'fuzzy';
import { useTranslation } from 'react-i18next';
import {
  Button,
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
  Tile,
} from '@carbon/react';
import {
  AddIcon,
  ArrowLeftIcon,
  ConfigurableLink,
  EmptyCardIllustration,
  isDesktop,
  launchWorkspace2,
  showSnackbar,
  showModal,
  toOmrsIsoString,
  TrashCanIcon,
  useDebounce,
  useLayoutType,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { addPatientToList, removePatientFromList } from '../api/patient-list.resource';
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
  cohortUuid: string;
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
  cohortUuid,
}) => {
  const { t } = useTranslation();
  const id = useId();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const patientListsPath = window.getOpenmrsSpaBase() + 'home/patient-lists';

  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const tableRows = useMemo(
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
        mobile: patient.mobile || '--',
      })) ?? [],
    [columns, filteredPatients],
  );

  const handleRemovePatientFromList = useCallback(
    async (membershipUuidToRemove: string) => {
      setIsDeleting(true);

      try {
        await removePatientFromList(membershipUuidToRemove);
        mutateListMembers();
        mutateListDetails();

        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          subtitle: t('listUpToDate', 'The list is now up to date'),
          title: t('patientRemovedFromList', 'Patient removed from list'),
        });
      } catch (error) {
        showSnackbar({
          kind: 'error',
          subtitle: error?.message,
          title: t('errorRemovingPatientFromList', 'Failed to remove patient from list'),
        });
      }

      setIsDeleting(false);
    },
    [mutateListDetails, mutateListMembers, t],
  );

  const handleLaunchRemovePatientFromListModal = useCallback(
    async (currentPatient) => {
      const dispose = showModal('remove-patient-from-list-modal', {
        patientName: currentPatient.name,
        membershipUuid: currentPatient.membershipUuid,
        onConfirm: async (membershipUuidToRemove: string) => handleRemovePatientFromList(membershipUuidToRemove),
        close: () => dispose(),
      });
    },
    [handleRemovePatientFromList],
  );

  const handleAddPatientToList = useCallback(
    async (patient) => {
      const alreadyInList = patients.some((p) => patient == p.uuid);

      if (alreadyInList) {
        showSnackbar({
          kind: 'info',
          subtitle: t('patientAlreadyInList', 'This patient is already in the list'),
          title: t('cannotAddPatient', 'Cannot add patient'),
          isLowContrast: true,
        });
        return;
      }

      try {
        await addPatientToList({
          cohort: cohortUuid,
          patient,
          startDate: toOmrsIsoString(new Date()),
        });

        mutateListMembers();
        mutateListDetails();

        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          subtitle: t('listUpToDate', 'The list is now up to date'),
          title: t('patientAddedToList', 'Patient added to list'),
        });
      } catch (e) {
        showSnackbar({
          kind: 'error',
          subtitle: e?.message,
          title: t('errorAddingPatientToList', 'Failed to add patient to list'),
        });
      }
    },
    [cohortUuid, mutateListDetails, mutateListMembers, patients, t],
  );

  const BackButton = () => (
    <div className={styles.backButton}>
      <ConfigurableLink to={patientListsPath}>
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowLeftIcon size={24} {...props} />}
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
              <Layer>
                <Button
                  kind="secondary"
                  renderIcon={(props) => <AddIcon {...props} />}
                  size="sm"
                  onClick={() =>
                    launchWorkspace2(
                      'patient-list-search-workspace',
                      {
                        initialQuery: '',
                        workspaceTitle: t('addPatientToList', 'Add patient to list'),
                        async onPatientSelected(
                          patientUuid: string,
                          patient: fhir.Patient,
                          launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
                          closeWorkspace: Workspace2DefinitionProps['closeWorkspace'],
                        ) {
                          await handleAddPatientToList(patientUuid);
                        },
                      },
                      {
                        startVisitWorkspaceName: 'patient-list-start-visit-workspace',
                      },
                    )
                  }>
                  {t('addPatientToList', 'Add patient to list')}
                </Button>
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
                          })}
                          className={isDesktop(layout) ? styles.desktopHeader : styles.tabletHeader}>
                          {typeof header.header === 'object' && header.header !== null && 'content' in header.header
                            ? (header.header.content as React.ReactNode)
                            : (header.header as React.ReactNode)}
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
                              hasIconOnly
                              iconDescription={t('removeFromList', 'Remove from list')}
                              kind="ghost"
                              onClick={() => handleLaunchRemovePatientFromListModal(currentPatient)}
                              renderIcon={TrashCanIcon}
                              size={responsiveSize}
                              tooltipPosition="left"
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
      </>
    );
  }

  return (
    <>
      <BackButton />
      <Layer>
        <Tile className={styles.tile} data-openmrs-role="Patient Empty tile">
          <div className={styles.illo}>
            <EmptyCardIllustration />
          </div>
          <p className={styles.content}>{t('noPatientsInList', 'There are no patients in this list')}</p>
          <Button
            kind="ghost"
            renderIcon={(props) => <AddIcon {...props} />}
            size="sm"
            onClick={() =>
              launchWorkspace2(
                'patient-list-search-workspace',
                {
                  initialQuery: '',
                  workspaceTitle: t('addPatientToList', 'Add patient to list'),
                  async onPatientSelected(
                    patientUuid: string,
                    patient: fhir.Patient,
                    launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
                    closeWorkspace: Workspace2DefinitionProps['closeWorkspace'],
                  ) {
                    await handleAddPatientToList(patientUuid);
                  },
                },
                {
                  startVisitWorkspaceName: 'patient-list-start-visit-workspace',
                },
              )
            }>
            {t('addPatientToList', 'Add patient to list')}
          </Button>
        </Tile>
      </Layer>
    </>
  );
};

export default ListDetailsTable;
