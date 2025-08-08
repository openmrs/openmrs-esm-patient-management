import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
} from '@carbon/react';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { type FormattedEncounter } from '../../types/index';
import styles from './encounter-list.scss';

interface EncounterListProps {
  encounters: Array<FormattedEncounter>;
}

const EncounterList: React.FC<EncounterListProps> = ({ encounters }) => {
  const { t } = useTranslation();

  const structuredListBodyRowGenerator = () => {
    return encounters.map((encounter, i) => {
      const parsedDate = encounter.datetime ? parseDate(encounter.datetime) : null;
      const formattedDate =
        parsedDate && !isNaN(parsedDate.getTime()) ? formatDatetime(parsedDate, { mode: 'wide' }) : '--';

      return (
        <StructuredListRow label key={`row-${i}`}>
          <StructuredListCell>{formattedDate}</StructuredListCell>
          <StructuredListCell>{encounter.encounterType}</StructuredListCell>
          <StructuredListCell>{encounter.provider}</StructuredListCell>
        </StructuredListRow>
      );
    });
  };

  if (encounters?.length) {
    return (
      <StructuredListWrapper>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>{t('date&Time', 'Date & time')}</StructuredListCell>
            <StructuredListCell head>{t('encounterType', 'Encounter type')}</StructuredListCell>
            <StructuredListCell head>{t('provider', 'Provider')}</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>{structuredListBodyRowGenerator()}</StructuredListBody>
      </StructuredListWrapper>
    );
  }

  return (
    <p className={classNames(styles.bodyLong01, styles.text02)}>{t('noEncountersFound', 'No encounters found')}</p>
  );
};

export default EncounterList;
