import React from 'react';
import { render, screen } from '@testing-library/react';
import CompactPatientBanner from './compact-patient-banner.component';
import { defineConfigSchema, getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type SearchedPatient } from '../types';
import { PatientSearchContext } from '../patient-search-context';
import { configSchema } from '../config-schema';

defineConfigSchema('@openmrs/esm-patient-search-app', configSchema);

const mockedUseConfig = jest.mocked(useConfig);
const patients: Array<SearchedPatient> = [
  {
    attributes: [],
    identifiers: [
      {
        display: 'OpenMRS ID = 1000NLY',
        uuid: '19e98c23-d26f-4668-8810-00da0e10e326',
        identifier: '1000NLY',
        identifierType: {
          uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
          display: 'OpenMRS ID',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/patientidentifiertype/05a29f94-c0ed-11e2-94be-8c13b969e334',
              resourceAlias: 'patientidentifiertype',
            },
          ],
        },
        location: {
          uuid: '44c3efb0-2583-4c80-a79e-1f756a03c0a1',
          display: 'Outpatient Clinic',
        },
      },
    ],
    person: {
      age: 34,
      addresses: [],
      birthdate: '1990-01-01',
      dead: false,
      deathDate: null,
      gender: 'M',
      personName: {
        display: 'John Doe Smith',
        givenName: 'John',
        middleName: 'Doe',
        familyName: 'Smith',
      },
    },
    uuid: 'test-patient-uuid',
  },
];

describe('CompactPatientBanner', () => {
  beforeEach(() => mockedUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema)));

  it('renders a compact patient banner', () => {
    render(
      <PatientSearchContext.Provider value={{}}>
        <CompactPatientBanner patients={patients} />
      </PatientSearchContext.Provider>,
    );

    expect(
      screen.getByRole('link', { name: /John Doe Smith Male · 34 yrs · OpenMRS ID 1000NLY/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', `/openmrs/spa/patient/${patients[0].uuid}/chart/`);
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /John Doe Smith/ })).toBeInTheDocument();
  });
});
