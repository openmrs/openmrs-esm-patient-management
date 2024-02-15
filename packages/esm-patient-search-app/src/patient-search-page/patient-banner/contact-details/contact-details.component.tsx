import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { ConfigurableLink, parseDate, useConfig, usePatient } from '@openmrs/esm-framework';
import { useRelationships } from './relationships.resource';
import { usePatientContactAttributes } from '../hooks/usePatientAttributes';
import { usePatientListsForPatient } from '../hooks/usePatientListsForPatient';
import styles from './contact-details.scss';
import classNames from 'classnames';

interface ContactDetailsProps {
  patientId: string;
  deceased: boolean;
}

const PatientLists: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { cohorts = [], isLoading } = usePatientListsForPatient(patientUuid);

  return (
    <>
      <p className={styles.heading}>
        {t('patientLists', 'Patient Lists')} ({cohorts?.length ?? 0})
      </p>
      {isLoading ? (
        <InlineLoading description={`${t('loading', 'Loading')} ...`} role="progressbar" />
      ) : (
        <ul>
          {(() => {
            if (cohorts?.length > 0) {
              const sortedLists = cohorts.sort(
                (a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime(),
              );
              const slicedLists = sortedLists.slice(0, 3);
              return slicedLists?.map((cohort) => (
                <li key={cohort.uuid}>
                  <ConfigurableLink to={`${window.spaBase}/home/patient-lists/${cohort.uuid}`} key={cohort.uuid}>
                    {cohort.name}
                  </ConfigurableLink>
                </li>
              ));
            }
            return <li>--</li>;
          })()}
          <li style={{ marginTop: '1rem' }}>
            <ConfigurableLink to={`${window.spaBase}/home/patient-lists`}>
              {cohorts.length > 3
                ? t('seeMoreLists', 'See {{count}} more lists', {
                    count: cohorts?.length - 3,
                  })
                : ''}
            </ConfigurableLink>
          </li>
        </ul>
      )}
    </>
  );
};

const Address: React.FC<{ patientId: string }> = ({ patientId }) => {
  const { isLoading, patient } = usePatient(patientId);
  const address = patient?.address?.find((a) => a.use === 'home');
  const { t } = useTranslation();
  const getAddressKey = (url) => url.split('#')[1];
  /*
    DO NOT REMOVE THIS COMMENT UNLESS YOU UNDERSTAND WHY IT IS HERE

    t('address1', 'Address line 1')
    t('address2', 'Address line 2')
    t('city', 'City')
    t('cityVillage', 'City')
    t('country', 'Country')
    t('countyDistrict', 'District')
    t('district', 'District')
    t('postalCode', 'Postal code')
    t('state', 'State')
    t('stateProvince', 'State')
  */

  return isLoading ? (
    <InlineLoading description={`${t('loading', 'Loading')} ...`} role="progressbar" />
  ) : (
    <>
      <p className={styles.heading}>{t('address', 'Address')}</p>
      <ul>
        {address ? (
          <React.Fragment>
            {Object.entries(address)
              .filter(([key]) => !['use', 'id'].includes(key))
              .map(([key, value]) =>
                key === 'extension' ? (
                  address?.extension[0]?.extension.map((add, i) => {
                    return (
                      <li key={`address-${key}-${i}`}>
                        {t(getAddressKey(add.url), getAddressKey(add.url))}: {add.valueString}
                      </li>
                    );
                  })
                ) : (
                  <li key={`address-${key}`}>
                    {t(key, key)}: {value}
                  </li>
                ),
              )}
          </React.Fragment>
        ) : (
          '--'
        )}
      </ul>
    </>
  );
};

const Contact: React.FC<{ patientUuid: string; deceased?: boolean }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { isLoading: isLoadingAttributes, contactAttributes } = usePatientContactAttributes(patientUuid);

  const contacts = useMemo(
    () =>
      contactAttributes
        ? [
            ...contactAttributes?.map((contact) => [
              t(contact.attributeType.display, contact.attributeType.display),
              contact.value,
            ]),
          ]
        : [],
    [contactAttributes],
  );

  return (
    <>
      <p className={styles.heading}>{t('contactDetails', 'Contact Details')}</p>
      {isLoadingAttributes ? (
        <InlineLoading description={`${t('loading', 'Loading')} ...`} role="progressbar" />
      ) : (
        <ul>
          {contacts.length ? (
            contacts.map(([label, value], index) => (
              <li key={`${label}-${value}-${index}`}>
                {label}: {value}
              </li>
            ))
          ) : (
            <li>--</li>
          )}
        </ul>
      )}
    </>
  );
};

const Relationships: React.FC<{ patientId: string }> = ({ patientId }) => {
  const { t } = useTranslation();
  const { data: relationships, isLoading } = useRelationships(patientId);

  return (
    <>
      <p className={styles.heading}>{t('relationships', 'Relationships')}</p>
      {isLoading ? (
        <InlineLoading description={`${t('loading', 'Loading')} ...`} role="progressbar" />
      ) : (
        <ul>
          {relationships?.length > 0 ? (
            <>
              {relationships.map((r) => (
                <li key={r.uuid} className={styles.relationship}>
                  <div>{r.display}</div>
                  <div>{r.relationshipType}</div>
                  <div>
                    {`${r.relativeAge ? r.relativeAge : '--'} ${
                      r.relativeAge ? (r.relativeAge === 1 ? 'yr' : 'yrs') : ''
                    }`}
                  </div>
                </li>
              ))}
            </>
          ) : (
            <li>--</li>
          )}
        </ul>
      )}
    </>
  );
};

const ContactDetails: React.FC<ContactDetailsProps> = ({ patientId, deceased }) => {
  return (
    <div className={classNames(deceased && styles.deceased, styles.contactDetails)}>
      <div className={styles.row}>
        <div className={styles.col}>
          <Address patientId={patientId} />
        </div>
        <div className={styles.col}>
          <Contact patientUuid={patientId} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Relationships patientId={patientId} />
        </div>
        <div className={styles.col}>
          <PatientLists patientUuid={patientId} />
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
