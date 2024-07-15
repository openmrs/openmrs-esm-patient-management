import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
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
import { useBedType } from '../summary/summary.resource';
import Header from '../header/header.component';
import BedTypeForm from './new-bed-type-form.component';
import styles from '../bed-administration/bed-administration-table.scss';
import { CardHeader } from '../card-header/card-header.component';
import EditBedTypeForm from './edit-bed-type.component';

const BedTypeAdministrationTable: React.FC = () => {
  const { t } = useTranslation();
  const headerTitle = t('bedType', 'Bed Type');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const isDesktop = desktopLayout(layout);
  const [showEditBedModal, setShowEditBedModal] = useState(false);
  const [isBedDataLoading, setIsBedDataLoading] = useState(false);
  const [showBedTypeModal, setAddBedTypeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editData, setEditData] = useState<BedTypeData>();
  const [pageSize] = useState(10);
  const { bedTypeData, isError, loading, validate, mutate } = useBedType();
  const [currentPageSize, setPageSize] = useState(10);
  const pageSizes = [10, 20, 30, 40, 50];
  const tableHeaders = [
    {
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      header: t('displayName', 'Display Name'),
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

  const tableRows = useMemo(() => {
    return bedTypeData?.map((entry) => ({
      id: entry.uuid,
      name: entry?.name,
      displayName: entry?.displayName,
      description: entry?.description,
      actions: (
        <>
          <Button
            enterDelayMs={300}
            renderIcon={Edit}
            onClick={(e) => {
              e.preventDefault();
              setEditData(entry);
              setShowEditBedModal(true);
              setAddBedTypeModal(false);
            }}
            kind={'ghost'}
            iconDescription={t('editBedType', 'Edit Bed Type')}
            hasIconOnly
            size={responsiveSize}
            tooltipAlignment="start"
          />
        </>
      ),
    }));
  }, [responsiveSize, bedTypeData, t]);

  if (isBedDataLoading || loading) {
    return (
      <>
        <Header route="Bed Type" />
        <div className={styles.widgetCard}>
          <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header route="Bed Type" />
        <div className={styles.widgetCard}>
          <ErrorState error={isError} headerTitle={headerTitle} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header route="Bed Type" />

      <div className={styles.widgetCard}>
        {showBedTypeModal ? (
          <BedTypeForm onModalChange={setAddBedTypeModal} showModal={showBedTypeModal} mutate={mutate} />
        ) : null}
        {showEditBedModal ? (
          <EditBedTypeForm
            onModalChange={setShowEditBedModal}
            showModal={showEditBedModal}
            editData={editData}
            mutate={mutate}
          />
        ) : null}
        <CardHeader title={headerTitle}>
          <span className={styles.backgroundDataFetchingIndicator}>
            <span>{validate ? <InlineLoading /> : null}</span>
          </span>
          {bedTypeData?.length ? (
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              onClick={() => setAddBedTypeModal(true)}>
              {t('addBedtype', 'Add Bed Type')}
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
                      <TableHeader>{header.header?.content ?? header.header}</TableHeader>
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
                      <p className={styles.content}>{t('No data', 'No data to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                    <p className={styles.separator}>{t('or', 'or')}</p>
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={(props) => <Add size={16} {...props} />}
                      onClick={() => setAddBedTypeModal(true)}>
                      {t('bedType', 'Add Bed Type')}
                    </Button>
                  </Tile>
                </div>
              ) : null}
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                pageSizes={[10, 20, 30, 40, 50]}
                totalItems={bedTypeData.length}
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
