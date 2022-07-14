import React, { useMemo } from 'react';
import {
  Button,
  DataTable,
  DataTableCustomRenderProps,
  DataTableSkeleton,
  DenormalizedRow,
  FilterRowsData,
  Search,
  SearchSkeleton,
  SkeletonText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
} from '@carbon/react';
import {
  useStore,
  getOfflinePatientDataStore,
  useSession,
  age,
  useLayoutType,
  isDesktop,
  syncOfflinePatientData,
  showModal,
  getSynchronizationItems,
  deleteSynchronizationItem,
  getFullSynchronizationItems,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash-es/capitalize';
import LastUpdatedTableCell from './last-updated-table-cell.component';
import styles from './offline-patient-table.scss';
import PatientNameTableCell from './patient-name-table-cell.component';
import { Renew } from '@carbon/react/icons';
import { removePatientFromLocalPatientList, offlinePatientListId } from '../api/api-local';
import { useAllPatientsFromOfflinePatientList } from '../api/hooks';
import useSWR from 'swr';

export interface OfflinePatientTableProps {
  isInteractive: boolean;
  showHeader: boolean;
}

const OfflinePatientTable: React.FC<OfflinePatientTableProps> = ({ isInteractive, showHeader }) => {
  const { t } = useTranslation();
  const store = useStore(getOfflinePatientDataStore());
  const userId = useSession()?.user?.uuid;
  const layout = useLayoutType();
  const offlinePatientsSwr = useAllPatientsFromOfflinePatientList(userId);
  const offlineRegisteredPatientsSwr = useOfflineRegisteredPatients();
  const toolbarItemSize = isDesktop(layout) ? 'sm' : undefined;

  const headers = useMemo(
    () => [
      {
        key: 'name',
        header: t('offlinePatientsTableHeaderName', 'Name'),
      },
      {
        key: 'lastUpdated',
        header: t('offlinePatientsTableHeaderLastUpdated', 'Last updated'),
      },
      {
        key: 'gender',
        header: t('offlinePatientsTableHeaderGender', 'Gender'),
      },
      {
        key: 'age',
        header: t('offlinePatientsTableHeaderAge', 'Age'),
      },
    ],
    [t],
  );

  const rows = useMemo(() => {
    const result = [];
    const mapPatientToRow = (patient: fhir.Patient, isNewlyRegistered: boolean) => ({
      id: patient.id,
      name: {
        value: <PatientNameTableCell key={patient.id} patient={patient} isNewlyRegistered={isNewlyRegistered} />,
        filterableValue: JSON.stringify(patient.name),
      },
      lastUpdated: isNewlyRegistered ? (
        '--'
      ) : (
        <LastUpdatedTableCell
          key={patient.id}
          syncState={store.offlinePatientDataSyncState?.[patient.id]}
          patientUuid={patient.id}
        />
      ),
      gender: capitalize(patient.gender),
      age: patient.birthDate ? age(patient.birthDate) : '',
    });

    for (const patient of offlineRegisteredPatientsSwr.data ?? []) {
      result.push(mapPatientToRow(patient, true));
    }

    for (const patient of offlinePatientsSwr.data ?? []) {
      result.push(mapPatientToRow(patient, false));
    }

    return result;
  }, [offlinePatientsSwr.data, offlineRegisteredPatientsSwr.data, store.offlinePatientDataSyncState]);

  const handleUpdateSelectedPatientsClick = async (selectedRows: ReadonlyArray<DenormalizedRow>) => {
    const offlinePatientUuidsToSync = selectedRows
      .map((row) => row.id)
      .filter((id) => offlinePatientsSwr.data.some((offlinePatient) => offlinePatient.id === id));
    return await Promise.all(offlinePatientUuidsToSync.map((patientUuid) => syncOfflinePatientData(patientUuid)));
  };

  const handleRemovePatientsFromOfflineListClick = async (selectedRows: ReadonlyArray<DenormalizedRow>) => {
    const closeModal = showModal('offline-tools-confirmation-modal', {
      title: t('offlinePatientsTableDeleteConfirmationModalTitle', 'Remove offline patients'),
      children: t(
        'offlinePatientsTableDeleteConfirmationModalContent',
        'Are you sure that you want to remove all selected patients from the offline list? Their charts will no longer be available in offline mode and any newly registered patient will be permanently deleted.',
      ),
      confirmText: t('offlinePatientsTableDeleteConfirmationModalConfirm', 'Remove patients'),
      cancelText: t('offlinePatientsTableDeleteConfirmationModalCancel', 'Cancel'),
      closeModal: () => closeModal(),
      onConfirm: async () => {
        const offlineRegisteredPatients = await getFullSynchronizationItems<{ fhirPatient: fhir.Patient }>(
          'patient-registration',
        );
        const allPatientUuidsToBeDeleted = selectedRows.map((row) => row.id);
        const offlinePatientUuidsToBeDeleted = allPatientUuidsToBeDeleted.filter((id) =>
          offlinePatientsSwr.data.some((patient) => patient.id === id),
        );
        const offlineRegisteredPatientUuidsToBeDeleted = allPatientUuidsToBeDeleted.filter((id) =>
          offlineRegisteredPatientsSwr.data.some((patient) => patient.id === id),
        );

        await Promise.all(
          offlinePatientUuidsToBeDeleted.map((patientUuid) =>
            removePatientFromLocalPatientList(userId, offlinePatientListId, patientUuid),
          ),
        );

        await Promise.all(
          offlineRegisteredPatientUuidsToBeDeleted.map(async (patientUuid) => {
            const offlineRegisteredPatient = offlineRegisteredPatients.find(
              (syncItem) => syncItem.content.fhirPatient.id === patientUuid,
            );

            if (offlineRegisteredPatient) {
              await deleteSynchronizationItem(offlineRegisteredPatient.id);
            }
          }),
        );

        offlinePatientsSwr.mutate();
        offlineRegisteredPatientsSwr.mutate();
      },
    });
  };

  if (offlinePatientsSwr.isValidating || offlineRegisteredPatientsSwr.isValidating) {
    return <TableSkeleton showHeader={showHeader} />;
  }

  return (
    <>
      <DataTable rows={rows} headers={headers} filterRows={filterTableRows}>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          getTableContainerProps,
          getSelectionProps,
          onInputChange,
          selectedRows,
        }: DataTableCustomRenderProps) => (
          <TableContainer className={styles.tableContainer} {...getTableContainerProps()}>
            <div className={styles.tableHeaderContainer}>
              {showHeader && (
                <h4 className={styles.tableHeader}>{t('offlinePatientsTableTitle', 'Offline patients')}</h4>
              )}
              {selectedRows.length === 0 && (
                <Search
                  className={styles.tableSearch}
                  labelText={t('offlinePatientsTableSearchLabel', 'Search this list')}
                  placeholder={t('offlinePatientsTableSearchPlaceholder', 'Search this list')}
                  size={toolbarItemSize}
                  onChange={onInputChange}
                  light
                />
              )}
              {selectedRows.length > 0 && (
                <>
                  <Button
                    className={styles.tableSecondaryAction}
                    kind="ghost"
                    size={toolbarItemSize}
                    renderIcon={(props) => <Renew {...props} />}
                    onClick={() => handleUpdateSelectedPatientsClick(selectedRows)}>
                    {selectedRows.length === 1
                      ? t('offlinePatientsTableUpdatePatient', 'Update patient')
                      : t('offlinePatientsTableUpdatePatients', 'Update patients')}
                  </Button>
                  <Button
                    className={styles.tablePrimaryAction}
                    kind="danger"
                    size={toolbarItemSize}
                    onClick={() => handleRemovePatientsFromOfflineListClick(selectedRows)}>
                    {t('offlinePatientsTableRemoveFromOfflineList', 'Remove from list')}
                  </Button>
                </>
              )}
            </div>
            <Table {...getTableProps()} useZebraStyles>
              <TableHead>
                <TableRow>
                  {isInteractive && <TableSelectAll {...getSelectionProps()} />}
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} isSortable>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })}>
                    {isInteractive && <TableSelectRow {...getSelectionProps({ row })} />}
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value?.value ?? cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </>
  );
};

const TableSkeleton: React.FC<{ showHeader: boolean }> = ({ showHeader }) => {
  return (
    <TableContainer className={styles.tableContainer}>
      <div className={styles.tableHeaderContainer}>
        {showHeader && <SkeletonText heading width="20%" className={styles.tableHeader} />}
        <SearchSkeleton className={styles.tableSearch} />
      </div>
      <DataTableSkeleton showToolbar={false} showHeader={false} />
    </TableContainer>
  );
};

function filterTableRows({
  rowIds,
  headers,
  cellsById,
  inputValue,
  // @ts-ignore `getCellId` is not in the types, but present in Carbon.
  getCellId,
}: FilterRowsData) {
  return rowIds.filter((rowId) =>
    headers.some(({ key }) => {
      const cellId = getCellId(rowId, key);
      const value = cellsById[cellId].value;
      const filterableValue = value?.filterableValue?.toString() ?? value?.toString() ?? '';
      return filterableValue.replace(/\s/g, '').toLowerCase().includes(inputValue.replace(/\s/g, '').toLowerCase());
    }),
  );
}

function useOfflineRegisteredPatients() {
  return useSWR('offlineRegisteredPatients', async () => {
    const syncItems = await getSynchronizationItems<{ fhirPatient?: fhir.Patient }>('patient-registration');
    return syncItems.filter((item) => item.fhirPatient).map((item) => item.fhirPatient);
  });
}

export default OfflinePatientTable;
