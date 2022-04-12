import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Row, Column, InlineLoading } from 'carbon-components-react';
import styles from './contact-details.scss';
import { usePatientContactAttributes } from './hooks/usePatientAttributes';

interface ContactDetailsProps {
  patientId: string;
  address: Array<fhir.Address>;
  contact: Array<fhir.ContactPoint>;
}

const Address: React.FC<{ address?: fhir.Address }> = ({ address }) => {
  const { t } = useTranslation();

  return (
    <>
      <p className={styles.heading}>{t('placeOfResidence', 'Place Of Residence')}</p>
      <ul className={styles.listMargin}>
        {address ? (
          <>
            <li>{address.postalCode}</li>
            <li>{address.city}</li>
            <li>{address.state}</li>
            <li>{address.country}</li>
          </>
        ) : (
          '--'
        )}
      </ul>
    </>
  );
};

const Contact: React.FC<{ contact: Array<fhir.ContactPoint>; patientUuid: string }> = ({ contact, patientUuid }) => {
  const { t } = useTranslation();
  const value = contact?.length ? contact[0].value : '--';

  const { isLoading, contactAttributes } = usePatientContactAttributes(patientUuid);

  return (
    <>
      <p className={styles.heading}>{t('contactDetails', 'Contact Details')}</p>
      <ul className={styles.listMargin}>
        <li>{value}</li>
        {isLoading ? (
          <InlineLoading description={t('loading', 'Loading...')} />
        ) : (
          contactAttributes?.map(({ attributeType, value, uuid }) => (
            <li key={uuid}>
              {attributeType.display} : {value}
            </li>
          ))
        )}
      </ul>
    </>
  );
};

const ContactDetails: React.FC<ContactDetailsProps> = ({ patientId, address, contact }) => {
  const currentAddress = address ? address.find((a) => a.use === 'home') : undefined;

  return (
    <Grid>
      <Row className={styles.row}>
        <Column className={styles.columnBorder}>
          <Address address={currentAddress} />
        </Column>

        <Column>
          <Contact contact={contact} patientUuid={patientId} />
        </Column>
      </Row>
    </Grid>
  );
};

export default ContactDetails;
