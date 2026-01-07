import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Tag,
} from '@carbon/react';
import { ArrowLeft, Add } from '@carbon/react/icons';
import { launchWorkspace2, navigate, usePagination } from '@openmrs/esm-framework';
import { useBedsForLocation, useLocationName } from '../summary/summary.resource';
import { type Bed, type WorkspaceMode } from '../types';
import Header from '../header/header.component';
import styles from './ward-with-beds.scss';

type RouteParams = { location: string };

const WardWithBeds: React.FC = () => {
  const { t } = useTranslation();
  const { location } = useParams<RouteParams>();
  const { bedsData, isLoadingBeds, mutate, isValidating } = useBedsForLocation(location);
  const { name } = useLocationName(location);

  const [pageSize, setPageSize] = useState(10);
  const { results: paginatedData, goTo, currentPage } = usePagination(bedsData, pageSize);

  const tableHeaders = [
    {
      id: 0,
      header: t('bedId', 'Bed ID'),
      key: 'id',
    },
    {
      id: 1,
      header: t('number', 'Number'),
      key: 'number',
    },
    {
      id: 2,
      header: t('type', 'Type'),
      key: 'type',
    },
    {
      id: 3,
      header: t('occupied', 'Occupied'),
      key: 'occupied',
    },
  ];

  const CustomTag = ({ condition }: { condition: boolean }) => {
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
  };

  const tableRows = useMemo(() => {
    return (
      paginatedData?.map((bed) => ({
        id: String(bed.id),
        number: bed.number,
        type: bed.type,
        occupied: <CustomTag condition={bed?.status === 'OCCUPIED'} />,
      })) ?? []
    );
  }, [paginatedData]);

  const handleLaunchBedFormWorkspace = (mode: WorkspaceMode, bed?: Bed) => {
    launchWorkspace2('bed-form-workspace', {
      mutateBeds: mutate,
      defaultLocation: { display: name, uuid: location },
      ...(mode === 'edit' && bed ? { bed } : {}),
    });
  };

  return (
    <>
      <Header title={name ? name : '--'} />

      {isLoadingBeds && (
        <div className={styles.container}>
          <DataTableSkeleton zebra />
        </div>
      )}

      {bedsData?.length ? (
        <>
          <div className={styles.backButton}>
            <Button
              kind="ghost"
              renderIcon={(props) => <ArrowLeft size={24} {...props} />}
              iconDescription="Return to summary"
              onClick={() =>
                navigate({
                  to: `${window.getOpenmrsSpaBase()}bed-management`,
                })
              }>
              <span>{t('returnToSummary', 'Return to summary')}</span>
            </Button>
            <span>{isValidating ? <InlineLoading /> : null}</span>
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              onClick={() => handleLaunchBedFormWorkspace('add')}>
              <span>{t('addBed', 'Add bed')}</span>
            </Button>
          </div>
          <div className={styles.container}>
            <DataTable rows={tableRows} headers={tableHeaders} useZebraStyles>
              {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
                <TableContainer>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {typeof cell.value === 'object' && cell.value !== null && 'content' in cell.value
                                ? (cell.value.content as React.ReactNode)
                                : (cell.value as React.ReactNode)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
            <Pagination
              backwardText={t('previousPage', 'Previous page')}
              forwardText={t('nextPage', 'Next page')}
              itemsPerPageText={t('itemsPerPage', 'Items per page:')}
              page={currentPage}
              pageNumberText={t('pageNumber', 'Page Number')}
              pageSize={pageSize}
              onChange={({ page, pageSize }) => {
                goTo(page);
                setPageSize(pageSize);
              }}
              pageSizes={[10, 20, 30, 40, 50]}
              totalItems={bedsData?.length}
            />
          </div>
        </>
      ) : null}
    </>
  );
};

export default WardWithBeds;
