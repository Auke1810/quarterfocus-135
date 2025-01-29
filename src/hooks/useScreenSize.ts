import { useState, useEffect } from 'react';

const MAX_HEIGHT = 800; // Maximum hoogte in pixels
const MIN_HEIGHT = 400; // Minimum hoogte in pixels
const MIN_WIDTH = 400;  // Minimum breedte in pixels

interface Size {
  width: number;
  height: number;
}

export const useScreenSize = (): Size => {
  const [size, setSize] = useState<Size>({
    width: 400,
    height: 600
  });

  const calculateSize = () => {
    const width = Math.max(MIN_WIDTH, window.innerWidth);
    const height = Math.max(MIN_HEIGHT, Math.min(window.innerHeight, MAX_HEIGHT));
    return { width, height };
  };

  useEffect(() => {
    const handleResize = () => {
      setSize(calculateSize());
    };

    // Initial calculation
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
};
