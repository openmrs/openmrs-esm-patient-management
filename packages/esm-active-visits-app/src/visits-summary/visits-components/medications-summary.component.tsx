import React from 'react';
import classNames from 'classnames';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import { formatTime, parseDate } from '@openmrs/esm-framework';
import { type OrderItem, getDosage } from '../visit.resource';
import styles from '../visit-detail-overview.scss';

interface MedicationSummaryProps {
  medications: Array<OrderItem>;
}

const MedicationSummary: React.FC<MedicationSummaryProps> = ({ medications }) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      {medications.length > 0 ? (
        medications.map(
          (medication: OrderItem, ind) =>
            medication.order?.dose &&
            medication.order?.orderType?.display === 'Drug Order' && (
              <React.Fragment key={ind}>
                <p className={classNames(styles.bodyLong01, styles.medicationBlock)}>
                  <strong>{capitalize(medication.order.drug?.name)}</strong> &mdash;{' '}
                  {medication.order.doseUnits?.display} &mdash; {medication.order.route?.display}
                  <br />
                  <span className={styles.label01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
                  <strong>{getDosage(medication.order.drug?.strength, medication.order.dose).toLowerCase()}</strong>{' '}
                  &mdash; {medication.order.frequency?.display} &mdash;{' '}
                  {!medication.order.duration
                    ? t('orderIndefiniteDuration', 'Indefinite duration')
                    : t('orderDurationAndUnit', 'for {{duration}} {{durationUnit}}', {
                        duration: medication.order.duration,
                        durationUnit: medication.order.durationUnits?.display,
                      })}
                  <br />
                  <span className={styles.label01}>{t('refills', 'Refills').toUpperCase()}</span>{' '}
                  {medication.order.numRefills}
                </p>
                <p className={styles.caption01} style={{ color: '#525252' }}>
                  {formatTime(parseDate(medication.order.dateActivated))} &middot;{' '}
                  {medication.provider && medication.provider.name} &middot;{' '}
                  {medication.provider && medication.provider.role}
                </p>
              </React.Fragment>
            ),
        )
      ) : (
        <p className={classNames(styles.bodyLong01, styles.text02)}>
          {t('noMedicationsFound', 'No medications found')}
        </p>
      )}
    </React.Fragment>
  );
};

export default MedicationSummary;
