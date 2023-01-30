import React from 'react';
import { SkeletonIcon, Layer, Tile, Tag, Button } from '@carbon/react';
import { UserFollow } from '@carbon/react/icons';
import styles from './verification-results.scss';
import { useTranslation } from 'react-i18next';
import EmptyDataIllustration from './EmptyIllustration.component';
import { ClientRegistryPatient } from '../patient-verification-types';
import { age, ExtensionSlot, formatDate, navigate, parseDate } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import startCase from 'lodash-es/startCase';
import { clientRegistryStore } from '../patient-verification-helper';
import counties from '../assets/counties.json';

interface VerificationResultsProps {
  client: ClientRegistryPatient;
}

const VerificationResults: React.FC<VerificationResultsProps> = ({ client }) => {
  const { t } = useTranslation();

  const patientPhotoSlotState = React.useMemo(
    () => ({ patientName: `${client.client.firstName} ${client.client.middleName} ${client.client.lastName}` }),
    [client],
  );

  const handleCreatePatient = () => {
    const countryName = counties.find((county) => county.code === parseInt(client?.client.residence.county))?.name;
    clientRegistryStore.setState({
      ...client,
      client: { ...client?.client, residence: { ...client?.client.residence, county: countryName } },
    });
    navigate({ to: '${openmrsSpaBase}/patient-registration' });
  };

  if (!client?.clientExists) {
    return (
      <div className={styles.searchResults}>
        <Layer>
          <Tile className={styles.emptySearchResultsTile}>
            <EmptyDataIllustration />
            <p className={styles.emptyResultText}>
              {t('noPatientChartsFoundMessage', 'Sorry, no patient records have been found in the registry')}
            </p>
            <p className={styles.actionText}>
              <span>{t('trySearchWithOtherDocument', "Try searching with the patient's other document records")}</span>
              <br />
              <span>{t('orPatientName', 'OR register this patient to client registry')}</span>
            </p>
          </Tile>
        </Layer>
      </div>
    );
  }

  if (client.clientExists) {
    return (
      <div className={styles.container} role="banner">
        <div className={styles.patientAvatar} role="img">
          <ExtensionSlot extensionSlotName="patient-photo-slot" state={patientPhotoSlotState} />
        </div>
        <div className={styles.patientInfo}>
          <div className={`${styles.row} ${styles.patientNameRow}`}>
            <div className={styles.flexRow}>
              <span className={styles.patientName}>{patientPhotoSlotState.patientName}</span>
            </div>
            <Button kind="ghost" size="sm" renderIcon={UserFollow} onClick={handleCreatePatient}>
              {t('createPatient', 'Create patient')}
            </Button>
          </div>
          <div className={styles.demographics}>
            <span>{capitalize(client.client?.gender)}</span> &middot; <span>{age(client?.client?.dateOfBirth)}</span>{' '}
            &middot; <span>{formatDate(parseDate(client?.client?.dateOfBirth), { mode: 'wide', time: false })}</span>
          </div>
          <div className={styles.row}>
            <div className={styles.identifiers}>
              {client.client?.identifications?.length
                ? client.client?.identifications?.map(({ identificationNumber, identificationType }) => (
                    <span className={styles.identifierTag}>
                      <Tag key={identificationNumber} type="gray" title={identificationType}>
                        {startCase(identificationType.replace('-', ' '))}
                      </Tag>
                      <p>{identificationNumber}</p>
                    </span>
                  ))
                : ''}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default VerificationResults;
