import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactDetails from './contact-details.component';
import { useRelationships } from './relationships.resource';
import { usePatientContactAttributes } from '../hooks/usePatientAttributes';
import { mockAddress } from '../../../../__mocks__/address.mock';

const mockUseRelationships = useRelationships as jest.Mock;
const mockUsePatientContactAttributes = usePatientContactAttributes as jest.Mock;

const mockContactAttributes = [
  { attributeType: { display: 'Email' }, value: 'test@example.com', uuid: '24252571-dd5a-11e6-9d9c-0242ac152222' },
];

const mockRelationships = [
  {
    uuid: '24252571-dd5a-11e6-9d9c-0242ac150002',
    display: 'John Doe',
    relationshipType: 'Family',
    relativeAge: 30,
  },
];

jest.mock('./relationships.resource');
jest.mock('../hooks/usePatientAttributes');

mockUsePatientContactAttributes.mockReturnValue({
  isLoading: false,
  contactAttributes: mockContactAttributes,
});

mockUseRelationships.mockReturnValue({ isLoading: false, data: mockRelationships });

describe('ContactDetails', () => {
  beforeEach(() => {
    mockUsePatientContactAttributes.mockReturnValue({
      isLoading: false,
      contactAttributes: mockContactAttributes,
    });

    mockUseRelationships.mockReturnValue({ isLoading: false, data: mockRelationships });
  });
  it('renders address', () => {
    render(<ContactDetails address={[mockAddress]} patientId="123" isDeceased={false} />);

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('renders contact attributes', async () => {
    render(<ContactDetails address={[]} patientId="123" isDeceased={false} />);

    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getByText('Email : test@example.com'));
  });

  it('renders relationships', async () => {
    render(<ContactDetails address={[]} patientId="123" isDeceased={false} />);

    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders skeleton when loading', async () => {
    mockUsePatientContactAttributes.mockReturnValue({
      isLoading: true,
      contactAttributes: [],
    });

    mockUseRelationships.mockReturnValue({ isLoading: true, data: [] });

    render(<ContactDetails address={[]} patientId="123" isDeceased={false} />);

    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Email : test@example.com')).not.toBeInTheDocument();
  });
});
