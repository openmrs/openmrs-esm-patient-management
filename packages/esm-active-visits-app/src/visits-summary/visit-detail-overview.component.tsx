import React, { useEffect, useState } from 'react';
import styles from './visit-detail-overview.scss';
import { Visit, getVisitsForPatient, createErrorHandler } from '@openmrs/esm-framework';
import SkeletonText from 'carbon-components-react/es/components/SkeletonText';
import VisitDetailComponent from './past-visits-components/visit-detail.component';
import { useTranslation } from 'react-i18next';

interface VisitOverviewComponentProps {
  patientUuid: string;
}

function VisitDetailOverviewComponent({ patientUuid }: VisitOverviewComponentProps) {
  const [visits, setVisits] = useState<Array<Visit> | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();
      const custom =
        'custom:(uuid,encounters:(uuid,encounterDatetime,' +
        'orders:(uuid,dateActivated,' +
        'drug:(uuid,name,strength),doseUnits:(uuid,display),' +
        'dose,route:(uuid,display),frequency:(uuid,display),' +
        'duration,durationUnits:(uuid,display),numRefills,' +
        'orderType:(uuid,display),orderer:(uuid,person:(uuid,display))),' +
        'obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),' +
        'display,groupMembers:(uuid,concept:(uuid,display),' +
        'value:(uuid,display)),value),encounterType:(uuid,display),' +
        'encounterProviders:(uuid,display,encounterRole:(uuid,display),' +
        'provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime';
      const sub = getVisitsForPatient(patientUuid, abortController, custom).subscribe(({ data }) => {
        setVisits(data.results);
      }, createErrorHandler());
      return () => {
        abortController.abort();
        sub.unsubscribe();
      };
    }
  }, [patientUuid]);

  return (
    <div style={{ padding: '0 1rem' }}>
      {visits ? (
        visits.length > 0 ? (
          <div className={styles.container}>
            <h2 className={`${styles.productiveHeading03} ${styles.encounterHeading}`}>Encounters</h2>
            {visits.map((visit, ind) => (
              <VisitDetailComponent key={ind} visit={visit} patientUuid={patientUuid} />
            ))}
          </div>
        ) : (
          <p className={styles.bodyShort02}>{t('NoVisitsFound', 'No visits found')}</p>
        )
      ) : (
        <SkeletonText heading />
      )}
    </div>
  );
}

export default VisitDetailOverviewComponent;
