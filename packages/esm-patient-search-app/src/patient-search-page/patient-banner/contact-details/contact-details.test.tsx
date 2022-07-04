import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import ContactDetails from './contact-details.component';
import * as usePatientContactAttributeMock from '../hooks/usePatientAttributes';

const testProps = {
  address: [
    {
      city: 'Foo',
      country: 'Bar',
      id: '0000',
      postalCode: '00100',
      state: 'Quux',
      use: 'home',
    },
  ],
  telecom: [{ value: '+0123456789' }],
  patientId: '1111',
};

const mockRelationships = [
  {
    display: 'Amanda is the Sibling of John',
    uuid: '993bc79d-5ca5-4c76-b4b3-adf49e25bd0b',
    personA: {
      uuid: '07006bcb-91d4-4c57-a5f7-49751899d9b5',
      display: '100ADT - Amanda Robinson',
      person: {
        age: 24,
        display: 'Amanda Robinson',
      },
    },
    personB: {
      uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
      display: '100GEJ - John Wilson',
      person: {
        age: 49,
        display: 'John Wilson',
      },
    },
    relationshipType: {
      uuid: '8d91a01c-c2cc-11de-8d13-0010c6dffd0f',
      display: 'Sibling/Sibling',
      description: 'Relationship between brother/sister, brother/brother, and sister/sister',
      aIsToB: 'Sibling',
      bIsToA: 'Sibling',
    },
  },
];

const personAttributeMock = [
  {
    display: 'Next of Kin Contact Phone Number = 0000000000',
    uuid: '1de1ac71-68e8-4a08-a7e2-5042093d4e46',
    value: '0700-000-000',
    attributeType: {
      uuid: 'a657a4f1-9c0f-444b-a1fd-445bb91dd12d',
      display: 'Next of Kin Contact Phone Number',
    },
  },
];

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('ContactDetails: ', () => {
  it('renders an empty state view when relationships data is not available', async () => {
    spyOn(usePatientContactAttributeMock, 'usePatientContactAttributes').and.returnValue({
      isLoading: false,
      contactAttributes: personAttributeMock,
    });
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderContactDetails();

    await waitForLoadingToFinish();

    screen.findByText('Relationships');
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it("renders the patient's address, contact details and relationships when available", async () => {
    spyOn(usePatientContactAttributeMock, 'usePatientContactAttributes').and.returnValue({
      isLoading: false,
      contactAttributes: personAttributeMock,
    });
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockRelationships } });

    renderContactDetails();

    await waitForLoadingToFinish();

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText(/Amanda Robinson/)).toBeInTheDocument();
    expect(screen.getByText(/Sibling/i)).toBeInTheDocument();
    expect(screen.getByText(/24 yrs/i)).toBeInTheDocument();
    expect(screen.getByText(/Next of Kin Contact Phone Number/i)).toBeInTheDocument();
    expect(screen.getByText(/0700-000-000/)).toBeInTheDocument();
  });

  it('renders an empty state view when address and contact details is not available', () => {
    renderWithSwr(<ContactDetails address={null} telecom={null} patientId={'some-uuid'} />);
    spyOn(usePatientContactAttributeMock, 'usePatientContactAttributes').and.returnValue({
      isLoading: false,
      contactAttributes: [],
    });
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getAllByText('--').length).toBe(2);
  });
});

function renderContactDetails() {
  renderWithSwr(<ContactDetails {...testProps} />);
}
