import { useEffect, useState } from 'react';

export const useSearchParams = () => {
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const updateSearchParams = () => setSearchParams(new URLSearchParams(window.location.search));
    window.addEventListener('popstate', updateSearchParams);
    return () => window.removeEventListener('popstate', updateSearchParams);
  }, []);

  return searchParams;
};
