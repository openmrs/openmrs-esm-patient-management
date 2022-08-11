import React from 'react';
import {
  StructuredListHead,
  StructuredListCell,
  StructuredListRow,
  StructuredListBody,
  StructuredListWrapper,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { FormattedEncounter } from './past-visit.component';
import styles from './past-visit.scss';

interface EncounterListProps {
  encounters: Array<FormattedEncounter>;
}

const EncounterList: React.FC<EncounterListProps> = ({ encounters }) => {
  const { t } = useTranslation();

  const structuredListBodyRowGenerator = () => {
    return encounters.map((encounter, i) => (
      <StructuredListRow label key={`row-${i}`}>
        <StructuredListCell>{formatDatetime(parseDate(encounter.datetime), { mode: 'wide' })}</StructuredListCell>
        <StructuredListCell className={styles.textColor}>{encounter.encounterType}</StructuredListCell>
        <StructuredListCell>{encounter.provider}</StructuredListCell>
      </StructuredListRow>
    ));
  };

  if (encounters?.length) {
    return (
      <div className={styles.encounterListContainer}>
        <StructuredListWrapper>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>{t('dateTime', 'Date & time')}</StructuredListCell>
              <StructuredListCell head>{t('encounterType', 'Encounter type')}</StructuredListCell>
              <StructuredListCell head>{t('provider', 'Provider')}</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>{structuredListBodyRowGenerator()}</StructuredListBody>
        </StructuredListWrapper>
      </div>
    );
  }

  return <p className={`${styles.bodyLong01} ${styles.text02}`}>{t('noEncountersFound', 'No encounters found')}</p>;
};

export default EncounterList;
