import React from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from '@/components/Menu';
import { LoginButton } from '@/components/auth/LoginButton';
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
      <header className="px-4 py-2 border-b flex justify-between items-center shrink-0">
        <Menu />
        <LoginButton />
      </header>
      
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};
