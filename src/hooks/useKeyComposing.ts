import { useCallback, useState } from 'react';

const useKeyComposing = () => {
  const [isComposing, setIsComposing] = useState(false);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  return { isComposing, handleCompositionStart, handleCompositionEnd };
};

export default useKeyComposing;
