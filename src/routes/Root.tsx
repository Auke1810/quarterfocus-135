import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useScreenSize } from '@/hooks/useScreenSize';

export const Root = () => {
  const { width, height } = useScreenSize();

  return (
    <div 
      className="bg-background text-foreground flex flex-col" 
      style={{ 
        width: `${width}px`,
        height: `${height}px`,
        transition: 'width 0.2s, height 0.2s'
      }}
    >
      <Header />
      
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};
