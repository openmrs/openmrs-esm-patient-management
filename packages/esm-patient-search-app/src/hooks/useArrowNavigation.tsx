import { useEffect, useState, useCallback } from 'react';

const useArrowNavigation = (totalResults, enterCallback, initalFocussedResult = -1) => {
  const [focussedResult, setFocussedResult] = useState(-1);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'ArrowUp') {
        setFocussedResult((prev) => Math.max(-1, prev - 1));
      }
      if (e.key === 'ArrowDown') {
        setFocussedResult((prev) => Math.min(totalResults - 1, prev + 1));
      }
      if (e.key === 'Enter' && focussedResult > -1) {
        enterCallback(e, focussedResult);
      }
    },
    [setFocussedResult, totalResults, focussedResult, enterCallback],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  });

  return focussedResult;
};

export default useArrowNavigation;
