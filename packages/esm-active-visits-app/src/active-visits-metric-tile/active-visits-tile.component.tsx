import React from 'react';
import { Tile } from '@carbon/react';
import styles from './active-visits-tile.scss';
import { useTranslation } from 'react-i18next';
import { openmrsFetch, useSession } from '@openmrs/esm-framework';
import useSWR from 'swr';

function useActiveVisits() {
  const session = useSession();
  const sessionLocation = session?.sessionLocation?.uuid;

  const customRepresentation = 'custom:(uuid,startDatetime,stopDatetime)';

  const getUrl = () => {
    let url = `/ws/rest/v1/visit?v=${customRepresentation}&`;
    let urlSearchParams = new URLSearchParams();

    urlSearchParams.append('includeInactive', 'false');
    urlSearchParams.append('totalCount', 'true');
    urlSearchParams.append('location', `${sessionLocation}`);

    return url + urlSearchParams.toString();
  };

  const { data, error, isLoading } = useSWR<{ data: { results: any[]; totalCount: number } }>(getUrl, openmrsFetch);

  const responseData = data?.data.results;

  return {
    data: responseData,
    error,
    isLoading,
  };
}

const ActiveVisitsTile: React.FC = () => {
  const { data: activeVisitsData } = useActiveVisits();

  const { t } = useTranslation();
  return (
    <React.Fragment>
      <Tile className={styles.tileContainer}>
        <div>
          <div className={styles.tileContent}>
            <div className={styles.tileHeader}>
              <header>{t('activeVisits', 'Active Visits')}</header>
            </div>
            <div className={styles.displayDetails}>
              <div>Patients</div>
              <div className={styles.displayData}>{activeVisitsData?.length ?? 0}</div>
            </div>
          </div>
        </div>
      </Tile>
    </React.Fragment>
  );
};

export default ActiveVisitsTile;
