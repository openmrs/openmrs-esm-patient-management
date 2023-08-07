import React from 'react';
import { v4 } from 'uuid';
import { FormValues } from '../../patient-registration-types';
import styles from './../input.scss';

interface DummyDataInputProps {
  setValues(values: FormValues, shouldValidate?: boolean): void;
}

export const dummyFormValues: FormValues = {
  patientUuid: v4(),
  givenName: 'John',
  middleName: '',
  familyName: 'Smith',
  additionalGivenName: 'Joey',
  additionalMiddleName: '',
  additionalFamilyName: 'Smitty',
  addNameInLocalLanguage: true,
  gender: 'Male',
  birthdate: new Date(2020, 1, 1) as any,
  yearsEstimated: 1,
  monthsEstimated: 2,
  birthdateEstimated: true,
  telephoneNumber: '0800001066',
  isDead: false,
  deathDate: '',
  deathCause: '',
  relationships: [],
  address: {
    address1: 'Bom Jesus Street',
    address2: '',
    cityVillage: 'Recife',
    stateProvince: 'Pernambuco',
    country: 'Brazil',
    postalCode: '50030-310',
  },
  identifiers: {},
};

export const DummyDataInput: React.FC<DummyDataInputProps> = ({ setValues }) => {
  return (
    <main>
      <button
        onClick={() => setValues(dummyFormValues)}
        className={`omrs-btn omrs-filled-neutral ${styles.dummyData}`}
        type="button"
        aria-label="Dummy Data Input">
        Input Dummy Data
      </button>
    </main>
  );
};
