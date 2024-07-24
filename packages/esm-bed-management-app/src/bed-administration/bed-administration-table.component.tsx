import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
  InlineLoading,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  Tile,
} from '@carbon/react';
import { Add, Edit } from '@carbon/react/icons';
import { ErrorState, isDesktop as desktopLayout, useLayoutType, usePagination } from '@openmrs/esm-framework';
import type { BedFormData } from '../types';
import { useBedsGroupedByLocation } from '../summary/summary.resource';
import EditBedForm from './edit-bed-form.component';
import Header from '../header/header.component';
import NewBedForm from './new-bed-form.component';
import styles from './bed-administration-table.scss';
import { CardHeader } from '../card-header/card-header.component';

const BedAdministrationTable: React.FC = () => {
  const { t } = useTranslation();
  const headerTitle = t('wardAllocation', 'Ward Allocation');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const isDesktop = desktopLayout(layout);

  const {
    data: wardsGroupedByLocations,
    isLoading: isLoadingBeds,
    isValidating,
    mutate,
    error,
  } = useBedsGroupedByLocation();
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [showEditBedModal, setShowEditBedModal] = useState(false);
  const [editData, setEditData] = useState<BedFormData>();
  const [filterOption, setFilterOption] = useState('ALL');

  function CustomTag({ condition }: { condition: boolean }) {
    const { t } = useTranslation();

    if (condition) {
      return (
        <Tag type="green" size="md">
          {t('yes', 'Yes')}
        </Tag>
      );
    }

    return (
      <Tag type="red" size="md">
        {t('no', 'No')}
      </Tag>
    );
  }

  const handleBedStatusChange = ({ selectedItem }: { selectedItem: string }) =>
    setFilterOption(selectedItem.trim().toUpperCase());

  const [pageSize, setPageSize] = useState(10);
  const { results, currentPage, totalPages, goTo } = usePagination(
    filterOption === 'ALL'
      ? wardsGroupedByLocations
      : wardsGroupedByLocations.filter((bed) => bed.status === filterOption) ?? [],
    pageSize,
  );

  const tableHeaders = [
    {
      key: 'bedNumber',
      header: t('bedId', 'Bed ID'),
    },
    {
      key: 'location',
      header: t('location', 'Location'),
    },
    {
      key: 'occupancyStatus',
      header: t('occupancyStatus', 'Occupied'),
    },
    {
      key: 'allocationStatus',
      header: t('allocationStatus', 'Allocated'),
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];

  const tableRows = useMemo(() => {
    return results.flat().map((bed) => ({
      id: bed.uuid,
      bedNumber: bed.bedNumber,
      location: bed.location.display,
      occupancyStatus: <CustomTag condition={bed?.status === 'OCCUPIED'} />,
      allocationStatus: <CustomTag condition={Boolean(bed.location?.uuid)} />,
      actions: (
        <>
          <Button
            enterDelayMs={300}
            renderIcon={Edit}
            onClick={(e) => {
              e.preventDefault();
              setEditData(bed);
              setShowEditBedModal(true);
              setShowAddBedModal(false);
            }}
            kind={'ghost'}
            iconDescription={t('editBed', 'Edit Bed')}
            hasIconOnly
            size={responsiveSize}
            tooltipAlignment="start"
          />
        </>
      ),
    }));
  }, [responsiveSize, results, t]);

  if (isLoadingBeds && !wardsGroupedByLocations.length) {
    return (
      <>
        <Header route="Ward Allocation" />
        <div className={styles.widgetCard}>
          <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header route="Ward Allocation" />
        <div className={styles.widgetCard}>
          <ErrorState error={error} headerTitle={headerTitle} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header route="Ward Allocation" />
      <div className={styles.flexContainer}>
        {results?.length ? (
          <div className={styles.filterContainer}>
            <Dropdown
              id="occupancyStatus"
              initialSelectedItem={'All'}
              label=""
              titleText={t('filterByOccupancyStatus', 'Filter by occupancy status') + ':'}
              type="inline"
              items={['All', 'Available', 'Occupied']}
              onChange={handleBedStatusChange}
            />
          </div>
        ) : null}
      </div>
      <div className={styles.widgetCard}>
        {showAddBedModal ? (
          <NewBedForm onModalChange={setShowAddBedModal} showModal={showAddBedModal} mutate={mutate} />
        ) : null}
        {showEditBedModal ? (
          <EditBedForm
            onModalChange={setShowEditBedModal}
            showModal={showEditBedModal}
            editData={editData}
            mutate={mutate}
          />
        ) : null}
        <CardHeader title={headerTitle}>
          <span className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </span>
          {results?.length ? (
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              onClick={() => setShowAddBedModal(true)}>
              {t('addBed', 'Add bed')}
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
                      onClick={() => setShowAddBedModal(true)}>
                      {t('addBed', 'Add bed')}
                    </Button>
                  </Tile>
                </div>
              ) : null}
              <Pagination
                backwardText="Previous page"
                forwardText="Next page"
                page={currentPage}
                pageNumberText="Page Number"
                pageSize={totalPages}
                pageSizes={[10, 20, 30, 40, 50]}
                totalItems={wardsGroupedByLocations.length}
                onChange={({ pageSize, page }) => {
                  setPageSize(pageSize);
                  if (page !== currentPage) {
                    goTo(page);
                  }
                }}
              />
            </TableContainer>
          )}
        </DataTable>
      </div>
    </>
  );
};

export default BedAdministrationTable;
