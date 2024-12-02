import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  IconButton,
  InlineLoading,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { Add, Edit } from '@carbon/react/icons';
import { ErrorState, isDesktop as desktopLayout, useLayoutType } from '@openmrs/esm-framework';
import type { BedTypeData } from '../types';
import { useBedTypes } from '../summary/summary.resource';
import CardHeader from '../card-header/card-header.component';
import BedTypeForm from './new-bed-type-form.component';
import EditBedTypeForm from './edit-bed-type.component';
import Header from '../header/header.component';
import styles from '../bed-administration/bed-administration-table.scss';

const BedTypeAdministrationTable: React.FC = () => {
  const { t } = useTranslation();
  const headerTitle = t('bedTypes', 'Bed types');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const isDesktop = desktopLayout(layout);
  const { bedTypes, errorLoadingBedTypes, isLoadingBedTypes, isValidatingBedTypes, mutateBedTypes } = useBedTypes();

  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setPageSize] = useState(10);
  const [editData, setEditData] = useState<BedTypeData>();
  const [pageSize] = useState(10);
  const [showBedTypeModal, setAddBedTypeModal] = useState(false);
  const [showEditBedModal, setShowEditBedModal] = useState(false);

  const tableHeaders = [
    {
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      header: t('displayName', 'Display name'),
      key: 'displayName',
    },
    {
      header: t('description', 'Description'),
      key: 'description',
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];

  const tableRows = useMemo(
    () =>
      bedTypes?.map((entry) => ({
        id: entry.uuid,
        name: entry?.name,
        displayName: entry?.displayName,
        description: entry?.description,
        actions: (
          <IconButton
            align="top-start"
            enterDelayMs={300}
            kind="ghost"
            label={t('editBedType', 'Edit bed type')}
            onClick={(e) => {
              e.preventDefault();
              setEditData(entry);
              setShowEditBedModal(true);
              setAddBedTypeModal(false);
            }}
            size={responsiveSize}>
            <Edit />
          </IconButton>
        ),
      })),
    [responsiveSize, bedTypes, t],
  );

  if (isLoadingBedTypes) {
    return (
      <>
        <Header title={t('bedTypes', 'Bed types')} />
        <div className={styles.widgetCard}>
          <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />
        </div>
      </>
    );
  }

  if (errorLoadingBedTypes) {
    return (
      <>
        <Header title={t('bedTypes', 'Bed types')} />
        <div className={styles.widgetCard}>
          <ErrorState error={errorLoadingBedTypes} headerTitle={headerTitle} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t('bedTypes', 'Bed types')} />

      <div className={styles.widgetCard}>
        {showBedTypeModal ? (
          <BedTypeForm onModalChange={setAddBedTypeModal} showModal={showBedTypeModal} mutate={mutateBedTypes} />
        ) : null}
        {showEditBedModal ? (
          <EditBedTypeForm
            editData={editData}
            mutate={mutateBedTypes}
            onModalChange={setShowEditBedModal}
            showModal={showEditBedModal}
          />
        ) : null}
        <CardHeader title={headerTitle}>
          <span className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidatingBedTypes ? <InlineLoading /> : null}</span>
          </span>
          {bedTypes?.length ? (
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              onClick={() => setAddBedTypeModal(true)}>
              {t('addBedType', 'Add bed type')}
            </Button>
          ) : null}
        </CardHeader>
        <DataTable rows={tableRows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({ rows, headers, getTableProps }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key}>{header.header?.content ?? header.header}</TableHeader>
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
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noDataToDisplay', 'No data to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                    <p className={styles.separator}>{t('or', 'or')}</p>
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={(props) => <Add size={16} {...props} />}
                      onClick={() => setAddBedTypeModal(true)}>
                      {t('addBedType', 'Add bed type')}
                    </Button>
                  </Tile>
                </div>
              ) : null}
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                pageSizes={[10, 20, 30, 40, 50]}
                totalItems={bedTypes.length}
                onChange={({ page, pageSize }) => {
                  setCurrentPage(page);
                  setPageSize(pageSize);
                }}
              />
            </TableContainer>
          )}
        </DataTable>
      </div>
    </>
  );
};
export default BedTypeAdministrationTable;
