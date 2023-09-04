import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Pagination from './pagination.component';

describe('Pagination', () => {
  it('should render correctly with page numbers', () => {
    render(<Pagination totalPages={5} currentPage={3} setCurrentPage={() => {}} hasMore={true} />);

    for (let i = 1; i <= 5; i++) {
      const pageButtons = screen.getByRole('button', { name: `${i}` });
      expect(pageButtons).toBeInTheDocument();
    }
  });

  it('should disable previous button on first page', () => {
    render(<Pagination totalPages={5} currentPage={1} setCurrentPage={() => {}} hasMore={true} />);
    const previousButton = screen.getByLabelText(/previous page/i);
    expect(previousButton).toBeDisabled();
  });

  it('should disable next button on last page when hasMore is false', () => {
    render(<Pagination totalPages={5} currentPage={5} setCurrentPage={() => {}} hasMore={false} />);
    const nextButton = screen.getByLabelText(/next page/i);
    expect(nextButton).toBeDisabled();
  });

  it('should increment the page when next button is clicked', () => {
    const setCurrentPageMock = jest.fn();
    render(<Pagination totalPages={5} currentPage={1} setCurrentPage={setCurrentPageMock} hasMore={true} />);

    const nextButton = screen.getByLabelText(/next page/i);
    fireEvent.click(nextButton);
    expect(setCurrentPageMock).toHaveBeenCalledWith(2);
  });

  it('should decrement the page when previous button is clicked', () => {
    const setCurrentPageMock = jest.fn();
    render(<Pagination totalPages={5} currentPage={3} setCurrentPage={setCurrentPageMock} hasMore={true} />);

    const previousButton = screen.getByLabelText(/previous page/i);
    fireEvent.click(previousButton);
    expect(setCurrentPageMock).toHaveBeenCalledWith(2);
  });

  it('should call setCurrentPage when page button is clicked', () => {
    const setCurrentPageMock = jest.fn();
    render(<Pagination totalPages={5} currentPage={3} setCurrentPage={setCurrentPageMock} hasMore={true} />);

    const pageButton = screen.getByRole('button', { name: '4' });
    fireEvent.click(pageButton);
    expect(setCurrentPageMock).toHaveBeenCalledWith(4);
  });

  it('should render empty component when totalPages is 1', () => {
    render(<Pagination totalPages={1} currentPage={1} setCurrentPage={() => {}} hasMore={true} />);
    const pagination = screen.queryByRole('button', { name: 'next page' });
    expect(pagination).not.toBeInTheDocument();
  });
});
