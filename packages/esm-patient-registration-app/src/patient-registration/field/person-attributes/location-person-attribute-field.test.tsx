import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { Formik, useFormikContext } from 'formik';
import { openmrsFetch } from '@openmrs/esm-framework';
import { LocationPersonAttributeField } from './location-person-attribute-field.component';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const personAttributeType = {
  uuid: 'health-center-attribute-type-uuid',
  display: 'Health Center',
  name: 'Health Center',
  description: 'Health center where the patient is registered',
  format: 'org.openmrs.Location',
};

const savedLocation = { uuid: 'kisumu-uuid', display: 'Kisumu Clinic' };

// The saved location sorts after the ten locations returned when there is no search query
const firstPage = Array.from({ length: 10 }, (_, index) => ({ id: `location-${index}`, name: `Amani Ward ${index}` }));
const allLocations = [
  ...firstPage,
  { id: 'kisumu-uuid', name: 'Kisumu Clinic' },
  { id: 'kitale-uuid', name: 'Kitale Clinic' },
];

function AttributeValue() {
  const { values } = useFormikContext<{ attributes: Record<string, unknown> }>();
  return (
    <output data-testid="attribute-value">{JSON.stringify(values.attributes[personAttributeType.uuid] ?? null)}</output>
  );
}

function getAttributeValue() {
  return JSON.parse(screen.getByTestId('attribute-value').textContent ?? 'null');
}

function locationsResponse(url: string) {
  const query = new URL(url, 'http://localhost/').searchParams.get('name:contains');
  const matches = query
    ? allLocations.filter(({ name }) => name.toLowerCase().includes(query.toLowerCase()))
    : firstPage;
  return { data: { entry: matches.map((resource) => ({ resource })) } };
}

function renderField(initialValue: unknown = savedLocation) {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <Formik initialValues={{ attributes: { [personAttributeType.uuid]: initialValue } }} onSubmit={() => {}}>
        <>
          <LocationPersonAttributeField
            id="healthCenter"
            label="Health Center"
            locationTag="Login Location"
            personAttributeType={personAttributeType}
          />
          <AttributeValue />
          <button type="button">Next field</button>
        </>
      </Formik>
    </SWRConfig>,
  );
}

describe('LocationPersonAttributeField', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockImplementation(((url: string) =>
      Promise.resolve(locationsResponse(url))) as unknown as typeof openmrsFetch);
  });

  it('displays a saved location that is not in the first page of results', async () => {
    renderField();

    await waitFor(() => expect(screen.getByRole('combobox', { name: /health center/i })).toHaveValue('Kisumu Clinic'));
    expect(getAttributeValue()).toEqual(savedLocation);
  });

  it('lists a saved location that is not in the first page of results', async () => {
    const user = userEvent.setup();
    renderField();

    await waitFor(() => expect(screen.getByRole('combobox', { name: /health center/i })).toHaveValue('Kisumu Clinic'));
    await user.click(screen.getByRole('button', { name: /open/i }));

    expect(await screen.findByRole('option', { name: 'Kisumu Clinic' })).toBeInTheDocument();
  });

  it('keeps the saved location when Enter is pressed on a search that matches no option', async () => {
    const user = userEvent.setup();
    renderField();

    const combobox = screen.getByRole('combobox', { name: /health center/i });
    await waitFor(() => expect(combobox).toHaveValue('Kisumu Clinic'));

    // The search returns locations containing "Clinic", but none of them start with it
    await user.clear(combobox);
    await user.type(combobox, 'Clinic');
    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledWith(expect.stringContaining('Clinic')));
    await user.keyboard('{Enter}');

    await waitFor(() => expect(combobox).toHaveValue('Kisumu Clinic'));
    expect(getAttributeValue()).toEqual(savedLocation);
  });

  it('selects the matching location when Enter is pressed after typing its start', async () => {
    // Search results arrive after the user has finished typing, as they do behind the search debounce
    const pendingSearches: Array<() => void> = [];
    mockOpenmrsFetch.mockImplementation(((url: string) =>
      url.includes('name%3Acontains')
        ? new Promise((resolve) => pendingSearches.push(() => resolve(locationsResponse(url))))
        : Promise.resolve(locationsResponse(url))) as unknown as typeof openmrsFetch);
    const user = userEvent.setup();
    renderField();

    const combobox = screen.getByRole('combobox', { name: /health center/i });
    await waitFor(() => expect(combobox).toHaveValue('Kisumu Clinic'));

    await user.clear(combobox);
    await user.type(combobox, 'Kit');
    act(() => pendingSearches.forEach((respond) => respond()));
    await screen.findByRole('option', { name: 'Kitale Clinic' });
    await user.keyboard('{Enter}');

    await waitFor(() => expect(getAttributeValue()).toEqual({ uuid: 'kitale-uuid', display: 'Kitale Clinic' }));
    expect(combobox).toHaveValue('Kitale Clinic');
  });

  it('keeps the saved location while searching without selecting another one', async () => {
    const user = userEvent.setup();
    renderField();

    const combobox = screen.getByRole('combobox', { name: /health center/i });
    await waitFor(() => expect(combobox).toHaveValue('Kisumu Clinic'));

    await user.clear(combobox);
    await user.type(combobox, 'Amani');
    await screen.findByRole('option', { name: 'Amani Ward 3' });
    expect(getAttributeValue()).toEqual(savedLocation);

    // Leaving the field restores the saved label, and leaving it again keeps the saved value
    await user.click(screen.getByRole('button', { name: 'Next field' }));
    await waitFor(() => expect(combobox).toHaveValue('Kisumu Clinic'));
    await user.click(combobox);
    await user.click(screen.getByRole('button', { name: 'Next field' }));

    expect(combobox).toHaveValue('Kisumu Clinic');
    expect(getAttributeValue()).toEqual(savedLocation);
  });

  it('updates the value when another location is selected', async () => {
    const user = userEvent.setup();
    renderField();

    const combobox = screen.getByRole('combobox', { name: /health center/i });
    await waitFor(() => expect(combobox).toHaveValue('Kisumu Clinic'));

    await user.clear(combobox);
    await user.type(combobox, 'Kitale');
    await user.click(await screen.findByRole('option', { name: 'Kitale Clinic' }));

    const kitale = { uuid: 'kitale-uuid', display: 'Kitale Clinic' };
    await waitFor(() => expect(getAttributeValue()).toEqual(kitale));
    expect(combobox).toHaveValue('Kitale Clinic');

    // Searches that don't return the selected location keep it selected
    await user.clear(combobox);
    await user.type(combobox, 'Amani');
    await screen.findByRole('option', { name: 'Amani Ward 3' });
    await user.click(screen.getByRole('button', { name: 'Next field' }));

    await waitFor(() => expect(combobox).toHaveValue('Kitale Clinic'));
    expect(getAttributeValue()).toEqual(kitale);
  });

  it('removes the value when the field is explicitly cleared', async () => {
    const user = userEvent.setup();
    renderField();

    const combobox = screen.getByRole('combobox', { name: /health center/i });
    await waitFor(() => expect(combobox).toHaveValue('Kisumu Clinic'));

    await user.click(screen.getByRole('button', { name: /clear selected item/i }));

    await waitFor(() => expect(getAttributeValue()).toBeNull());
    expect(combobox).toHaveValue('');
  });
});
