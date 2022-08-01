import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText } from 'carbon-components-react';
import { useRelationships } from './relationships.resource';
import styles from './contact-details.scss';
import { usePatientContactAttributes } from '../hooks/usePatientAttributes';
import { Address as AddressType } from '../../../types';

interface ContactDetailsProps {
  address: Array<AddressType>;
  patientId: string;
}

const Address: React.FC<{ address: AddressType }> = ({ address }) => {
  const { t } = useTranslation();

  return (
    <>
      <p className={styles.heading}>{t('address', 'Address')}</p>
      <ul>
        {address ? (
          <>
            <li>{address.postalCode}</li>
            <li>{address.address1}</li>
            <li>{address.cityVillage}</li>
            <li>{address.stateProvince}</li>
            <li>{address.country}</li>
          </>
        ) : (
          '--'
        )}
      </ul>
    </>
  );
};

const Contact: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { isLoading, contactAttributes } = usePatientContactAttributes(patientUuid);

  return (
    <>
      <p className={styles.heading}>{t('contactDetails', 'Contact Details')}</p>
      <ul>
        {isLoading ? (
          <SkeletonText />
        ) : contactAttributes?.length ? (
          contactAttributes?.map(({ attributeType, value, uuid }) => (
            <li key={uuid}>
              {attributeType.display} : {value}
            </li>
          ))
        ) : (
          '--'
        )}
      </ul>
    </>
  );
};

const Relationships: React.FC<{ patientId: string }> = ({ patientId }) => {
  const { t } = useTranslation();
  const { data: relationships, isLoading } = useRelationships(patientId);

  return (
    <>
      <p className={styles.heading}>{t('relationships', 'Relationships')}</p>
      <>
        {isLoading ? (
          <SkeletonText />
        ) : relationships?.length ? (
          <ul>
            {relationships.map((r) => (
              <li key={r.uuid} className={styles.relationship}>
                <div>{r.display}</div>
                <div>{r.relationshipType}</div>
                <div>{`${r.relativeAge} ${r.relativeAge === 1 ? 'yr' : 'yrs'}`}</div>
              </li>
            ))}
          </ul>
        ) : (
          '--'
        )}
      </>
    </>
  );
};

const ContactDetails: React.FC<ContactDetailsProps> = ({ address, patientId }) => {
  const currentAddress = address ? address.find((a) => a.preferred) : undefined;

  return (
    <div className={styles.contactDetails}>
      <div className={styles.row}>
        <div className={styles.col}>
          <Address address={currentAddress} />
        </div>
        <div className={styles.col}>
          <Contact patientUuid={patientId} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Relationships patientId={patientId} />
        </div>
        <div className={styles.col}>{/* Patient lists go here */}</div>
      </div>
    </div>
  );
};

export default ContactDetails;
