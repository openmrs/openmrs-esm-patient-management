import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText } from '@carbon/react';
import { Observation } from '../visit.resource';
import styles from '../visit-detail-overview.scss';

interface EncounterObservationsProps {
  observations: Array<Observation>;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations }) => {
  const { t } = useTranslation();

  const observationsList = useMemo(() => {
    return (
      observations &&
      observations.map((obs: Observation) => {
        const [question, answer] = obs.display.split(':');
        return { question, answer };
      })
    );
  }, [observations]);

  return observationsList ? (
    observationsList.length > 0 ? (
      <div className={styles.observation}>
        {observationsList.map((obs, ind) => (
          <React.Fragment key={ind}>
            <span className={styles.caption01}>{obs.question}: </span>
            <span className={`${styles.bodyShort02} ${styles.text01}`}>{obs.answer}</span>
          </React.Fragment>
        ))}
      </div>
    ) : (
      <p className={styles.caption01}>{t('noObservationsFound', 'No observations found')}</p>
    )
  ) : (
    <SkeletonText />
  );
};

export default EncounterObservations;
