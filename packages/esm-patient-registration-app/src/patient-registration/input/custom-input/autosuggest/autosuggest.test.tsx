import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from 'tools';
import { Autosuggest } from './autosuggest.component';

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

const mockGetSearchResults = async (query: string) => {
  return mockPersons.filter((person) => {
    return person.display.toUpperCase().includes(query.toUpperCase());
  });
};

/**
 * Helper to render Autosuggest component.
 */
function renderAutosuggest(
  props: {
    id?: string;
    labelText?: string;
    placeholder?: string;
    onSuggestionSelected?: (field: string, value: string) => void;
    getSearchResults?: (query: string) => Promise<Array<{ uuid: string; display: string }>>;
  } = {},
) {
  const defaultProps = {
    id: 'person',
    labelText: '',
    placeholder: 'Find Person',
    onSuggestionSelected: jest.fn(),
    getSearchResults: mockGetSearchResults,
    getDisplayValue: (item: { display: string }) => item.display,
    getFieldValue: (item: { uuid: string }) => item.uuid,
    ...props,
  };

  return renderWithRouter(<Autosuggest<{ display: string; uuid: string }> {...defaultProps} />);
}

describe('Autosuggest component', () => {
  describe('Rendering', () => {
    it('renders a search box', () => {
      renderAutosuggest();

      expect(screen.getByRole('searchbox')).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('renders with custom label text', () => {
      renderAutosuggest({ labelText: 'Search Person' });

      expect(screen.getByLabelText('Search Person')).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('renders matching search results when user types a query', async () => {
      const user = userEvent.setup();
      renderAutosuggest();

      const searchbox = screen.getByRole('searchbox');
      await user.type(searchbox, 'john');

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getAllByRole('listitem').length).toBe(2);
      });

      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('John Doe');
      expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('John Smith');
    });

    it('updates suggestions when search input changes', async () => {
      const user = userEvent.setup();
      renderAutosuggest();

      const searchbox = screen.getByRole('searchbox');

      // Type "john" - should show 2 results
      await user.type(searchbox, 'john');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.getByText('John Smith')).toBeInTheDocument();

      // Clear and type "james" - should show 1 result
      await user.clear(searchbox);
      await user.type(searchbox, 'james');

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('James Smith')).toBeInTheDocument();
      });
    });

    it('hides suggestions when search input is cleared', async () => {
      const user = userEvent.setup();
      renderAutosuggest();

      const searchbox = screen.getByRole('searchbox');
      await user.type(searchbox, 'john');

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument();
      });

      await user.clear(searchbox);

      await waitFor(() => {
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
    });
  });

  describe('Suggestion selection', () => {
    it('calls onSuggestionSelected when user clicks a suggestion', async () => {
      const user = userEvent.setup();
      const mockOnSuggestionSelected = jest.fn();
      renderAutosuggest({ onSuggestionSelected: mockOnSuggestionSelected });

      const searchbox = screen.getByRole('searchbox');
      await user.type(searchbox, 'john');

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument();
      });

      const listitems = screen.getAllByRole('listitem');
      await user.click(listitems[0]);

      expect(mockOnSuggestionSelected).toHaveBeenCalledWith('person', 'randomuuid1');
    });

    it('clears the suggestions list when a suggestion is selected', async () => {
      const user = userEvent.setup();
      renderAutosuggest();

      const searchbox = screen.getByRole('searchbox');
      await user.type(searchbox, 'john');

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument();
      });

      const listitems = screen.getAllByRole('listitem');
      await user.click(listitems[0]);

      await waitFor(() => {
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
    });
  });

  describe('Click outside behavior', () => {
    it('hides suggestions when user clicks outside the component', async () => {
      const user = userEvent.setup();
      renderAutosuggest();

      const input = screen.getByRole('searchbox');
      await user.type(input, 'john');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      await user.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });
  });
});
