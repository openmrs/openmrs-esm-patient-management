import React from 'react';
import classNames from 'classnames';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import { getDosage } from '../past-visit.resource';
import { OrderItem } from '../../types/index';
import styles from './past-visit-summary.scss';
interface MedicationProps {
  medications: Array<OrderItem>;
}
const Medications: React.FC<MedicationProps> = ({ medications }) => {
  const { t } = useTranslation();

  return (
    <div>
      {medications.length > 0 ? (
        medications.map(
          (medication: OrderItem, ind) =>
            medication.order?.dose &&
            medication.order?.orderType?.display === 'Drug Order' && (
              <div className={styles.medicationContainer}>
                <Tile className={styles.medicationTile}>
                  <p className={styles.medicationRecord}>
                    <strong>{capitalize(medication.order.drug?.name)}</strong> &mdash;{' '}
                    {medication.order.drug?.strength?.toLowerCase()}
                    &mdash; {medication.order.doseUnits?.display?.toLowerCase()} &mdash;{' '}
                    <span>
                      <span className={styles.label01}> {t('dose', 'Dose').toUpperCase()} </span>{' '}
                    </span>
                    <span className={styles.dosage}>
                      {getDosage(medication.order.drug?.strength, medication.order?.dose)?.toLowerCase()}
                    </span>{' '}
                    &mdash; {medication.order.route?.display?.toLowerCase()} &mdash;{' '}
                    {medication.order.frequency?.display?.toLowerCase()} &mdash;{' '}
                    {!medication.order.duration
                      ? t('orderIndefiniteDuration', 'Indefinite duration')
                      : t('orderDurationAndUnit', 'for {{duration}} {{durationUnit}}', {
                          duration: medication.order.duration,
                          durationUnit: medication.order.durationUnits?.display?.toLowerCase(),
                        })}
                    {medication.order?.numRefills !== 0 && (
                      <span>
                        <span className={styles.label01}> &mdash; {t('refills', 'Refills').toUpperCase()}</span>{' '}
                        {medication.order.numRefills}
                        {''}
                      </span>
                    )}
                    {medication.order?.dosingInstructions && (
                      <span> &mdash; {medication.order?.dosingInstructions.toLocaleLowerCase()}</span>
                    )}
                    {medication.order?.orderReasonNonCoded ? (
                      <span>
                        &mdash; <span className={styles.label01}>{t('indication', 'Indication').toUpperCase()}</span>{' '}
                        {medication.order?.orderReasonNonCoded}
                      </span>
                    ) : null}
                    {medication.order?.quantity ? (
                      <span>
                        <span className={styles.label01}> &mdash; {t('quantity', 'Quantity').toUpperCase()}</span>{' '}
                        {medication.order?.quantity}
                      </span>
                    ) : null}
                    {medication.order?.dateStopped ? (
                      <span className={styles.bodyShort01}>
                        <span className={styles.label01}>
                          {medication.order?.quantity ? ` — ` : ''} {t('endDate', 'End date').toUpperCase()}
                        </span>{' '}
                        {formatDate(new Date(medication.order?.dateStopped))}
                      </span>
                    ) : null}
                  </p>
                </Tile>
                <p className={styles.metadata}>
                  {medication.time} ·{' '}
                  {medication.provider.name ? (
                    <span>
                      {' '}
                      {medication.provider && medication.provider.name},{' '}
                      {medication.provider && medication.provider.role}{' '}
                    </span>
                  ) : null}{' '}
                  ·{' '}
                </p>
              </div>
            ),
        )
      ) : (
        <p className={classNames(styles.bodyLong01, styles.text02)}>
          {t('noMedicationsFound', 'No medications found')}
        </p>
      )}
    </div>
  );
};

export default Medications;
