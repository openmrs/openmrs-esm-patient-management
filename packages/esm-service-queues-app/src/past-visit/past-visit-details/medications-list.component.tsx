import React from 'react';
import classNames from 'classnames';
import { capitalize } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@openmrs/esm-framework';
import { type OrderItem } from '../../types/index';
import styles from './past-visit-summary.scss';

interface MedicationProps {
  medications: Array<OrderItem>;
}

const Medications: React.FC<MedicationProps> = ({ medications }) => {
  const { t } = useTranslation();

  if (medications.length === 0) {
    return (
      <p className={classNames(styles.bodyLong01, styles.text02)}>{t('noMedicationsFound', 'No medications found')}</p>
    );
  }

  const drugOrders = medications.filter(
    (m) => m.order?.orderType?.display === 'Drug Order' && m.order?.action !== 'DISCONTINUE',
  );

  // Only keep leaf orders (those not referenced by another order's previousOrder)
  const medicationsToDisplay = drugOrders.filter(
    (m) => !drugOrders.some((o2) => o2.order?.previousOrder?.uuid === m.order?.uuid),
  );

  return (
    <div className={styles.medicationRecord}>
      {medicationsToDisplay.map(
        (medication) =>
          medication?.order?.dose && (
            <React.Fragment key={medication.order.uuid}>
              <div className={styles.medicationContainer}>
                <div>
                  <p className={styles.bodyLong01}>
                    <strong>{capitalize(medication?.order?.drug?.display)}</strong>{' '}
                    {medication?.order?.drug?.strength && (
                      <>&mdash; {medication?.order?.drug?.strength?.toLowerCase()}</>
                    )}{' '}
                    {medication?.order?.doseUnits?.display && (
                      <>&mdash; {medication?.order?.doseUnits?.display?.toLowerCase()}</>
                    )}{' '}
                  </p>
                  <p className={styles.bodyLong01}>
                    <span className={styles.label01}> {t('dose', 'Dose')} </span>{' '}
                    <span className={styles.dosage}>
                      {medication?.order?.dose} {medication?.order?.doseUnits?.display?.toLowerCase()}
                    </span>{' '}
                    {medication.order?.route?.display && (
                      <span>&mdash; {medication?.order?.route?.display?.toLowerCase()} &mdash; </span>
                    )}
                    {medication?.order?.frequency?.display?.toLowerCase()} &mdash;{' '}
                    {!medication?.order?.duration
                      ? t('orderIndefiniteDuration', 'Indefinite duration')
                      : t('orderDurationAndUnit', 'for {{duration}} {{durationUnit}}', {
                          duration: medication?.order?.duration,
                          durationUnit: medication?.order?.durationUnits?.display?.toLowerCase(),
                        })}
                    {medication?.order?.numRefills !== 0 && (
                      <span>
                        <span className={styles.label01}> &mdash; {t('refills', 'Refills')}</span>{' '}
                        {medication?.order?.numRefills}
                        {''}
                      </span>
                    )}
                    {medication?.order?.dosingInstructions && (
                      <span> &mdash; {medication?.order?.dosingInstructions?.toLowerCase()}</span>
                    )}
                  </p>
                  <p className={styles.bodyLong01}>
                    {medication?.order?.orderReasonNonCoded ? (
                      <span>
                        <span className={styles.label01}>{t('indication', 'Indication')}</span>{' '}
                        {medication?.order?.orderReasonNonCoded}{' '}
                      </span>
                    ) : null}
                    {medication?.order?.orderReasonNonCoded && medication?.order?.quantity && <>&mdash;</>}
                    {medication?.order?.quantity ? (
                      <span>
                        <span className={styles.label01}> {t('quantity', 'Quantity')}</span>{' '}
                        {medication?.order?.quantity}
                      </span>
                    ) : null}
                    {medication?.order?.dateStopped ? (
                      <span className={styles.bodyShort01}>
                        <span className={styles.label01}>
                          {medication?.order?.quantity ? ` — ` : ''} {t('endDate', 'End date')}
                        </span>{' '}
                        {formatDate(new Date(medication?.order?.dateStopped))}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              <p className={styles.metadata}>
                {medication?.time}
                {medication?.provider?.name && <> &middot; {medication?.provider?.name}</>}
                {medication?.provider?.role && <>, {medication?.provider?.role}</>}
              </p>
            </React.Fragment>
          ),
      )}
    </div>
  );
};

export default Medications;
