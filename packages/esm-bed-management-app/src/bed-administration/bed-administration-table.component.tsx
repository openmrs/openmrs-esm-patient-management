import React, { useCallback, useMemo, useState } from 'react';
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
import {
  ErrorState,
  isDesktop as desktopLayout,
  showModal,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { useBedsGroupedByLocation } from '../summary/summary.resource';
import CardHeader from '../card-header/card-header.component';
import Header from '../header/header.component';
import type { BedWithLocation } from '../types';
import styles from './bed-administration-table.scss';

const BedAdministrationTable: React.FC = () => {
  const { t } = useTranslation();
  const headerTitle = t('wardAllocation', 'Ward allocation');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const isDesktop = desktopLayout(layout);

  const {
    bedsGroupedByLocation,
    isLoadingBedsGroupedByLocation,
    isValidatingBedsGroupedByLocation,
    mutateBedsGroupedByLocation,
    errorFetchingBedsGroupedByLocation,
  } = useBedsGroupedByLocation();
  const [filterOption, setFilterOption] = useState('ALL');

  const openNewBedModal = () => {
    const dispose = showModal('new-bed-modal', {
      closeModal: () => dispose(),
      mutate: mutateBedsGroupedByLocation,
    });
  };

  const openEditBedModal = useCallback(
    (editData: BedWithLocation) => {
      const dispose = showModal('edit-bed-modal', {
        closeModal: () => dispose(),
        mutate: mutateBedsGroupedByLocation,
        editData,
      });
    },
    [mutateBedsGroupedByLocation],
  );

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
  const filteredData = useMemo(() => {
    const flattenedData = Array.isArray(bedsGroupedByLocation) ? bedsGroupedByLocation.flat() : [];
    return filterOption === 'ALL' ? flattenedData : flattenedData.filter((bed) => bed.status === filterOption);
  }, [bedsGroupedByLocation, filterOption]);
  const [pageSize, setPageSize] = useState(10);
  const { results: paginatedData, currentPage, goTo } = usePagination(filteredData, pageSize);

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
      header: t('occupancyStatus', 'Occupancy status'),
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
    return paginatedData.flat().map((bed) => ({
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
              openEditBedModal(bed);
            }}
            kind={'ghost'}
            iconDescription={t('editBed', 'Edit bed')}
            hasIconOnly
            size={responsiveSize}
            tooltipPosition="right"
          />
        </>
      ),
    }));
  }, [openEditBedModal, responsiveSize, paginatedData, t]);

  if (isLoadingBedsGroupedByLocation && !bedsGroupedByLocation.length) {
    return (
      <>
        <Header title={t('wardAllocation', 'Ward allocation')} />
        <div className={styles.widgetCard}>
          <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />
        </div>
      </>
    );
  }

  if (errorFetchingBedsGroupedByLocation) {
    return (
      <>
        <Header title={t('wardAllocation', 'Ward allocation')} />
        <div className={styles.widgetCard}>
          <ErrorState error={errorFetchingBedsGroupedByLocation} headerTitle={headerTitle} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t('wardAllocation', 'Ward allocation')} />
      <div className={styles.flexContainer}>
        {paginatedData?.length ? (
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
        <CardHeader title={headerTitle}>
          <span className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidatingBedsGroupedByLocation ? <InlineLoading /> : null}</span>
          </span>
          {paginatedData?.length ? (
            <Button kind="ghost" renderIcon={(props) => <Add size={16} {...props} />} onClick={openNewBedModal}>
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
                      onClick={openNewBedModal}>
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
                pageSize={pageSize}
                pageSizes={[10, 20, 30, 40, 50]}
                totalItems={filteredData.length}
                onChange={({ pageSize: newPageSize, page }) => {
                  if (newPageSize !== pageSize) {
                    setPageSize(newPageSize);
                    goTo(1);
                  }
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
