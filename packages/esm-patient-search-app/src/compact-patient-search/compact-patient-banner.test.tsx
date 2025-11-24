import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { configSchema, type PatientSearchConfig } from '../config-schema';
import { PatientSearchContext } from '../patient-search-context';
import CompactPatientBanner from './compact-patient-banner.component';

const mockUseConfig = jest.mocked(useConfig<PatientSearchConfig>);

const birthDate = '1990-01-01';

const patients: fhir.Patient[] = [
  {
    resourceType: 'Patient',
    id: 'test-patient-uuid',
    identifier: [
      {
        system: `${restBaseUrl}/patientidentifiertype/05a29f94-c0ed-11e2-94be-8c13b969e334`,
        value: '1000NLY',
        type: {
          text: 'OpenMRS ID',
        },
      },
    ],
    name: [
      {
        family: 'Smith',
        given: ['John', 'Doe'],
        text: 'Smith, John Doe',
      },
    ],
    gender: 'male',
    birthDate,
    active: true,
  },
];

describe('CompactPatientBanner', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
  });

  it('renders a compact patient banner', () => {
    render(
      <PatientSearchContext.Provider value={{}}>
        <CompactPatientBanner patients={patients} />
      </PatientSearchContext.Provider>,
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('handles an array of valid patients', () => {
    const multiplePatients: fhir.Patient[] = [
      ...patients,
      {
        ...patients[0],
        id: 'test-patient-uuid-2',
        name: [
          {
            family: 'Doe',
            given: ['Jane'],
            text: 'Doe, Jane',
          },
        ],
      },
    ];

    render(
      <PatientSearchContext.Provider value={{}}>
        <CompactPatientBanner patients={multiplePatients} />
      </PatientSearchContext.Provider>,
    );

    expect(screen.getAllByText('Patient Photo')).toHaveLength(2);
  });

  it('renders empty state when patients array is empty', () => {
    render(
      <PatientSearchContext.Provider value={{}}>
        <CompactPatientBanner patients={[]} />
      </PatientSearchContext.Provider>,
    );

    expect(screen.queryByText('Patient Photo')).not.toBeInTheDocument();
  });
});
