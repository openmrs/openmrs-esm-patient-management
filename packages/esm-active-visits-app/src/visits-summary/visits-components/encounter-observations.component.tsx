import { SkeletonText } from '@carbon/react';
import { type Obs } from '@openmrs/esm-api/src';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../visit-detail-overview.scss';

interface EncounterObservationsProps {
  observations: Array<Obs>;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations }) => {
  const { t } = useTranslation();

  const observationsList = useMemo(() => {
    return (
      observations &&
      observations.map((obs) => {
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
            <span className={classNames(styles.bodyShort02, styles.text01)}>{obs.answer}</span>
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
