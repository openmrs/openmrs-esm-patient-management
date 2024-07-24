import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Pagination,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
} from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { navigate, usePagination } from '@openmrs/esm-framework';
import Header from '../header/header.component';
import { useBedsForLocation, useLocationName } from '../summary/summary.resource';
import styles from './ward-with-beds.scss';

type RouteParams = { location: string };

const WardWithBeds: React.FC = () => {
  const { location } = useParams<RouteParams>();
  const { isLoading, bedData } = useBedsForLocation(location);

  const { name } = useLocationName(location);

  const [pageSize, setPageSize] = useState(10);
  const { results: paginatedData, goTo, currentPage } = usePagination(bedData, pageSize);

  if (isLoading) {
    <p>Loading...</p>;
  }

  const tableHeaders = [
    {
      id: 0,
      header: 'ID',
      key: 'id',
    },
    {
      id: 1,
      header: 'Number',
      key: 'number',
    },
    {
      id: 2,
      header: 'Name',
      key: 'name',
    },
    {
      id: 3,
      header: 'Description',
      key: 'description',
    },
    {
      id: 4,
      header: 'Occupied',
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
    return paginatedData?.map((bed) => ({
      id: bed.id,
      number: bed.number,
      name: bed.name,
      description: bed.description,
      occupied: <CustomTag condition={bed?.status === 'OCCUPIED'} />,
    }));
  }, [paginatedData]);

  return (
    <>
      <Header route={name ? name : '--'} />
      {isLoading && (
        <div className={styles.container}>
          <DataTableSkeleton role="progressbar" zebra />
        </div>
      )}

      {bedData?.length ? (
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
              <span>Return to summary</span>
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
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
            <Pagination
              backwardText="Previous page"
              forwardText="Next page"
              itemsPerPageText="Items per page:"
              page={currentPage}
              pageNumberText="Page Number"
              pageSize={pageSize}
              onChange={({ page, pageSize }) => {
                goTo(page);
                setPageSize(pageSize);
              }}
              pageSizes={[10, 20, 30, 40, 50]}
              totalItems={paginatedData?.length}
            />
          </div>
        </>
      ) : null}
    </>
  );
};

export default WardWithBeds;
