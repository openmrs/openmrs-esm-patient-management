import React from 'react';
import { Autosuggest } from './autosuggest.component';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPersons = [
  {
    uuid: 'randomuuid1',
    display: 'John Doe',
  },
  {
    uuid: 'randomuuid2',
    display: 'John Smith',
  },
  {
    uuid: 'randomuuid3',
    display: 'James Smith',
  },
  {
    uuid: 'randomuuid4',
    display: 'Spider Man',
  },
];

const mockedGetSearchResults = async (query: string) => {
  return mockPersons.filter((person) => {
    return person.display.toUpperCase().includes(query.toUpperCase());
  });
};

const mockedHandleSuggestionSelected = jest.fn((field, value) => [field, value]);

describe('Autosuggest', () => {
  afterEach(() => mockedHandleSuggestionSelected.mockClear());

  it('renders a search box', () => {
    renderAutosuggest();

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('renders matching search results in a list when the user types a query', async () => {
    const user = userEvent.setup();

    renderAutosuggest();

    const searchbox = screen.getByRole('searchbox');
    await user.type(searchbox, 'john');

    const list = screen.getByRole('list');

    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(2);
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('John Doe');
    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('John Smith');
  });

  it('clears the list of suggestions when a suggestion is selected', async () => {
    const user = userEvent.setup();

    renderAutosuggest();

    let list = screen.queryByRole('list');
    expect(list).toBeNull();

    const searchbox = screen.getByRole('searchbox');
    await user.type(searchbox, 'john');

    list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    const listitems = screen.getAllByRole('listitem');
    await user.click(listitems[0]);

    expect(mockedHandleSuggestionSelected).toHaveBeenLastCalledWith('person', 'randomuuid1');

    list = screen.queryByRole('list');
    expect(list).toBeNull();
  });

  it('changes suggestions when a search input is changed', async () => {
    const user = userEvent.setup();

    renderAutosuggest();

    let list = screen.queryByRole('list');
    expect(list).toBeNull();

    const searchbox = screen.getByRole('searchbox');
    await user.type(searchbox, 'john');

    const suggestion = await screen.findByText('John Doe');
    expect(suggestion).toBeInTheDocument();

    await user.clear(searchbox);

    list = screen.queryByRole('list');
    expect(list).toBeNull();
  });

  it('hides the list of suggestions when the user clicks outside of the component', async () => {
    const user = userEvent.setup();

    renderAutosuggest();

    const input = screen.getByRole('searchbox');

    await user.type(input, 'john');
    await screen.findByText('John Doe');
    await user.click(document.body);

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});

function renderAutosuggest() {
  render(
    <BrowserRouter>
      <Autosuggest
        getSearchResults={mockedGetSearchResults}
        getDisplayValue={(item) => item.display}
        getFieldValue={(item) => item.uuid}
        id="person"
        labelText=""
        onSuggestionSelected={mockedHandleSuggestionSelected}
        placeholder="Find Person"
      />
    </BrowserRouter>,
  );
}
