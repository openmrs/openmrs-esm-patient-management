import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithSwr } from '../../../../tools/test-helpers';
import ContactDetails from './contact-details.component';
import * as usePatientContactAttributeMock from './hooks/usePatientAttributes';

let testProps = {
  address: [
    {
      city: 'City9564',
      country: 'Country9564',
      id: '0000',
      postalCode: '18156',
      state: 'State9564',
      use: 'home',
    },
  ],
  contact: [{ value: '+0123456789' }],
  patientId: '1111',
};

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

describe('ContactDetails: ', () => {
  it("renders the patient's address and contact details when available", async () => {
    spyOn(usePatientContactAttributeMock, 'usePatientContactAttributes').and.returnValue({
      isLoading: false,
      ContactDetails: personAttributeMock,
    });

    renderContactDetails();

    expect(screen.getByText(/Place Of Residence/i)).toBeInTheDocument();
    expect(screen.getByText(/City9564/)).toBeInTheDocument();
    expect(screen.getByText(/Country9564/)).toBeInTheDocument();
    expect(screen.getByText(/18156/)).toBeInTheDocument();
    expect(screen.getByText(/State9564/)).toBeInTheDocument();
    expect(screen.getByText(/Contact Details/i)).toBeInTheDocument();
    expect(screen.getByText(/0123456789/)).toBeInTheDocument();
  });

  it('renders an empty stateview when address and contact details is not available', () => {
    spyOn(usePatientContactAttributeMock, 'usePatientAttributes').and.returnValue({
      isLoading: false,
      ContactDetails: [],
    });

    testProps = {
      address: null,
      contact: null,
      patientId: 'some-uuid',
    };

    renderContactDetails();

    expect(screen.getByText(/Place Of Residence/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Details/i)).toBeInTheDocument();
    expect(screen.getAllByText('--').length).toBe(2);
  });
});

function renderContactDetails() {
  renderWithSwr(<ContactDetails {...testProps} />);
}
